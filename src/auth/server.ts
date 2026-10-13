import { getServerSession } from "next-auth";
import { authOptions } from "@/auth/options";
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return null;
  }

  const user = await db.query.users.findFirst({
    where: eq(users.email, session.user.email),
  });

  return user;
}

export async function isAuthenticated() {
  const session = await getServerSession(authOptions);
  return !!session?.user?.email;
}

export async function getCurrentSession() {
  return await getServerSession(authOptions);
}
