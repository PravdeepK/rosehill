// Generate the Open Graph / Twitter share image. Run with:
//   node scripts/gen-og-image.mjs
//
// The brand logo is ~3.6:1, but the OG canvas is 1.91:1 (1200×630). Drop the
// raw logo in and platforms (X, Facebook, LinkedIn, iMessage) crop it badly.
// We composite the logo centered, with safe margins on all sides.
//
// Source is the transparent 2000×550 lockup, NOT rosehill-full-color.png:
// that file has its black background baked in (no alpha), so the grey wordmark
// sat at ~#5A5A5A on pure black and read muddy in a share card. The ground here
// is the site's own warm-white, which is what the logo is drawn for, finished
// with a gold band along the bottom edge so the card still has a defined edge
// on a white chat background.

import sharp from "sharp";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const LOGO_SOURCE = path.join(ROOT, "public", "company-logos", "rosehill-linear-colour-full.png");
const OUT = path.join(ROOT, "public", "og-image.png");

const CANVAS_W = 1200;
const CANVAS_H = 630;
const LOGO_TARGET_W = Math.round(CANVAS_W * 0.68); // 816px
const GOLD_BAR_H = 10;

// Tokens from app/globals.css — keep in sync.
const WARM_WHITE = "#f5f4f0";
const WARM_GREY = "#e8e6e1";
const GOLD = "#CB9E41";

const background = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="${CANVAS_W}" height="${CANVAS_H}">
  <defs>
    <linearGradient id="ground" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${WARM_WHITE}"/>
      <stop offset="100%" stop-color="${WARM_GREY}"/>
    </linearGradient>
  </defs>
  <rect width="${CANVAS_W}" height="${CANVAS_H}" fill="url(#ground)"/>
  <rect x="0" y="${CANVAS_H - GOLD_BAR_H}" width="${CANVAS_W}" height="${GOLD_BAR_H}" fill="${GOLD}"/>
</svg>`);

const logoBuf = await sharp(LOGO_SOURCE)
  .resize({ width: LOGO_TARGET_W, withoutEnlargement: false })
  .toBuffer();
const { width: lw, height: lh } = await sharp(logoBuf).metadata();

await sharp(background)
  .composite([
    {
      input: logoBuf,
      left: Math.round((CANVAS_W - lw) / 2),
      // Optically centered: discount the gold band from the usable height.
      top: Math.round((CANVAS_H - GOLD_BAR_H - lh) / 2),
    },
  ])
  // Share cards are shown opaque everywhere; flatten so no platform has to
  // guess at an alpha channel.
  .flatten({ background: WARM_WHITE })
  .png({ compressionLevel: 9 })
  .toFile(OUT);

console.log(`✓ wrote ${path.relative(ROOT, OUT)} (${CANVAS_W}×${CANVAS_H}, logo ${lw}×${lh})`);
