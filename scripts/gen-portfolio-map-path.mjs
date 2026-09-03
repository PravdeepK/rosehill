/**
 * Regenerates the US + Canada geometry baked into
 * `components/portfolio-map/PortfolioMap.tsx` (LAND_PATH, US_CA_BORDER) and the
 * projected city coordinates in `lib/portfolioMapData.ts` (CITIES x/y).
 *
 * Source: Natural Earth 1:110m via world-atlas (public domain). Output is
 * static — the page ships no map library or tiles.
 *
 * One-off deps (not in package.json — install, run, discard):
 *   npm i -D world-atlas topojson-client topojson-simplify d3-geo
 *   node scripts/gen-portfolio-map-path.mjs [simplifyWeight] [latTop] [arcticLat]
 * then paste the printed strings/coords into the two files above and adjust the
 * CANADA / UNITED STATES <text> label positions by eye.
 *
 * Tunables: SIMPLIFY_WEIGHT (detail vs. size), LAT_TOP (north crop — raise to
 * show more of Arctic Canada), ARCTIC_LAT (separate islands north of this are
 * dropped, so Baffin/Victoria/Ellesmere don't clutter the top), BOX (lon/lat
 * window), STRETCH_X (horizontal stretch so the landmass fills the panel),
 * fitExtent box, projection parallels/rotation.
 */
import { createRequire } from "node:module";
import * as topojson from "topojson-client";
import { presimplify, simplify } from "topojson-simplify";
import { geoConicConformal, geoPath, geoArea, geoCentroid } from "d3-geo";

const require = createRequire(import.meta.url);
const raw = require("world-atlas/countries-110m.json");

const SIMPLIFY_WEIGHT = Number(process.argv[2] ?? 3.5);
const LAT_TOP = Number(process.argv[3] ?? 71);
const ARCTIC_LAT = Number(process.argv[4] ?? 66);
const STRETCH_X = 1.42;
const CX = 390; // horizontal centre of the 780×450 viewBox

const CANADA = 124;
const USA = 840;
const idNum = (g) => Number(g.id);

const topo = simplify(presimplify(raw), SIMPLIFY_WEIGHT * 1e-4);
const countries = topo.objects.countries;

let merged = topojson.merge(
  topo,
  countries.geometries.filter((g) => [CANADA, USA].includes(idNum(g))),
);

// Drop tiny rings (small islands, small lakes).
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

// Drop the far-Arctic islands (Baffin, Victoria, Ellesmere…) by centroid
// latitude, keeping the mainland and southern islands (Newfoundland,
// Vancouver Is.).
merged = {
  type: "MultiPolygon",
  coordinates: merged.coordinates.filter(([o]) => {
    const c = geoCentroid({ type: "Polygon", coordinates: [o] });
    const area = geoArea({ type: "Polygon", coordinates: [o] });
    return area > 0.02 || c[1] < ARCTIC_LAT; // keep the mainland regardless
  }),
};

// Sutherland–Hodgman clip of every ring to a lon/lat window.
const BOX = [
  [-150, 23],
  [-50, LAT_TOP],
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

const usCa = topojson.mesh(topo, countries, (a, b) => {
  const s = new Set([idNum(a), idNum(b)]);
  return s.has(USA) && s.has(CANADA);
});

const projection = geoConicConformal().parallels([26, 52]).rotate([98, 0]);
projection.fitExtent(
  [
    [206, 30],
    [574, 420],
  ],
  merged,
);
projection.clipExtent([
  [-200, -160],
  [980, 620],
]);
const path = geoPath(projection);

const sx = (x) => CX + (x - CX) * STRETCH_X;
const stretch = (d) =>
  d
    .replace(/-?\d+(\.\d+)?,-?\d+(\.\d+)?/g, (pair) => {
      const [x, y] = pair.split(",").map(Number);
      return `${sx(x).toFixed(1)},${y.toFixed(1)}`;
    })
    .replace(/(-?\d+)\.(\d)\d+/g, "$1.$2")
    .replace(/\.0(?=\D)/g, "");
const projectCity = ([lon, lat]) => {
  const [x, y] = projection([lon, lat]);
  return [sx(x), y];
};

const cities = {
  gta: [-79.38, 43.72],
  boston: [-71.06, 42.36],
  miami: [-80.19, 25.76],
};

const land = stretch(path(merged));
console.log(
  `SIMPLIFY_WEIGHT=${SIMPLIFY_WEIGHT} LAT_TOP=${LAT_TOP}  LAND_PATH ${land.length} chars\n`,
);
console.log("=== LAND_PATH ===\n" + land);
console.log("\n=== US_CA_BORDER ===\n" + stretch(path(usCa)));
console.log("\n=== CITIES (paste x/y into lib/portfolioMapData.ts) ===");
for (const [k, ll] of Object.entries(cities)) {
  const [x, y] = projectCity(ll);
  console.log(`  ${k}: x: ${x.toFixed(0)}, y: ${y.toFixed(0)}`);
}
