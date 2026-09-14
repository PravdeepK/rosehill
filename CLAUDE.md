# CLAUDE.md

Project context for Claude Code. Read this before making changes.

---

## 1. What this is

Marketing website for **Rose Hill Design Build** — a premium design-build /
general-contracting firm (luxury retail fit-outs, restaurants, condos, commercial
spaces) with offices in Mississauga, ON and Lewes, DE.

Static-leaning Next.js App Router site. No CMS, no database. Content lives in
typed modules under `lib/`. Two API routes send transactional email via Resend.

Canonical domain: `https://www.rosehilldesignbuild.com` (see `lib/site.ts`).

---

## 2. Commands

```bash
npm run dev              # next dev — http://localhost:3000
npm run build            # next build --webpack  (must pass before a PR)
npm run start            # serve the production build
npm run preview          # build + start
npm run lint             # eslint (next/core-web-vitals + next/typescript)

npm run optimize-images  # scripts/optimize-images.mjs (sharp)
npm run gen-favicon      # scripts/gen-favicon.mjs
npm run gen-og           # scripts/gen-og-image.mjs
```

There is **no test suite and no CI**. "Working" means: `npm run lint` clean,
`npm run build` succeeds, and the affected pages verified manually in `npm run dev`.

`--webpack` is deliberate on `build` — do not switch it to Turbopack without
checking the build still passes.

---

## 3. Stack

| Thing | Version / choice |
| --- | --- |
| Next.js | 16.1.x, App Router, `app/` dir |
| React | 19.2.x |
| TypeScript | 5.x, `strict: true`, path alias `@/*` → repo root |
| Styling | Tailwind CSS v4 (CSS-first: `@import "tailwindcss"` + `@theme` in `app/globals.css`) — **no `tailwind.config.js`** |
| Fonts | `next/font/google` DM Sans → `--font-dm-sans` / `font-sans` |
| Email | Resend (`resend`) |
| Rate limiting | `@upstash/ratelimit` + `@upstash/redis` (env-configured) |
| Video | `hls.js` for the homepage hero (Cloudflare Stream) |
| Animation | **No framer-motion.** CSS keyframes in `globals.css` + a small IntersectionObserver `Reveal` component |
| Hosting | Vercel |

Browser targets (`package.json` `browserslist`): Chrome/Edge/Firefox ≥ 100,
Safari/iOS ≥ 15.4. Modern CSS (`mask-image`, `:has`, container-free grid) is fine.

---

## 4. Layout of the repo

```
app/
  layout.tsx            Root: metadata template, DM Sans, <Navbar/> <main/> <Footer/>, <JsonLd/>
  page.tsx              Home (IntroGate → Hero → Advantage → LogoWall → Testimonials → CTA); revalidate 3600
  globals.css           Tailwind import, @theme tokens, all keyframes/animations
  not-found.tsx         404
  robots.ts / sitemap.ts   Metadata routes (sitemap is a hand-maintained list)
  portfolio-map/page.tsx   /portfolio-map — see §6
  services/page.tsx        /services — renders lib/data.ts `generalContracting`
  careers/  (layout.tsx = metadata, page.tsx = client form)
  contact/page.tsx         Form + two inline Google Maps iframes
  api/contact/route.ts     POST → Resend, Upstash rate limit, honeypot
  api/careers/route.ts     POST multipart (resume/cover upload) → Resend
  api/logos-meta/route.ts  DEV-ONLY helper for live logo-wall refresh (404 in prod)

components/
  layout/    Navbar, Footer
  home/      Hero, Advantage, LogoWall (+Client), Testimonials, CallToAction
  intro/     IntroGate (splash held until hero video is sharp; see lib/heroReady.ts)
  portfolio-map/   PortfolioMapExperience, PortfolioMap, ProjectModal,
                   PortfolioProjectCard, helpers.ts   (see §6)
  services/  ServicesTabs  (file name is legacy — it renders a static card grid)
  contact/   ContactForm, MapEmbed (MapEmbed is currently unused)
  seo/       JsonLd (Organization / GeneralContractor structured data)
  ui/        Button, SectionLabel, Reveal   (shared primitives — prefer these)

lib/
  site.ts            SITE_URL, SITE_NAME, PAGE_TITLE_TAGLINE, SITE_DESCRIPTION
  data.ts            testimonials[], services[], generalContracting
  portfolioMapData.ts  Self-contained data + types for /portfolio-map (see §6)
  heroReady.ts       Cross-component signal: hero video ready → intro splash clears

scripts/    Node/Python one-offs (image opt, favicon, OG image, logo cleanup,
            gen-portfolio-map-path.mjs). Python scripts use ./.venv.

public/
  logos/           Client logos. LogoWall renders *.webp|svg; dev helper reads *.png|svg
  company-logos/   Rose Hill wordmarks (nav, footer, favicon, intro)
  videos/          Hero video (gitignored in .cursorignore; large)
  fonts/           Brand-font drop zone — see §7 caveat
```

