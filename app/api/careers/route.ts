import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const resend = new Resend(process.env.RESEND_API_KEY);

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "1 h"),
});

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_RE = /https?:\/\//gi;
const ALLOWED_MIME = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);
const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  const { success } = await ratelimit.limit(ip);
  if (!success) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  const formData = await req.formData();
  const name     = formData.get("name") as string;
  const trade    = formData.get("trade") as string;
  const phone    = formData.get("phone") as string;
  const email    = formData.get("email") as string;
  const region   = formData.get("region") as string;
  const message  = formData.get("message") as string | null;
  const website  = formData.get("website") as string | null;
  const resume   = formData.get("resume") as File | null;
  const cover    = formData.get("coverLetter") as File | null;

  // Honeypot — silent success
  if (website) {
    return NextResponse.json({ success: true });
  }

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
  }
  if (message && message.length > 2000) {
    return NextResponse.json({ error: "Message must be 2000 characters or fewer." }, { status: 400 });
  }
  if (message && (message.match(URL_RE) ?? []).length > 2) {
    return NextResponse.json({ error: "Message contains too many URLs." }, { status: 400 });
  }

  const attachments: { filename: string; content: Buffer }[] = [];

  for (const [label, file] of [["resume", resume], ["coverLetter", cover]] as [string, File | null][]) {
    if (!file || file.size === 0) continue;
    if (!ALLOWED_MIME.has(file.type)) {
      return NextResponse.json({ error: `${label === "resume" ? "Resume" : "Cover letter"} must be a PDF or Word document.` }, { status: 400 });
    }
    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json({ error: `${label === "resume" ? "Resume" : "Cover letter"} must be under 10 MB.` }, { status: 400 });
    }
    attachments.push({
      filename: file.name,
      content: Buffer.from(await file.arrayBuffer()),
    });
  }

  await resend.emails.send({
    from: "Rose Hill <onboarding@resend.dev>",
    to: "adam@rosehilldesignbuild.com",
    replyTo: email,
    subject: `Subcontractor Application (${region}) — ${trade}`,
    text: `Name: ${name}\nTrade: ${trade}\nPhone: ${phone}\nEmail: ${email}\nRegion: ${region}\n\n${message || ""}`,
    attachments,
  });

  return NextResponse.json({ success: true });
}
