"use server";

import { getCurrentUser } from "@/auth/server";
import { posts } from "@/db/schema";
import { db } from "@/lib/db";
import { createPostValidator } from "@/validators/create-post-validator";
import { revalidatePath } from "next/cache";

interface CreatePostState {
  errors?: Record<string, string[]>;
  success?: boolean;
}

export async function createPost(prevState: CreatePostState | undefined, formData: FormData): Promise<CreatePostState> {
  const validatedFields = createPostValidator.safeParse({
    description: formData.get("description"),
    role: formData.get("role"),
    region: formData.get("region"),
    rank: formData.get("rank"),
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
