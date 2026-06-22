// One-shot image optimization. Run with: node scripts/optimize-images.mjs
//
// Converts every raster logo in public/logos/ to WebP at the size the LogoWall
// actually displays them (~180px wide → 360px @ 2× retina). The logos are
// rendered as CSS `mask-image`, so only the alpha channel matters and we can
// compress aggressively without any visible quality loss.

import sharp from "sharp";
import { promises as fs } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const LOGOS_DIR = path.join(ROOT, "public", "logos");

async function buildLogoVariants() {
  const entries = await fs.readdir(LOGOS_DIR);
  const pngs = entries.filter((f) => f.toLowerCase().endsWith(".png"));

  // The LogoWall renders each logo at max 180px wide, ~48px tall. We size
  // the longest edge to 360px so 2×-DPR screens stay crisp; sharp will
  // preserve aspect ratio.
  for (const file of pngs) {
    const src = path.join(LOGOS_DIR, file);
    const out = path.join(
      LOGOS_DIR,
      file.replace(/\.png$/i, ".webp"),
    );
    await sharp(src)
      .resize({ width: 360, height: 200, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 78, alphaQuality: 70, effort: 6 })
      .toFile(out);
  }
  console.log(`✓ ${pngs.length} logos converted to WebP`);
}

await buildLogoVariants();
