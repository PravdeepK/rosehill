import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";
import toIco from "to-ico";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const svgPath = path.join(__dirname, "../app/icon.svg");
const outPath = path.join(__dirname, "../app/favicon.ico");

const svg = fs.readFileSync(svgPath);
const sizes = [16, 32, 48];
const pngs = await Promise.all(
  sizes.map((s) => sharp(svg).resize(s, s).png().toBuffer())
);
fs.writeFileSync(outPath, await toIco(pngs));
