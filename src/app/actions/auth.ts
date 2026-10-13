"use server";

import { getCurrentUser } from "@/auth/server";
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { regionSchema, usernameSchema } from "@/validators/profile-validator";

async function requireAuth() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

const updateUserSchema = z.object({
  username: usernameSchema,
  region: regionSchema,
  bio: z.string().trim().max(200, "At most 200 characters"),
});

export interface UpdateProfileState {
  errors?: Partial<Record<"username" | "region" | "bio" | "form", string>>;
}

export async function updateUserProfile(
  _prevState: UpdateProfileState,
  formData: FormData,
): Promise<UpdateProfileState> {
  const user = await requireAuth();

  const parsed = updateUserSchema.safeParse({
    username: formData.get("username") ?? "",
    region: formData.get("region") ?? "",
    bio: formData.get("bio") ?? "",
  });
  if (!parsed.success) {
    const errors: UpdateProfileState["errors"] = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as "username" | "region" | "bio";
      errors[field] ??= issue.message;
    }
    return { errors };
  }

  const { username, region, bio } = parsed.data;

  try {
    if (username !== user.username) {
      const [taken] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.username, username))
        .limit(1);
      if (taken) return { errors: { username: "That username is taken" } };
    }

    await db
      .update(users)
      .set({ username, region, bio: bio || null, updatedAt: new Date() })
      .where(eq(users.id, user.id));
  } catch (error) {
    console.error("Update user profile error:", error);
    return { errors: { form: "Couldn't save your profile. Try again." } };
  }

  revalidatePath("/profile");
  redirect("/profile");
}
