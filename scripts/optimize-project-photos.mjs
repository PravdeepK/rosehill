// One-shot: optimize the client's raw project photos for the site.
//
// Run with:  node scripts/optimize-project-photos.mjs
//
// Reads every image under rosehill-project-photos/rosehill_upload_ready/<slug>/
// (jpg / jpeg / png, received straight from the client — full-res, mixed
// formats) and writes a web-ready WebP copy to
// public/images/projects/<slug>/<name>.webp, resized so the longest edge is at
// most MAX_EDGE px. EXIF orientation is baked in; all other metadata (incl. GPS)
// is dropped.
//
// The raw folder stays untracked (local master, like public/videos/); only the
// derivatives under public/ are committed. Also writes the generated manifest
// lib/projectImages.json (slug -> [{ src, width, height }]), which
// lib/portfolioMapData.ts imports so image lists stay in sync with what's on
// disk — re-run this script after adding or replacing any raw photo.

import sharp from "sharp";
import { promises as fs } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const SRC_DIR = path.join(ROOT, "rosehill-project-photos", "rosehill_upload_ready");
const OUT_DIR = path.join(ROOT, "public", "images", "projects");
const MANIFEST = path.join(ROOT, "lib", "projectImages.json");

const MAX_EDGE = 2000; // longest-edge cap in px — tune vs. repo weight
const QUALITY = 78; // webp quality
const EXT = /\.(jpe?g|png)$/i;

// Slugs the client hasn't identified yet (no city, address, or project type),
// so nothing to attribute them to on the site. Their raw photos stay in the
// untracked drop folder; drop a slug from this set once the details land and
// re-run to publish it.
const HOLD = new Set(["beer-store", "tamas"]);

// Client files are "<slug>-<n>.<ext>" — order by n so 2 sorts before 10.
const byNumber = (a, b) => {
  const n = (s) => Number(s.match(/-(\d+)\.[^.]+$/)?.[1] ?? 0);
  return n(a) - n(b) || a.localeCompare(b);
};

const mb = (bytes) => `${(bytes / 1024 / 1024).toFixed(1)} MB`;

async function run() {
  const all = (await fs.readdir(SRC_DIR, { withFileTypes: true }))
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();
  const slugs = all.filter((s) => !HOLD.has(s));
  const held = all.filter((s) => HOLD.has(s));

  // Rebuild from scratch so output always matches the current source.
  await fs.rm(OUT_DIR, { recursive: true, force: true });

  const manifest = {};
  let totalIn = 0;
  let totalOut = 0;
  let count = 0;

  for (const slug of slugs) {
    const srcSlugDir = path.join(SRC_DIR, slug);
    const outSlugDir = path.join(OUT_DIR, slug);
    await fs.mkdir(outSlugDir, { recursive: true });

    const files = (await fs.readdir(srcSlugDir)).filter((f) => EXT.test(f)).sort(byNumber);

    manifest[slug] = [];
    let slugIn = 0;
    let slugOut = 0;

    for (const file of files) {
      const src = path.join(srcSlugDir, file);
      const outName = file.replace(EXT, ".webp");
      const out = path.join(outSlugDir, outName);

      const { size: inSize } = await fs.stat(src);
      const info = await sharp(src)
        .rotate() // apply EXIF orientation, then drop metadata (sharp default)
        .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: "inside", withoutEnlargement: true })
        .webp({ quality: QUALITY, effort: 6 })
        .toFile(out);

      slugIn += inSize;
      slugOut += info.size;
      count += 1;
      manifest[slug].push({
        src: `/images/projects/${slug}/${outName}`,
        width: info.width,
        height: info.height,
      });
    }

    totalIn += slugIn;
    totalOut += slugOut;
    console.log(
      `  ${slug.padEnd(20)} ${String(files.length).padStart(2)} img   ` +
        `${mb(slugIn).padStart(9)} -> ${mb(slugOut).padStart(9)}`,
    );
  }

  await fs.writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");

  console.log(
    `\n✓ ${count} images  ${mb(totalIn)} -> ${mb(totalOut)} ` +
      `(${(100 - (totalOut / totalIn) * 100).toFixed(0)}% smaller)`,
  );
  console.log(`✓ manifest: ${path.relative(ROOT, MANIFEST)}`);
  if (held.length) {
    console.log(`• on hold (awaiting client details): ${held.join(", ")}`);
  }
}

await run();
