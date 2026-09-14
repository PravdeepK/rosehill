---
name: new-page
description: >-
  Scaffold a new route in the Rose Hill site (app/<route>/page.tsx) so it matches
  repo conventions — metadata + canonical, sitemap entry, nav/footer wiring,
  server-vs-client split, shared UI primitives, and design tokens. Use whenever
  adding a page or a dynamic route segment under app/.
---

# Adding a route

App Router, `app/<segment>/page.tsx`. Follow the existing pages
(`app/services/page.tsx`, `app/contact/page.tsx`, `app/careers/`) — don't invent
a new shape.

## 1. Decide server vs client

Default: **server component** (no directive). Only add `"use client"` if the
page itself needs state / effects / browser APIs (like `app/careers/page.tsx`).
Prefer keeping interactivity in a child component and leaving the page a server
component.

## 2. Metadata (required on every route)

Server component — export from `page.tsx`:

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Name",                    // bare string; root layout adds " | Leaders in Luxury"
  description: "One sentence, brand name first where natural.",
  alternates: { canonical: "/route" },
};
```

Client component — `page.tsx` **cannot** export `metadata`. Add a sibling
`app/<segment>/layout.tsx` that exports it and returns `children` (copy
`app/careers/layout.tsx` verbatim, swap the strings).

Keep the visible page copy and the `description` consistent (see CLAUDE.md §8.8
for where this drifted before).

## 3. Sitemap (required for anything indexable)

`app/sitemap.ts` is a **hand-maintained array**. Add an entry:

```ts
{ url: `${SITE_URL}/route`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
```

Pick `priority` relative to the existing ones (home 1.0, projects 0.9, services
0.8, contact 0.8, careers 0.7). Skip this only for noindex/utility pages.

## 4. Navigation

- Primary page → add `{ label, href }` to the `links` array in
  `components/layout/Navbar.tsx` (it also renders the mobile menu from the same
  array) and, if appropriate, `navLinks` in `components/layout/Footer.tsx`.
- Match the existing `href` style (`/route`, no trailing slash).
- Leaving a page out of nav is a real decision — call it out, don't do it by
  omission (that's how `/projects` ended up orphaned).

## 5. Structure & style

- Wrap sections in `<section className="... px-6 lg:px-8">` with an inner
  `<div className="max-w-7xl mx-auto">` (or `max-w-3xl` for form pages).
- Section eyebrow: `<SectionLabel>` from `components/ui/`. On a dark section
  (`bg-dark`) pass `color="text-gold"`.
- Scroll-in animation: wrap blocks in `<Reveal>` (optionally `delay={100}`).
- Buttons/links: `components/ui/Button` (`variant="primary" | "outline"`,
  `href` makes it a `<Link>`).
- Colors and fonts: `@theme` tokens only — `gold gold-light gold-contrast
  warm-white warm-grey dark medium-grey`. No raw hex.
- `<h1>` once per page; `font-light` headings are the house style.

## 6. Dynamic segments (`app/route/[id]/page.tsx`)

- `export function generateStaticParams()` from the source data in `lib/` so
  pages prerender (no DB / fetch at runtime).
- `export function generateMetadata({ params })` for per-item title/description +
  `alternates.canonical: /route/${id}`.
- Call `notFound()` for an unknown `id`.
- If a listing page implies detail links (e.g. `/projects` "View Project"),
  either build the `[id]` route or make the card not look like a link.

## 7. Forms + email (if the page submits)

Client form component in `components/`, POSTing to a new `app/api/<name>/route.ts`
that mirrors `app/api/contact/route.ts`:

- Upstash sliding-window rate limit keyed on `x-forwarded-for`.
- `website` honeypot field → return `{ success: true }` silently if filled.
- Validate every field server-side; cap free-text length and mirror that cap as
  `maxLength` on the client input.
- Send via `resend.emails.send`; recipient + limit are per-route constants.
- Never expose `RESEND_API_KEY` / Upstash env to the client.

## 8. Verify

`npm run lint` → `npm run build` → `npm run dev`, then check: the page renders,
`<title>` shows `Name | Leaders in Luxury`, view-source has the canonical link,
`/sitemap.xml` lists the URL, nav link works and marks active, and it looks right
at mobile + desktop widths.
