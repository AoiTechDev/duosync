import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import DiscordProvider from "next-auth/providers/discord";
import CredentialsProvider from "next-auth/providers/credentials";
import { getOrCreateDemoUser, isDemoLoginEnabled } from "./demo";
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { USERNAME_PATTERN, sanitizeUsernameInput } from "@/lib/username";

async function generateUsername(seed: string) {
  let base = sanitizeUsernameInput(seed).slice(0, 18);
  if (base.length < 3) base = `player${base}`;
  for (let attempt = 0; attempt < 10; attempt++) {
    const candidate = attempt === 0 ? base : `${base}_${Math.floor(1000 + Math.random() * 9000)}`;
    if (!USERNAME_PATTERN.test(candidate)) continue;
    const [taken] = await db.select({ id: users.id }).from(users).where(eq(users.username, candidate)).limit(1);
    if (!taken) return candidate;
  }
  return `player_${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`;
}

function hasVerifiedEmail(provider: string | undefined, profile: unknown) {
  const p = (profile ?? {}) as { email_verified?: boolean | string; verified?: boolean };
  if (provider === "google") return p.email_verified === true || p.email_verified === "true";
  if (provider === "discord") return p.verified === true;
  return false;
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID as string,
      clientSecret: process.env.DISCORD_CLIENT_SECRET as string,
      issuer: "https://discord.com",
    }),
    ...(isDemoLoginEnabled()
      ? [
          CredentialsProvider({
            id: "demo",
            name: "Demo player",
            credentials: {},
            async authorize() {
              if (!isDemoLoginEnabled()) return null;
              const demo = await getOrCreateDemoUser();
              return { id: demo.id, email: demo.email, name: demo.username, username: demo.username };
            },
          }),
        ]
      : []),
  ],
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "demo") {
        return isDemoLoginEnabled();
      }
      if (!user.email || !hasVerifiedEmail(account?.provider, profile)) {
        return false;
      }

      try {
        const existingUser = await db
          .select()
          .from(users)
          .where(eq(users.email, user.email))
          .limit(1);

        if (existingUser.length === 0) {
          await db.insert(users).values({
            email: user.email,
            username: await generateUsername(user.name || user.email.split("@")[0]),
            name: user.name,
            image: user.image,
          });
        }

        return true;
      } catch (error) {
        console.error("Error during sign in:", error);
        return false;
      }
    },
    async session({ session }) {
      if (session.user?.email) {
        const dbUser = await db
          .select()
          .from(users)
          .where(eq(users.email, session.user.email))
          .limit(1);

        if (dbUser.length > 0) {
          session.user.id = dbUser[0].id;
          session.user.username =
            dbUser[0].username || dbUser[0].name || dbUser[0].email?.split("@")[0] || "";
        }
      }
      return session;
    },
    async jwt({ token }) {
      // Store the DB user id once so lightweight routes can read it via getToken() without a query.
      if (!token.id && token.email) {
        const [dbUser] = await db
          .select({ id: users.id })
          .from(users)
          .where(eq(users.email, token.email))
          .limit(1);
        if (dbUser) token.id = dbUser.id;
      }
      return token;
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (url.startsWith(baseUrl)) return url;
      return `${baseUrl}/feed`;
    },
  },
  debug: process.env.NODE_ENV === "development",
};
