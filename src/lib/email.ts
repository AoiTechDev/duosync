const RESEND_API_KEY = process.env.RESEND_API_KEY;
// onboarding@resend.dev works without a verified domain, but only delivers to your own Resend account email.
const EMAIL_FROM = process.env.EMAIL_FROM ?? "DuoGG <onboarding@resend.dev>";

if (!RESEND_API_KEY && process.env.NODE_ENV === "production") {
  console.warn("RESEND_API_KEY missing: emails are not sent");
}

export function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
  replyTo,
}: {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}) {
  if (!RESEND_API_KEY) return false;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: EMAIL_FROM, to, subject, html, text, reply_to: replyTo }),
    });
    if (!res.ok) {
      console.error(`Resend failed (${res.status}):`, await res.text().catch(() => ""));
      return false;
    }
    return true;
  } catch (error) {
    console.error("Resend request failed:", error);
    return false;
  }
}
