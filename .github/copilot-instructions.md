# Copilot instructions for this repo

Purpose: make the smallest, correct change that fits existing patterns. Prefer editing in-place. If unsure, see docs/engineering/copilot-guardrails.md.

- Stack & structure
  - Next.js 14 App Router with TypeScript and Tailwind. Pages under `src/app/**/page.tsx`; global shell in `src/app/layout.tsx`.
  - UI and layout components in `src/components/**`; data/helpers in `src/lib/**`; content in `src/content/**`.
  - Blog posts are Markdown/MDX in `src/content/blog` and read by `src/lib/blog.ts` (frontmatter: title, description, date, category, keywords, featured, draft, series, howto* fields).

- SEO and metadata (follow existing contracts)
  - Canonicalization: `layout.tsx` sets `metadataBase` to force https and apex. Each page should set `export const metadata` and, when needed, `alternates: { canonical: "/path" }`.
  - JSON-LD already emitted globally in `layout.tsx` for WebSite, EducationalOrganization, and LocalBusiness.
  - Breadcrumbs: use `breadcrumbLd` from `src/lib/seo.ts` and emit via `<Script type="application/ld+json">` on pages that have a clear trail (courses, locations, blog).
  - SEO QA script (`scripts/seo-qa-check.js`) runs in CI and locally; it expects:
    - Exactly one <h1> within <main> per page.
    - Canonical hint (metadataBase or `alternates.canonical`).
    - Course pages should include Course JSON-LD; location pages should include BreadcrumbList; FAQPage JSON-LD if a visible FAQ section exists.
    - To temporarily skip a file, add a top line comment `// seo-qa-skip`.

- Analytics conventions (GA4)
  - GA is idle-loaded in `layout.tsx`. Delegated click tracking fires:
    - `lead_contact_click` for tel/WhatsApp/Directions links.
    - `cta_enroll_click` for links/buttons that look like Enroll/Consult or go to `/contact`.
  - Client helpers in `src/lib/analytics.ts`: `trackLeadClick`, `trackEnrollClick`, `trackForm('start'|'submit'|'error')`, plus `derivePageContext(pathname)`.
  - Prefer `components/analytics/TrackedLink.tsx` for custom events, or call helpers in onClick.
  - CI check `scripts/check-analytics.js --strict` requires:
    - Location pages to include lead + enroll instrumentation (either helper calls or exact GA event names).
    - VS pages to include enroll instrumentation.
    - `EnquiryForm` to emit `lead_form_*` events.

- Sitemaps, robots, redirects
  - `src/app/sitemap.ts` builds entries from `lib/courses.ts` and `lib/blog.ts`. If adding an online course slug, update `ONLINE_COURSE_SLUGS` set.
  - `src/app/robots.ts` normalizes host and sitemap from `NEXT_PUBLIC_SITE_URL`.
  - `next.config.js` sets HTTP→HTTPS/non‑www redirects and long‑cache headers; keep filenames content‑hashed or update headers accordingly.

- Courses and nav
  - Courses data is centralized in `src/lib/courses.ts` (ids, slugs, copy, durations, pricing via `lib/pricing.ts`). Update here first; pages under `/courses/[slug]` and `/online-courses/[slug]` consume this.
  - Top navigation items live in `src/lib/nav.ts` and rendered by `components/layout/Header.tsx` (desktop dropdown + mobile accordion). Extend these files rather than duplicating.

- Build & run (Node 18+)
  - Dev: `npm run dev`. Prod: `npm run build` then `npm start`.
  - Local checks: `node scripts/seo-qa-check.js`; analytics coverage: `npm run check:analytics -- --strict`.

- Examples (copy existing patterns)
  - Canonical in a page: `export const metadata = { alternates: { canonical: "/courses/python" } }`.
  - Breadcrumbs JSON-LD: `import { breadcrumbLd } from "@/lib/seo";` then emit the JSON via Next `<Script>` using `dangerouslySetInnerHTML`.
  - Track CTA click: `import { trackEnrollClick, derivePageContext } from "@/lib/analytics"; onClick={() => trackEnrollClick({ ...derivePageContext('/courses/python'), variant: 'hero' })}`.

- Guardrails (must-read before larger edits)
  - Follow docs/engineering/copilot-guardrails.md: modify in place; keep public contracts and pricing constants stable; add tests/checks where you change behavior; keep diffs small.

If adding files or changing contracts, propose a short "Patch Plan" first (files touched, contracts preserved, tests/checks impacted).