---

## 5. Conventions

**Components.** Server components by default. Add `"use client"` only when you
need state, effects, or browser APIs. Home page keeps client JS minimal on
purpose (hero-video performance) — don't add heavy client deps to `app/page.tsx`
or its children without a reason.

**Styling.** Tailwind utility classes inline. Colors/fonts come from `@theme`
tokens in `app/globals.css` — use the semantic names:

```
gold  gold-light  gold-contrast   (gold-contrast = AA-safe gold for text on light bg)
warm-white  warm-grey  light-grey
dark  medium-grey
```

Never hardcode a hex that a token already covers. New shared animations go in
`globals.css` as `@keyframes` + a utility class, namespaced by feature
(`map-*`, `hero-*`, `intro-*`), and disabled under
`@media (prefers-reduced-motion: reduce)`.

**Shared UI.** Use `components/ui/Button`, `SectionLabel`, `Reveal` instead of
re-rolling. `SectionLabel` defaults to `gold-contrast`; pass `color="text-gold"`
on dark sections.

**SEO / metadata.** Every route exports `metadata` with `title` (a bare string —
the root `layout.tsx` applies the `%s | Leaders in Luxury` template),
`description`, and `alternates.canonical`. Client pages (`"use client"`) can't
export `metadata` — add a sibling `layout.tsx` for it (see `app/careers/`).
**When you add a route, also add it to `app/sitemap.ts`** (hand-maintained) and,
if it's a primary page, to `components/layout/Navbar.tsx` / `Footer.tsx`.

**Data.** Content is typed and lives in `lib/`. `/portfolio-map` intentionally
owns its own data island (`lib/portfolioMapData.ts`) and must not be coupled back
to `lib/data.ts`.

**Accessibility.** Existing bar is high — keep it. Interactive SVG nodes use
`role="button"` + `tabIndex={0}` + the shared `onActivateKey` helper. Focus
styles: `focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold`.
Modals trap focus, restore it on close, lock body scroll, close on `Escape`
(see `components/portfolio-map/ProjectModal.tsx` for the reference impl).

**Forms & API routes.** Both API routes follow the same shape: Upstash
sliding-window rate limit by `x-forwarded-for`, a `website` honeypot field
(silent success), strict field validation, then `resend.emails.send`. Match this
pattern for any new endpoint. Recipients and limits are per-route constants.

**React patterns.** "Adjust state during render when a prop changes" (the
`lastPath` / `lastActiveCity` pattern) is used instead of effects in `Navbar` and
`PortfolioMap` — follow it rather than adding `useEffect` for derived state.

---

## 6. Feature: `/portfolio-map`

Interactive North-America map. Pick a city → the SVG `viewBox` animates
(rAF-driven ease, not a CSS transition) to a zoomed "cluster" where each project
is a petal around a hub; click a petal → `ProjectModal`. Below the map, a
filterable grid of the same projects. City pills + the grid are the
touch/keyboard path (the SVG interactions are progressive enhancement).

**All data + types: `lib/portfolioMapData.ts`.** No map library, no tiles at
runtime — the landmass is a static projected SVG path.

- `CITIES` — `{ key, name, shortLabel, x, y, labelDir }`. `x`/`y` are in the
  `780×450` map viewBox (NOT lat/lon).
- `PROJECTS` — `{ id (unique number), name, category, city (→ CITIES.key),
  location, description, placeholder (boolean, required) }`. Toronto entries are
  real; Boston/Miami are `placeholder: true` demo content.
- `CATEGORIES` drives the grid filter UI. `ProjectCategory` is a union;
  `CATEGORY_COLOR` and `CARD_GRADIENT` are `Record<ProjectCategory, …>` so TS
  forces you to add an entry when you add a category.

**Map geometry** lives in `components/portfolio-map/PortfolioMap.tsx` as
`LAND_PATH` and `US_CA_BORDER` string constants. Regenerate with
`scripts/gen-portfolio-map-path.mjs` (installs `world-atlas topojson-client
topojson-simplify d3-geo` as throwaway dev deps; prints the two path strings and
projected city x/y to paste back in). Country `<text>` label positions are
tuned by eye afterward.

Common edits are covered by the **`/portfolio-map` skill** — invoke it.

**Touch / small screens.** The map is sized in viewBox units, so everything in
it shrinks with the panel. Below `md` the feature adapts in three places, and
they must stay in step:

