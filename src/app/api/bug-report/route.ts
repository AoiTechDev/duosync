import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/auth";
import { db } from "@/lib/db";
import { bugReports } from "@/db/schema";
import { rateLimit } from "@/lib/rate-limit";
import { BUG_CATEGORIES, BUG_MESSAGE_MAX, BUG_MESSAGE_MIN } from "@/features/report-bug/constants";

const BodySchema = z.object({
  category: z.enum(BUG_CATEGORIES.map((c) => c.id)),
  message: z.string().trim().min(BUG_MESSAGE_MIN).max(BUG_MESSAGE_MAX),
  pageUrl: z.string().max(500).optional(),
});

export async function POST(request: Request) {
  try {
    const me = await getCurrentUser();
    if (!me) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const limit = await rateLimit("bugReport", me.id);
    if (!limit.ok) {
      return NextResponse.json(
        { error: `You've sent a few already, try again in ${limit.retryAfter}s` },
        { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
      );
    }

    const json = await request.json().catch(() => null);
    const parse = BodySchema.safeParse(json);
    if (!parse.success) {
      return NextResponse.json(
        { error: `Please describe the problem (at least ${BUG_MESSAGE_MIN} characters)` },
        { status: 400 },
      );
    }

    await db.insert(bugReports).values({
      userId: me.id,
      category: parse.data.category,
      message: parse.data.message,
      pageUrl: parse.data.pageUrl ?? null,
      userAgent: request.headers.get("user-agent")?.slice(0, 500) ?? null,
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Bug report failed:", error);
    return NextResponse.json({ error: "Couldn't send the report, please try again" }, { status: 500 });
  }
}
