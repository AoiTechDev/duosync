import { after, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/auth";
import { db } from "@/lib/db";
import { bugReports } from "@/db/schema";
import { rateLimit } from "@/lib/rate-limit";
import { escapeHtml, sendEmail } from "@/lib/email";
import { CONTACT_EMAIL, SITE_URL } from "@/lib/site";
import { BUG_CATEGORIES, BUG_MESSAGE_MAX, BUG_MESSAGE_MIN } from "@/features/report-bug/constants";

const BUG_REPORT_EMAIL = process.env.BUG_REPORT_EMAIL ?? CONTACT_EMAIL;

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

    const userAgent = request.headers.get("user-agent")?.slice(0, 500) ?? null;
    const [report] = await db
      .insert(bugReports)
      .values({
        userId: me.id,
        category: parse.data.category,
        message: parse.data.message,
        pageUrl: parse.data.pageUrl ?? null,
        userAgent,
      })
      .returning({ id: bugReports.id });

    after(() => {
      const category = BUG_CATEGORIES.find((c) => c.id === parse.data.category)?.label ?? parse.data.category;
      const page = parse.data.pageUrl ? `${SITE_URL}${parse.data.pageUrl}` : "unknown";
      const rows: [string, string][] = [
        ["From", `${me.username} (${me.email})`],
        ["Type", category],
        ["Page", page],
        ["Browser", userAgent ?? "unknown"],
        ["Report ID", report.id],
      ];

      return sendEmail({
        to: BUG_REPORT_EMAIL,
        replyTo: me.email,
        subject: `[DuoGG bug] ${category}: ${parse.data.message.slice(0, 60)}`,
        text: `${rows.map(([k, v]) => `${k}: ${v}`).join("\n")}\n\n${parse.data.message}`,
        html: `<table style="font:14px sans-serif;border-collapse:collapse">${rows
          .map(
            ([k, v]) =>
              `<tr><td style="padding:2px 12px 2px 0;color:#666">${k}</td><td>${escapeHtml(v)}</td></tr>`,
          )
          .join("")}</table><p style="font:15px sans-serif;white-space:pre-wrap">${escapeHtml(parse.data.message)}</p>`,
      }).then(() => undefined);
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Bug report failed:", error);
    return NextResponse.json({ error: "Couldn't send the report, please try again" }, { status: 500 });
  }
}