- `COMPACT_QUERY` in `PortfolioMap.tsx` (`max-width: 767px`) switches the
  cluster to `COMPACT_ZOOM_W` (200 vs 320) — a harder zoom, so petals clear a
  44px tap target instead of rendering ~15px wide. It is read with
  `useSyncExternalStore` and used **only inside the zoom effect**, never during
  render, so there is no hydration mismatch — keep it that way.
- `.map-fine-print` in `globals.css` (same 767px breakpoint) hides the city
  chips and country labels, which render at ~7px type on a phone. It uses
  `visibility`, not `display`, so `<text>` stays measurable by `useTextWidth()`
  after a rotate.
- `.map-hover-label` hides petal names under `(hover: none)` — a tap opens the
  project instead, and emulated hover would otherwise strand a label.

Touch targets are transparent circles sized in viewBox units (`PETAL_HIT_R`,
`CITY_HIT_R`) layered over decorative artwork, so they hold at any zoom; both
clear the tightest spacing on the map (42 units between petals, 43 between
Toronto and the Poconos). The city pills are the WCAG 2.5.8 equivalent control
for the full-view pins, which sit ~17px apart on a phone and can't be fixed by
target sizing — don't remove them.

Gotchas: the hero's two stats (`10+` Cities, `500+` Projects) are hardcoded
marketing figures in `PortfolioMapExperience.tsx`, not derived from
`CITIES`/`PROJECTS` — edit the copy directly if the real numbers outgrow them.
Petal labels truncate at 16 chars
(`PETAL_LABEL_MAX`) — the ceiling the zoomed viewBox's 160px half-width allows.
Petals auto-distribute around the circle, so adding projects to a city needs no
layout work.

---

## 7. Environment & deploy

`.env.local` (see `.env.example`):

```
RESEND_API_KEY=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
NEXT_PUBLIC_CLOUDFLARE_STREAM_SUBDOMAIN=
NEXT_PUBLIC_HERO_VIDEO_UID=
```

Deployed on Vercel; push to a branch → preview deploy, `main` → production.
`next.config.ts` handles apex→www, legacy `/about*` and retired `/projects`
redirects, and whitelists local `/logos` `/images` `/company-logos` for
`next/image`.

**Brand fonts are NOT wired up.** `public/fonts/README.md` claims `@font-face` is
"already wired up in `globals.css`" — it is not. There are no `@font-face` rules
and no `--font-display` token. Nothing references `.font-display` any more (the
only two call sites went with `/projects`), so wiring the fonts up now means
choosing where they should apply, not just adding the rules.

---

## 8. Known gaps, inconsistencies & TODOs (observed)

Backlog of rough edges found by reading the code. Not all verified end-to-end;
treat as leads, confirm before acting.

1. **`services: Service[]` in `lib/data.ts` is dead code** — the Services page
   only renders `generalContracting`. (7-item array, one `highlight`.)
2. **Brand fonts not wired** — see §7.
3. **`components/contact/MapEmbed.tsx` is unused** — the Contact page inlines its
   own two Google Maps iframes.
4. **`ServicesTabs` is misnamed** — it renders a static card grid, not tabs
   (component is literally `ServicesCards`).
5. **Favicon resolution** — `app/icon.svg` / `app/favicon.ico` exist, but root
   `metadata.icons.icon` overrides `<link rel="icon">` to
   `/company-logos/rose-hill-cropped.svg`, so the app-router icons only serve
   legacy `/favicon.ico` requests.
6. **Hardcoded colors** — Testimonials company text and form error text use
   inline hex (`#CB9E41`, `#b8963e`) instead of tokens. `--color-light-grey` is
   defined but unused.
7. **Careers metadata** — description in `careers/layout.tsx` (authoritative)
   differs from the visible page copy. Minor.
8. **Logo filter mismatch** — the dev `api/logos-meta` endpoint filters
   `.png|.svg`; the production SSR `LogoWall` filters `.webp|.svg`. A PNG-only
   logo shows in dev polling but not in a production build.
9. **No test suite, no CI** in the repo. No error monitoring / analytics.
10. **`sameAs: []`** in `JsonLd.tsx` — no social profiles in structured data.
11. **Careers message field** — server caps `message` at 2000 chars but the
    Careers `<textarea>` has no client `maxLength` (Contact's textarea is
    capped client-side; Contact also *requires* `message`, 1–2000).

---

## 9. Working agreements

- Don't commit or push unless asked. If on `main`, branch first.
- **Do not credit Claude as author or co-author** on commits or PRs.
- Keep diffs minimal and in the style of the surrounding file (comment density,
  naming, the render-time derived-state pattern, semantic tokens).
- After a change: `npm run lint` + `npm run build`, then verify the page in
  `npm run dev`. Report failures with their output; don't paper over them.
