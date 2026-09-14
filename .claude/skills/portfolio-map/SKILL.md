---
name: portfolio-map
description: >-
  Edit the /portfolio-map feature — add or change a project pin, add or move a
  city, add a project category, or regenerate the North America map geometry.
  Use whenever the task touches lib/portfolioMapData.ts, components/portfolio-map/*,
  or scripts/gen-portfolio-map-path.mjs.
---

# Editing `/portfolio-map`

The interactive North America portfolio map. Data island is **fully
self-contained** in `lib/portfolioMapData.ts` — never import from `lib/data.ts`
here or vice versa.

## Files

| File | Role |
| --- | --- |
| `lib/portfolioMapData.ts` | All data + types: `CITIES`, `PROJECTS`, `CATEGORIES`, `ProjectCategory`, `CATEGORY_COLOR`, `CARD_GRADIENT` |
| `components/portfolio-map/PortfolioMapExperience.tsx` | Page shell: hero + stats, `<PortfolioMap>`, city pills, filterable grid, `<ProjectModal>` |
| `components/portfolio-map/PortfolioMap.tsx` | The SVG map. Holds `LAND_PATH` + `US_CA_BORDER` geometry constants, viewBox zoom animation, petal/hub layout, `DefaultMarker` |
| `components/portfolio-map/PortfolioProjectCard.tsx` | Grid card |
| `components/portfolio-map/ProjectModal.tsx` | Accessible modal (focus trap, Escape, scroll lock) |
| `components/portfolio-map/helpers.ts` | `cityName`, `projectCount`, `initials`, `onActivateKey`, `prefersReducedMotion` |
| `scripts/gen-portfolio-map-path.mjs` | Regenerates map geometry + projected city x/y |
| `app/portfolio-map/page.tsx` | Route + `metadata` |

The map viewBox is **`780 × 450`**. `CITIES` `x`/`y` are positions in that
viewBox — **not** latitude/longitude.

---

## Task: add or edit a project

Edit `PROJECTS` in `lib/portfolioMapData.ts`. Shape:

```ts
{
  id: 10,                     // unique number, not reused
  name: "Project Name",
  category: "Luxury Retail",  // must be a ProjectCategory member
  city: "gta",                // must equal a CITIES[].key
  location: "123 Example St, Toronto",
  description: "1–3 sentences, Rose Hill voice (see existing entries).",
  placeholder: false,         // true = demo/no real project yet → UI shows a 'Demo placeholder' tag
}
```

Rules:
- `id` must be unique across the whole array.
- `city` must match an existing `CITIES[].key` exactly.
- `category` must be one of `CATEGORIES` / the `ProjectCategory` union.
- Petals auto-distribute around the hub — no layout math needed. But petal
  hover labels **truncate at 16 characters** (`PETAL_LABEL_MAX`). If `name` is
  longer and the truncation reads badly, add an optional `shortName` — the
  petal label prefers it, everything else still shows `name`. Scarborough
  Health Network uses `shortName: "SHN"`.
- Real Rose Hill projects → `placeholder: false`. Invented/demo → `placeholder: true`.

No other file needs to change. `projectCount()` and all grid/map filters derive
from `PROJECTS`. The hero "Cities" / "Projects" stats are hardcoded marketing
figures (`10+` / `500+`) — leave them unless the real count outgrows the figure.

---

## Task: add a category

1. Add the string to the `ProjectCategory` union **and** the `CATEGORIES` array
   in `lib/portfolioMapData.ts`.
2. TypeScript will now error on `CATEGORY_COLOR` and `CARD_GRADIENT` (both
   `Record<ProjectCategory, string>`) — add an entry to each. Use `@theme`
   tokens via `var(--color-…)` for `CATEGORY_COLOR`; a `linear-gradient(...)` of
   tokens for `CARD_GRADIENT`.
3. `npm run build` to confirm the records are exhaustive. The grid filter row
   picks the new category up automatically.

---

## Task: add or move a city

`CITIES` entry shape:

```ts
{ key: "nyc", name: "New York City", shortLabel: "NEW YORK", x: 545, y: 300, labelDir: "right" }
```

- `key` — lowercase slug, referenced by `PROJECTS[].city`.
- `shortLabel` — the map chip (uppercase, short).
- `x` / `y` — position in the 780×450 viewBox. Get these from the regen script
  (below) or estimate against the current three: `gta {500,270}`,
  `boston {557,269}`, `miami {527,386}`.
- `labelDir` — `"left"` or `"right"`; which way the unzoomed chip opens so it
  doesn't collide with the coastline or another chip.

Then:
- Add at least one `PROJECTS` entry with `city: "<key>"`, or the city renders
  with a `· 0` count and an empty cluster.
- The hero "Cities" stat is a **hardcoded** `10+` in
  `PortfolioMapExperience.tsx` — bump the copy only if the real count passes it.
- If the city sits outside the current crop (roughly lon −150…−50, lat 23…71)
  the pin will fall off the landmass — you'll need to widen the projection box
  and regenerate geometry.

---

## Task: regenerate map geometry

Only when the landmass outline / border / crop must change (e.g. new city
outside the current window, or you want more of Arctic Canada).

```bash
npm i -D world-atlas topojson-client topojson-simplify d3-geo   # throwaway — do NOT commit to package.json
node scripts/gen-portfolio-map-path.mjs [simplifyWeight] [latTop] [arcticLat]
#   defaults: 3.5  71  66
```

The script prints three blocks:
- `=== LAND_PATH ===` → paste into `LAND_PATH` in `PortfolioMap.tsx`
- `=== US_CA_BORDER ===` → paste into `US_CA_BORDER` in `PortfolioMap.tsx`
- `=== CITIES ... ===` → paste each `x`/`y` into the matching `CITIES` entry in
  `lib/portfolioMapData.ts`

Then adjust the `CANADA` / `UNITED STATES` `<text>` positions in `PortfolioMap.tsx`
by eye. Tunables (projection parallels/rotation, `STRETCH_X`, `BOX`, `fitExtent`,
ring-area thresholds) are documented in the script header. Add the source
coordinates for any new city to the `cities` object in the script before running.
Uninstall the throwaway deps afterward.

---

## Verify (every change)

1. `npm run lint`
2. `npm run build`
3. `npm run dev` → `http://localhost:3000/portfolio-map`:
   - full view: every city chip shows the right count
   - click a city: viewBox zooms, one petal per project, hub click zooms out
   - click a petal: modal opens; `Escape` and the ✕ close it; focus returns
   - grid below: city + category filters combine; counts match
   - keyboard: Tab to a city pill / marker, `Enter`/`Space` activates
   - check `prefers-reduced-motion` (DevTools rendering) — animations off, no jump
4. Then at a 375px-wide viewport (DevTools device toolbar, touch simulation on):
   - full view: city chips and country labels are gone, pins still tappable
   - a city pill zooms in; the cluster is noticeably tighter than on desktop
     and each petal is a comfortable tap
   - the "← All locations" button over the map zooms back out
   - in the modal: swipe left/right steps the gallery, vertical drag still
     scrolls it, and the close button is reachable with the browser chrome up
   - rotate to landscape — the cluster re-frames rather than staying tight

## Guardrails

- Keep the data island decoupled from `lib/data.ts`.
- Reuse `helpers.ts` (`onActivateKey`, `projectCount`, `cityName`, `initials`).
- Colors from `@theme` tokens only — no raw hex.
- New animations: `@keyframes` + `.map-*` class in `app/globals.css`, disabled
  under `prefers-reduced-motion`.
- Don't add a runtime map/tile library — geometry stays static.
