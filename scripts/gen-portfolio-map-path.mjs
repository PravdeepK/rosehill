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
 * dropped, so Baffin/Victoria/Ellesmere don't clutter the top), LON_WEST (west
 * crop), BOX (lon/lat window), FIT (the viewBox rect the landmass is fitted
 * into), projection parallels/rotation.
 *
 * LON_WEST defaults to -141: that meridian *is* the Alaska/Yukon border, so
 * cropping there drops Alaska along a real border line rather than an arbitrary
 * diagonal. The Alaska panhandle sits east of it and stays, reading as BC coast.
 *
 * LAT_TOP defaults to 60 — the provinces/territories boundary, so the north
 * crop also lands on a real line. Cropping the (empty, project-free) Arctic is
 * what makes the landmass wide enough to fill the panel at true aspect: North
 * America is nearly square in this projection, and the panel is 1.73:1.
 *
 * There is deliberately no horizontal stretch. An earlier revision scaled x by
 * 1.42 about the panel centre to fill the width, which visibly skewed the
 * landmass; the fit below preserves the projection's true aspect instead.
 */
import { createRequire } from "node:module";
import * as topojson from "topojson-client";
import { presimplify, simplify } from "topojson-simplify";
import { geoConicConformal, geoPath, geoArea, geoCentroid } from "d3-geo";

const require = createRequire(import.meta.url);
const raw = require("world-atlas/countries-110m.json");

const SIMPLIFY_WEIGHT = Number(process.argv[2] ?? 3.5);
const LAT_TOP = Number(process.argv[3] ?? 60);
const ARCTIC_LAT = Number(process.argv[4] ?? 66);
const LON_WEST = Number(process.argv[5] ?? -141); // Alaska/Yukon border
// Rect within the 780×450 viewBox to fit the landmass into. fitExtent preserves
// aspect, so the shape is centred in whichever dimension it doesn't fill.
const FIT = [
  [10, 8],
  [770, 442],
];

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
  [LON_WEST, 23],
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
projection.fitExtent(FIT, merged);
projection.clipExtent([
  [-200, -160],
  [980, 620],
]);
const path = geoPath(projection);

// Round coordinates to 1dp — the path string is shipped in the bundle.
const round = (d) =>
  d
    .replace(/-?\d+(\.\d+)?,-?\d+(\.\d+)?/g, (pair) => {
      const [x, y] = pair.split(",").map(Number);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .replace(/\.0(?=\D)/g, "");

const cities = {
  gta: [-79.38, 43.72],
  calgary: [-113.994, 51.155],
  poconos: [-75.327, 41.039],
  sevierville: [-83.575, 35.887],
  austin: [-97.679, 30.508],
  miami: [-80.268, 25.721],
};

const land = round(path(merged));
const [[bx0, by0], [bx1, by1]] = path.bounds(merged);
console.log(
  `SIMPLIFY_WEIGHT=${SIMPLIFY_WEIGHT} LAT_TOP=${LAT_TOP} LON_WEST=${LON_WEST}` +
    `  LAND_PATH ${land.length} chars`,
);
console.log(
  `landmass bounds  x ${bx0.toFixed(0)}..${bx1.toFixed(0)}  ` +
    `y ${by0.toFixed(0)}..${by1.toFixed(0)}  (viewBox is 780×450)\n`,
);
console.log("=== LAND_PATH ===\n" + land);
console.log("\n=== US_CA_BORDER ===\n" + round(path(usCa)));
console.log("\n=== CITIES (paste x/y into lib/portfolioMapData.ts) ===");
for (const [k, ll] of Object.entries(cities)) {
  const [x, y] = projection(ll);
  console.log(`  ${k}: x: ${x.toFixed(0)}, y: ${y.toFixed(0)}`);
}

// Country <text> anchors — projected area centroids beat placing them by eye.
console.log("\n=== COUNTRY LABELS (paste into PortfolioMap.tsx <text>) ===");
for (const [name, id] of [["CANADA", CANADA], ["UNITED STATES", USA]]) {
  const geo = topojson.merge(
    topo,
    countries.geometries.filter((g) => idNum(g) === id),
  );
  const clipped = {
    type: "MultiPolygon",
    coordinates: geo.coordinates
      .map((poly) => poly.map((r) => clipRing(r, BOX)).filter((r) => r.length > 3))
      .filter((poly) => poly.length),
  };
  const [cx, cy] = path.centroid(clipped);
  console.log(`  ${name}: x="${cx.toFixed(0)}" y="${cy.toFixed(0)}"`);
}
