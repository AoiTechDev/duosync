"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth/options";
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export async function signInAction(provider: "google" | "discord") {
  redirect(`/api/auth/signin/${provider}`);
}

export async function signOutAction() {
  redirect("/api/auth/signout");
}

export async function getCurrentUser() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return null;
    }

    const user = await db.select().from(users).where(eq(users.email, session.user.email)).limit(1);

    return user[0] || null;
  } catch (error) {
    console.error("Get current user error:", error);
    return null;
  }
}

export async function requireAuth() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

const updateUserSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "At least 3 characters")
    .max(24, "At most 24 characters"),
  // Only regions the database's `region` enum accepts.
  region: z.enum(["NA1", "EUW1", "EUN1", "KR", "BR1", "LA1", "LA2"], { message: "Pick a region" }),
  bio: z.string().trim().max(200, "At most 200 characters"),
});

export interface UpdateProfileState {
  errors?: Partial<Record<"username" | "region" | "bio" | "form", string>>;
}

// Summoner name is not editable here: it comes from Riot verification.
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

  // Outside try/catch: redirect() works by throwing.
  revalidatePath("/profile");
  redirect("/profile");
}
