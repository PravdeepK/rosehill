import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Development helper: file list + mtimes for live logo updates without refresh.
 * Disabled in production (no polling from the client there).
 */
export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return new NextResponse(null, { status: 404 });
  }

  const dir = path.join(process.cwd(), "public", "logos");
  if (!fs.existsSync(dir)) {
    return NextResponse.json({ items: [] as { name: string; v: number }[] });
  }

  const names = fs
    .readdirSync(dir)
    .filter(
      (f) =>
        /\.(png|svg)$/i.test(f) &&
        !f.startsWith(".") &&
        !f.startsWith(".__")
    )
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));

  const items = names.map((name) => {
    const st = fs.statSync(path.join(dir, name));
    return { name, v: st.mtimeMs };
  });

  return NextResponse.json(items, {
    headers: { "Cache-Control": "no-store" },
  });
}
