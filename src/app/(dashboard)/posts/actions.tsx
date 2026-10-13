"use server";

import { getCurrentUser } from "@/auth/server";
import { posts } from "@/db/schema";
import { db } from "@/lib/db";
import { createPostValidator } from "@/validators/create-post-validator";
import { and, eq } from "drizzle-orm";
import { bumpAvailableAt, formatDuration, POST_TTL_MS } from "@/lib/post-lifecycle";
import { revalidatePath } from "next/cache";

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

  try {
    await db.insert(posts).values({
      description: validatedFields.data.description,
      authorId: user.id,
      rank: validatedFields.data.rank,
      region: validatedFields.data.region,
      role: validatedFields.data.role,
      gameMode: validatedFields.data.gameMode,
    });

    revalidatePath("/posts");
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

    revalidatePath("/posts");
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

    revalidatePath("/posts");
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

    revalidatePath("/posts");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to bump post" };
  }
}
