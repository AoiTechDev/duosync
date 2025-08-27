import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import DiscordProvider from "next-auth/providers/discord";
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";


export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID as string,
      clientSecret: process.env.DISCORD_CLIENT_SECRET as string,
    }),
  ],
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ user }) {
      if (!user.email) {
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
            username: user.name || user.email.split("@")[0],
            name: user.name,
            image: user.image,
          });
          console.log("✅ New user created:", user.email);
        } else {
          console.log("👋 Existing user signed in:", user.email);
        }

        return true;
      } catch (error) {
        console.error("❌ Error during sign in:", error);
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
            dbUser[0].username ||
            dbUser[0].name ||
            dbUser[0].email?.split("@")[0] ||
            "";
        }
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (url.startsWith(baseUrl)) return url;
      return `${baseUrl}/dashboard`; // Let middleware handle smart routing
    },
  },
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
