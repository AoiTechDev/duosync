import { db } from "@/lib/db";
import { posts } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { getCurrentUser } from "@/auth";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const me = await getCurrentUser();
  if (!me) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const post = await db.query.posts.findFirst({
      where: and(eq(posts.id, id), eq(posts.authorId, me.id)),
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error("Error fetching post:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
