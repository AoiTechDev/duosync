import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { getCurrentUser } from "@/auth";
import { authOptions } from "@/auth/options";
import { getInboxVersion } from "@/lib/inbox";

// Polled frequently by every dashboard tab, so it reads the user id from the JWT instead of
// going through getCurrentUser(), which costs two database queries.
export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: authOptions.secret });
    const userId = token?.id ?? (token ? (await getCurrentUser())?.id : undefined);
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const version = await getInboxVersion(userId);
    return NextResponse.json({ version }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("Inbox version error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
