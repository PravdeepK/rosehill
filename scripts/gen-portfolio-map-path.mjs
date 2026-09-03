/**
 * Regenerates the North America geometry baked into
 * `components/portfolio-map/PortfolioMap.tsx` (LAND_PATH, US_CA_BORDER,
 * US_MX_BORDER) and the projected city coordinates in
 * `lib/portfolioMapData.ts` (CITIES x/y).
 *
 * Source: Natural Earth 1:110m via world-atlas (public domain). The output is
 * static — the page ships no map library or tiles.
 *
 * One-off deps (not in package.json — install, run, discard):
 *   npm i -D world-atlas topojson-client topojson-simplify d3-geo
 *   node scripts/gen-portfolio-map-path.mjs [simplifyWeight]
 * then paste the printed strings/coords into the two files above.
 *
 * Tunables: SIMPLIFY_WEIGHT (detail vs. size), BOX (lat/lon crop window),
 * STRETCH_X (mild horizontal stretch so the continent fills the 16:9-ish
 * panel), fitExtent box, and the projection parallels/rotation.
 */
import { createRequire } from "node:module";
import * as topojson from "topojson-client";
import { presimplify, simplify } from "topojson-simplify";
import { geoConicConformal, geoPath, geoArea } from "d3-geo";

const require = createRequire(import.meta.url);
const raw = require("world-atlas/countries-110m.json");

const SIMPLIFY_WEIGHT = Number(process.argv[2] ?? 3.5);
const STRETCH_X = 1.4;
const CX = 390; // horizontal centre of the 780×450 viewBox
const VIEW_W = 780;

// ISO numeric ids: Canada, USA, Mexico + Central America.
const NA = new Set([124, 840, 484, 320, 84, 340, 222, 558, 188, 591]);
const idNum = (g) => Number(g.id);

const topo = simplify(presimplify(raw), SIMPLIFY_WEIGHT * 1e-4);
const countries = topo.objects.countries;

let merged = topojson.merge(
  topo,
  countries.geometries.filter((g) => NA.has(idNum(g))),
);

// Drop tiny rings: islands (Aleutians, Arctic, Caribbean) and small lakes.
const OUTER_MIN = 3e-4;
const HOLE_MIN = 9e-5;
merged = {
  type: "MultiPolygon",
  coordinates: merged.coordinates
    .filter(([o]) => geoArea({ type: "Polygon", coordinates: [o] }) > OUTER_MIN)
    .map(([o, ...h]) => [
      o,
      ...h.filter((r) => geoArea({ type: "Polygon", coordinates: [r] }) > HOLE_MIN),
    ]),
};

// Sutherland–Hodgman clip of every ring to a lon/lat window. The bottom edge
// sits just below Panama so Central America isn't cut (which would leave a
// stray bridge edge); the top trims the empty high Arctic.
const BOX = [
  [-150, 6],
  [-50, 58],
];
const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
function clipRing(ring, [[x0, y0], [x1, y1]]) {
  const pass = (pts, keep, cut) => {
    const out = [];
    for (let i = 0; i < pts.length; i++) {
      const a = pts[(i + pts.length - 1) % pts.length];
      const b = pts[i];
      const ka = keep(a);
      const kb = keep(b);
      if (kb) {
        if (!ka) out.push(cut(a, b));
        out.push(b);
      } else if (ka) {
        out.push(cut(a, b));
      }
    }
    return out;
  };
  let r = ring.slice(0, -1);
  r = pass(r, (p) => p[0] >= x0, (a, b) => lerp(a, b, (x0 - a[0]) / (b[0] - a[0])));
  r = pass(r, (p) => p[0] <= x1, (a, b) => lerp(a, b, (x1 - a[0]) / (b[0] - a[0])));
  r = pass(r, (p) => p[1] >= y0, (a, b) => lerp(a, b, (y0 - a[1]) / (b[1] - a[1])));
  r = pass(r, (p) => p[1] <= y1, (a, b) => lerp(a, b, (y1 - a[1]) / (b[1] - a[1])));
  if (r.length) r.push(r[0]);
  return r;
}
merged = {
  type: "MultiPolygon",
  coordinates: merged.coordinates
    .map((poly) => poly.map((ring) => clipRing(ring, BOX)).filter((r) => r.length > 3))
    .filter((poly) => poly.length),
};

const border = (idA, idB) =>
  topojson.mesh(topo, countries, (a, b) => {
    const s = new Set([idNum(a), idNum(b)]);
    return s.has(idA) && s.has(idB);
  });

const projection = geoConicConformal().parallels([24, 50]).rotate([98, 0]);
projection.fitExtent(
  [
    [222, 22],
    [558, 428],
  ],
  merged,
);
projection.clipExtent([
  [-200, -120],
  [VIEW_W + 200, 600],
]);
const path = geoPath(projection);

const stretchNum = (x) => CX + (x - CX) * STRETCH_X;
const stretch = (d) =>
  d
    .replace(/-?\d+(\.\d+)?,-?\d+(\.\d+)?/g, (pair) => {
      const [x, y] = pair.split(",").map(Number);
      return `${stretchNum(x).toFixed(1)},${y.toFixed(1)}`;
    })
    .replace(/(-?\d+)\.(\d)\d+/g, "$1.$2")
    .replace(/\.0(?=\D)/g, "");
const projectCity = ([lon, lat]) => {
  const [x, y] = projection([lon, lat]);
  return [stretchNum(x), y];
};

const cities = {
  gta: [-79.38, 43.72],
  boston: [-71.06, 42.36],
  miami: [-80.19, 25.76],
};

const land = stretch(path(merged));
console.log(`SIMPLIFY_WEIGHT=${SIMPLIFY_WEIGHT}  LAND_PATH ${land.length} chars\n`);
console.log("=== LAND_PATH ===\n" + land);
console.log("\n=== US_CA_BORDER ===\n" + stretch(path(border(840, 124))));
console.log("\n=== US_MX_BORDER ===\n" + stretch(path(border(840, 484))));
console.log("\n=== CITIES (paste x/y into lib/portfolioMapData.ts) ===");
for (const [k, ll] of Object.entries(cities)) {
  const [x, y] = projectCity(ll);
  console.log(`  ${k}: x: ${x.toFixed(0)}, y: ${y.toFixed(0)}`);
}
