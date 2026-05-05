// Generate the Open Graph / Twitter share image. Run with:
//   node scripts/gen-og-image.mjs
//
// The brand logo is ~3.6:1, but the OG canvas is 1.91:1 (1200×630). Drop the
// raw logo in and platforms (X, Facebook, LinkedIn, iMessage) crop it badly.
// We composite the logo at ~78% width, centered, on the same black background
// the logo lockup already uses, leaving safe margins on all sides.

import sharp from "sharp";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const LOGO_SOURCE = path.join(ROOT, "public", "company-logos", "rosehill-full-color.png");
const OUT = path.join(ROOT, "public", "og-image.png");

const CANVAS_W = 1200;
const CANVAS_H = 630;
const LOGO_TARGET_W = Math.round(CANVAS_W * 0.78); // 936px

const logoBuf = await sharp(LOGO_SOURCE)
  .resize({ width: LOGO_TARGET_W, withoutEnlargement: false })
  .toBuffer();
const { width: lw, height: lh } = await sharp(logoBuf).metadata();

await sharp({
  create: {
    width: CANVAS_W,
    height: CANVAS_H,
    channels: 3,
    background: { r: 0, g: 0, b: 0 },
  },
})
  .composite([
    {
      input: logoBuf,
      left: Math.round((CANVAS_W - lw) / 2),
      top: Math.round((CANVAS_H - lh) / 2),
    },
  ])
  .png({ compressionLevel: 9 })
  .toFile(OUT);

console.log(`✓ wrote ${path.relative(ROOT, OUT)} (${CANVAS_W}×${CANVAS_H}, logo ${lw}×${lh})`);
