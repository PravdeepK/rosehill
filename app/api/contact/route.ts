import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const resend = new Resend(process.env.RESEND_API_KEY);

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, "1 h"),
});

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_RE = /https?:\/\//gi;

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  const { success } = await ratelimit.limit(ip);
  if (!success) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  const body = await req.json();
  const { name, email, phone, "project-type": projectType, message, website } = body;

  // Honeypot — silent success
  if (website) {
    return NextResponse.json({ success: true });
  }

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
  }
  if (!message || message.length > 2000) {
    return NextResponse.json({ error: "Message must be between 1 and 2000 characters." }, { status: 400 });
  }
  if ((message.match(URL_RE) ?? []).length > 2) {
    return NextResponse.json({ error: "Message contains too many URLs." }, { status: 400 });
  }

  await resend.emails.send({
    from: "Rose Hill <noreply@rosehilldesignbuild.com>",
    to: "angelo@rosehilldesignbuild.com",
    replyTo: email,
    subject: `New Contact Inquiry — ${projectType}`,
    text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone || "—"}\nProject Type: ${projectType}\n\n${message}`,
  });

  return NextResponse.json({ success: true });
}
