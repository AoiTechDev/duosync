'use server'

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
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

    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1);

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
  username: z.string().min(3).max(50).optional(),
  summonerName: z.string().max(100).optional(),
  region: z.enum(['NA1', 'EUW1', 'EUN1', 'KR', 'BR1', 'LA1', 'LA2', 'OC1', 'RU', 'TR1', 'JP1']).optional(),
  bio: z.string().max(500).optional(),
});

export async function updateUserProfile(formData: FormData) {
  try {
    const user = await requireAuth();
    
    const validatedFields = updateUserSchema.parse({
      username: formData.get('username'),
      summonerName: formData.get('summonerName'),
      region: formData.get('region'),
      bio: formData.get('bio'),
    });

    await db
      .update(users)
      .set({
        ...validatedFields,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    // Redirect back to profile page on success
    redirect("/profile");
  } catch (error) {
    console.error("Update user profile error:", error);
    throw new Error("Failed to update profile");
  }
} 