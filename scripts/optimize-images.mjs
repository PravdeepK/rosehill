// One-shot image optimization. Run with: node scripts/optimize-images.mjs
//
// Generates WebP variants of the hero images sized for the actual rendered
// dimensions (Lighthouse mobile audits use a 412×823 viewport at DPR 1.5,
// so the served image only needs ~620×1240 pixels) and converts every
// raster logo to WebP at the size the LogoWall actually displays them
// (~180px wide → 360px @ 2× retina). The logos are rendered as CSS
// `mask-image`, so only the alpha channel matters and we can compress
// aggressively without any visible quality loss.

import sharp from "sharp";
import { promises as fs } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const IMAGES_DIR = path.join(ROOT, "public", "images");
const LOGOS_DIR = path.join(ROOT, "public", "logos");

const HERO_SOURCE = path.join(IMAGES_DIR, "hero-desktop.jpg");

async function buildHeroVariants() {
  // Source is 2048×1366 (1.5 landscape ratio).
  // Mobile portrait crop: center-crop to 1:2 = 683×1366, then resize.
  const meta = await sharp(HERO_SOURCE).metadata();
  const cropWidth = Math.floor(meta.height / 2);
  const cropLeft = Math.floor((meta.width - cropWidth) / 2);

  // Mobile 1×: targets the Lighthouse mobile audit viewport (DPR 1.5,
  // ~618×1235 expected pixels). 620×1240 is just above that.
  await sharp(HERO_SOURCE)
    .extract({
      left: cropLeft,
      top: 0,
      width: cropWidth,
      height: meta.height,
    })
    .resize(620, 1240, { fit: "cover" })
    .webp({ quality: 72, effort: 6 })
    .toFile(path.join(IMAGES_DIR, "hero-mobile.webp"));

  // Mobile 2× for high-DPR phones (iPhone 3×, etc.).
  await sharp(HERO_SOURCE)
    .extract({
      left: cropLeft,
      top: 0,
      width: cropWidth,
      height: meta.height,
    })
    .resize(1240, 2480, { fit: "cover" })
    .webp({ quality: 70, effort: 6 })
    .toFile(path.join(IMAGES_DIR, "hero-mobile-2x.webp"));

  // Desktop variants. Most desktops are ≤1920 wide; 1600px is plenty for
  // a hero shown behind a max-w content layout.
  await sharp(HERO_SOURCE)
    .resize(1600, 1067, { fit: "cover" })
    .webp({ quality: 75, effort: 6 })
    .toFile(path.join(IMAGES_DIR, "hero-desktop.webp"));

  // 2× for retina laptops/4K monitors.
  await sharp(HERO_SOURCE)
    .resize(2400, 1600, { fit: "cover" })
    .webp({ quality: 70, effort: 6 })
    .toFile(path.join(IMAGES_DIR, "hero-desktop-2x.webp"));

  console.log("✓ hero variants written");
}

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

await buildHeroVariants();
await buildLogoVariants();
