"use server";

import { getCurrentUser } from "@/auth/server";
import { posts } from "@/db/schema";
import { db } from "@/lib/db";
import { createFeedPostValidator } from "@/validators/create-feed-post";
import { revalidatePath } from "next/cache";

export async function createFeedPost(prevState: any, formData: FormData) {
  const validatedFields = createFeedPostValidator.safeParse({
    description: formData.get("description"),
    role: JSON.parse((formData.get("role") as string) || "null"),
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
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error(error);
    return {
      errors: {
        database: ["Failed to create post"],
      },
    };
  }
}
