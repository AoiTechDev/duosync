"use server";

import { getCurrentUser } from "@/auth/server";
import { posts } from "@/db/schema";
import { db } from "@/lib/db";
import { createPostValidator } from "@/validators/create-post-validator";
import { and, count, eq, gt, sql } from "drizzle-orm";
import { rateLimit } from "@/lib/rate-limit";
import { bumpAvailableAt, formatDuration, POST_TTL_MS, POSTS_EXPIRE } from "@/lib/post-lifecycle";
import { revalidatePath } from "next/cache";

const MAX_LIVE_POSTS = 3;

interface CreatePostState {
  errors?: Record<string, string[]>;
  success?: boolean;
}

export async function createPost(
  prevState: CreatePostState | undefined,
  formData: FormData,
): Promise<CreatePostState> {
  const validatedFields = createPostValidator.safeParse({
    description: formData.get("description"),
    role: formData.get("role"),
    region: formData.get("region"),
    rank: formData.get("rank"),
    gameMode: formData.get("gameMode"),
  });

  if (!validatedFields.success) {
    const fieldErrors: Record<string, string[]> = {};
    validatedFields.error.issues.forEach((issue) => {
      const field = issue.path[0] as string;
      if (!fieldErrors[field]) {
        fieldErrors[field] = [issue.message];
      }
    });

    return { errors: fieldErrors };
  }

  const user = await getCurrentUser();

  if (!user) {
    throw new Error("You have to be logged in to create a post");
  }

  const limit = await rateLimit("createPost", user.id);
  if (!limit.ok) {
    return { errors: { database: [`Slow down, try again in ${limit.retryAfter}s`] } };
  }

  try {
    const [{ live }] = await db
      .select({ live: count() })
      .from(posts)
      .where(
        and(
          eq(posts.authorId, user.id),
          eq(posts.isActive, true),
          POSTS_EXPIRE ? gt(posts.expiresAt, sql`now()`) : undefined,
        ),
      );
    if (live >= MAX_LIVE_POSTS) {
      return {
        errors: {
          database: [
            POSTS_EXPIRE
              ? `You already have ${MAX_LIVE_POSTS} live posts. Bump or delete one first.`
              : `You can have up to ${MAX_LIVE_POSTS} posts. Delete one to post again.`,
          ],
        },
      };
    }

    await db.insert(posts).values({
      description: validatedFields.data.description,
      authorId: user.id,
      rank: validatedFields.data.rank,
      region: validatedFields.data.region,
      role: validatedFields.data.role,
      gameMode: validatedFields.data.gameMode,
      expiresAt: new Date(Date.now() + POST_TTL_MS),
    });

    revalidatePath("/feed");
    return { success: true };
  } catch (error) {
    console.error(error);
    return {
      errors: {
        database: ["Failed to create post"],
      },
    };
  }
}

export async function editPost(
  prevState: CreatePostState | undefined,
  formData: FormData,
): Promise<CreatePostState> {
  const postId = formData.get("postId") as string;

  if (!postId) {
    return {
      errors: {
        database: ["Post ID is required"],
      },
    };
  }

  const validatedFields = createPostValidator.safeParse({
    description: formData.get("description"),
    role: formData.get("role"),
    region: formData.get("region"),
    rank: formData.get("rank"),
    gameMode: formData.get("gameMode"),
  });

  if (!validatedFields.success) {
    const fieldErrors: Record<string, string[]> = {};
    validatedFields.error.issues.forEach((issue) => {
      const field = issue.path[0] as string;
      if (!fieldErrors[field]) {
        fieldErrors[field] = [issue.message];
      }
    });

    return { errors: fieldErrors };
  }

  const user = await getCurrentUser();

  if (!user) {
    throw new Error("You have to be logged in to edit a post");
  }

  try {
    await db
      .update(posts)
      .set({
        description: validatedFields.data.description,
        rank: validatedFields.data.rank,
        region: validatedFields.data.region,
        role: validatedFields.data.role,
        gameMode: validatedFields.data.gameMode,
        updatedAt: new Date(),
      })
      .where(and(eq(posts.id, postId), eq(posts.authorId, user.id), eq(posts.isActive, true)));

    revalidatePath("/feed");
    return { success: true };
  } catch (error) {
    console.error(error);
    return {
      errors: {
        database: ["Failed to update post"],
      },
    };
  }
}

export async function deletePost(postId: string): Promise<{ success: boolean; error?: string }> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "You have to be logged in to delete a post" };
  }

  try {
    const [deleted] = await db
      .update(posts)
      .set({ isActive: false, updatedAt: new Date() })
      .where(and(eq(posts.id, postId), eq(posts.authorId, user.id)))
      .returning({ id: posts.id });

    if (!deleted) return { success: false, error: "Post not found" };

    revalidatePath("/feed");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to delete post" };
  }
}

export async function bumpPost(postId: string): Promise<{ success: boolean; error?: string }> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "You have to be logged in to bump a post" };
  }

  try {
    const post = await db.query.posts.findFirst({
      where: and(eq(posts.id, postId), eq(posts.authorId, user.id), eq(posts.isActive, true)),
      columns: { bumpedAt: true },
    });
    if (!post) return { success: false, error: "Post not found" };

    const wait = bumpAvailableAt(post.bumpedAt) - Date.now();
    if (wait > 0) {
      return { success: false, error: `You can bump again in ${formatDuration(wait)}` };
    }

    const now = new Date();
    await db
      .update(posts)
      .set({ bumpedAt: now, expiresAt: new Date(now.getTime() + POST_TTL_MS), updatedAt: now })
      .where(eq(posts.id, postId));

    revalidatePath("/feed");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to bump post" };
  }
}
