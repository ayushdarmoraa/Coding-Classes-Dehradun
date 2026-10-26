# Final Refined SEO Plan (Local + National/Online)

Scope: dooncodingacademy.in (Next.js App Router) + repo integration

Target: India (national online) + Dehradun (local)

Tools assumed: Google Search Console (GSC) + Google Analytics 4 (GA4)

Saved: 2025-09-08

---

## A. What carries over vs. what changes (quick reconciler)

Keep:
- Online-courses section, /vs comparisons, deeper course pages, FAQ expansion, and verified success evidence
- Core Web Vitals (CWV) guardrails, redirects cleanup, OG/Twitter metadata, Course & FAQ schema

Fix wording / precision:
- “Google My Business” → Google Business Profile (GBP)
- Local schema is already present; extend and verify (not add from scratch)

Add what was missing:
- Concrete site architecture, internal link map, and sitemap contract
- Reusable code patterns (metadata, schema, redirects) with acceptance tests
- An editorial review process for accurate, useful Guides connected to relevant learning content
- Measurement (event & goal map), rollout gates (QA checklists)

---

## B. Information Architecture (IA) & URL Contract

1) Core sections
- / (Home) — dual intent: Dehradun + Online India; fold in Why-DCA, Why-Online, proof, FAQ
- /courses (index) → /courses/[slug] (Offline/Hybrid emphasis; Dehradun terms remain)
- /online-courses (index) → /online-courses/[slug] (Online emphasis; India-wide)
  - Slugs v1: full-stack, data-science, python, java
- /vs/[competitor] (comparison hub): v1: coding-ninjas, scaler (add pw-skills later if needed)
- /locations/dehradun (keep); consider another location page only when it has distinct, verified local information and a clear user need
- /blog as the existing Guides hub (+ existing categories/tags)
- /faq, /about, /contact, /testimonials (keep)

2) Internal link map (minimum viable)
- Home → (cards/hero text) → /courses, /online-courses, featured blog, /faq
- Every course page (offline) → “Not in Dehradun? Learn online” → matching /online-courses/[slug]
- Every online course page → “Near Dehradun? Attend on-campus” → matching /courses/[slug]
- Blog posts → link to one online course + one offline course + FAQ
- /vs/* → link to both the relevant online course and a lead-magnet blog post
- /locations/dehradun → links to all offline courses + /online-courses for nearby cities

3) Sitemap contract
- Static: /, /about, /courses, /online-courses, /blog, /faq, /contact, /testimonials, /locations/dehradun, /vs/*
- Dynamic: /courses/[slug], /online-courses/[slug], /blog/[slug]
- Changefreq: monthly for evergreen pages; weekly for blog index
- Priority (relative): Home 1.0; course/online course 0.9; /vs 0.8; blog post 0.7

---

## C. Code & Technical SEO (Next.js 14, App Router)

C1) Redirects & headers
- Remove duplicate async redirects() so only one host/https canonicalization exists
- Keep one rule set: www. → apex; http → https
- Acceptance: curl -I any variant → single 301 hop → https://dooncodingacademy.in/...

C2) Robots & sitemap
- robots.ts: Allow all; include Sitemap: https://dooncodingacademy.in/sitemap.xml
- sitemap.ts: Programmatically include /online-courses/* and /vs/* (array + lastmod from file mtime or content frontmatter)
- Acceptance: Open sitemap.xml, confirm all new nodes exist; GSC “Sitemaps” shows “Success”

C3) Metadata (global + per route)
- In app/layout.tsx: metadataBase, title template, default OG image 1200x630, twitter.card = summary_large_image
- Fallback canonical via alternates
- Per route (generateMetadata): set specific titles/descriptions/canonicals and OG image if available
- Acceptance: View-source contains 1× <link rel="canonical">, OG/Twitter tags present and correct per page

C4) Structured Data (JSON-LD)
- Global Organization/EducationalOrganization (already present) — keep sameAs, logo (final 512×512 transparent PNG)
- Course pages: /courses/[slug]: Course + CourseInstance with courseMode: "Onsite", location (Dehradun address), offers {price, priceCurrency:"INR"}, provider
- /online-courses/[slug]: Course + CourseInstance with courseMode: "Online"; no physical location; same offers, provider
- FAQPage: keep /faq JSON-LD; replicate FAQ blocks you surface on Home/blog (either include on page where they render or keep canonical FAQ on /faq and internally link)
- BreadcrumbList on posts and course pages (keep parity on new online pages)
- Acceptance: Rich Results Test shows 0 errors for Course/FAQ/Breadcrumb on sample pages (1 per type)

C5) Performance / CWV guardrails
- Fonts: use Google fonts with display=swap (optional later: self-host via next/font)
- Images: use <Image>; set priority on one LCP hero image per page; ensure sizes is set
- JS: lazy-load non-critical components; keep 3rd-party scripts minimal
- Targets: LCP < 2.5s; CLS < 0.1; INP < 200ms
- Acceptance: PSI mobile green for Home, one offline course, one online course after publish

C6) Analytics & events
- GA4 Events: lead_contact_click (WhatsApp/phone), lead_form_start, lead_form_submit, syllabus_download (if PDF added), cta_enroll_click
- Params: page_type (home|course|online_course|blog|vs|locations), course_slug, city (if known)
- GSC: Submit sitemaps, monitor coverage; use URL inspection API for new key pages post-publish

---

## D. Useful, Evidence-Led Content

Prioritize accurate, helpful content over publishing volume. The content system should connect:

```text
Courses + Guides + DCA Lab + Projects + Outcomes
```

- Keep existing useful Guide URLs and improve them when there is reliable source material or a clear learner problem to solve.
- Make Guide pages answer the stated question first; course promotion and other calls to action remain secondary.
- Link a Guide to a course or Lab challenge only when the relationship is verified and the destination is published.
- Use canonical course records for course facts. Publish projects, testimonials, placement claims, and outcomes only with genuine evidence and required permissions.
- Do not mass-generate similar articles or expand city pages by default. A new Guide or location page requires a distinct user need, reliable information, and a review for duplication and accuracy.
- Review content when underlying facts change or an accuracy issue is found; do not impose weekly post quotas or manufacture update dates.

---

## E. On-Page SEO specifics (non-negotiables)

- H1: one per page; contains primary keyword + qualifier (Dehradun/Online India)
- Meta title: ≤ 60 chars; Meta desc: 140–160 chars with value prop + CTA
- Alt text: descriptive, not stuffed (tech/tool names okay)
- Internal links: provide useful links to relevant published learning content; do not add unrelated links to meet a quota
- Avoid duplication: Online page copy ≠ Offline copy (change framing, examples, FAQs)
- Canonical: each page self-canonical; /online-* and /courses-* are distinct

---

## F. GBP (Local) & NAP consistency

- GBP: ensure profile is created/claimed and matches site NAP exactly
- Citations: update top Indian directories (Justdial, Sulekha, Google Maps, Bing Places) with same name, address, phone; link to /locations/dehradun
- On-site NAP: footer NAP + LocalBusiness JSON-LD (already present) stays in sync

---

## G. Off-Page & Authority

- Earn relevant mentions by sharing useful, verifiable educational resources and approved product updates; avoid unsupported launch, cohort, or outcome claims.
- Stage 2 (Months 2–3): “Top bootcamps in India” list inclusions; alumni stories on LinkedIn/Medium (with follow links to DCA)
- Stage 3 (Month 4+): Partnerships (college clubs, hackathons), scholarship page (link magnet), webinars (embed replays; later YouTube channel)

---

## H. Measurement & KPIs

- Rank goals: Local: Top 3 for “coding classes dehradun” + variants. National: Page-1 (Top-5 stretch) for “online coding classes india” + “[course] online india”.
- Leads: Local: 150+/mo inquiries. Online: 1000+/mo inquiries (stretch by Month 6+).
- Content engagement: Avg time on 1.2k–1.8k word posts ≥ 3:00; bounce trending down.
- CWV: LCP < 2.5s, CLS < 0.1, INP < 200ms on mobile for all new top pages.
- Indexation: 100% of /online-courses/* & /vs/* indexed within 7–10 days post-publish (via GSC submission + internal links).

---

## I. Issue tracker (engineer-ready tasks)

Sprint 1 (Week 1–2) – Tech & Home
- Remove duplicate redirects(); confirm 301 chain (1 hop)
- layout.tsx metadata: default OG + Twitter; title template; canonical fallback
- sitemap.ts: add /online-courses/*, /vs/* enumerators
- robots.ts: confirm Allow-all + Sitemap line
- Home content blocks: Why DCA, Why Online, snapshot table, 3–4 success stories, FAQ (10 Qs)
- GA4 events mapping (clicks/forms) + verify in Realtime

Sprint 2 (Week 2–4) – Online section
- Create /online-courses index + four slugs (FS, DS, Python, Java)
- Add Course JSON-LD with courseMode: "Online", offers INR, provider; breadcrumbs
- Cross-links between offline ↔ online pages
- PSI tune LCP/CLS/INP for Home + 1 online course page

Sprint 3 (Week 3–5) – Comparisons & Local
- /vs/coding-ninjas (page + internal links)
- /vs/scaler (page + internal links)
- Enrich /locations/dehradun (≥ 800 words; local transport/context; link to online)

Content review (ongoing)
- Maintain and improve existing Guides using reliable sources and learner feedback.
- Add a Guide only when it addresses a distinct, supported need and offers value beyond existing content.
- Do not use publishing quotas or city-page expansion as default growth tactics.

---

## J. Reusable snippets (drop-in)

Course JSON-LD (ONLINE)

```json
{
  "@context": "https://schema.org",
  "@type": "Course",
  "name": "Online Full-Stack Development (MERN)",
  "description": "Live online, small batches, projects, placement support.",
  "provider": { "@type": "Organization", "name": "Doon Coding Academy", "url": "https://dooncodingacademy.in" },
  "offers": { "@type": "Offer", "price": "25000", "priceCurrency": "INR" },
  "hasCourseInstance": {
    "@type": "CourseInstance",
    "courseMode": "Online",
    "instructor": { "@type": "Person", "name": "Instructor Name" }
  }
}
```

Course JSON-LD (ONSITE)

```json
{
  "@context": "https://schema.org",
  "@type": "Course",
  "name": "Full-Stack Development (MERN) – Dehradun",
  "description": "On-campus/hybrid with live mentorship, projects, and placement support.",
  "provider": { "@type": "Organization", "name": "Doon Coding Academy", "url": "https://dooncodingacademy.in" },
  "offers": { "@type": "Offer", "price": "25000", "priceCurrency": "INR" },
  "hasCourseInstance": {
    "@type": "CourseInstance",
    "courseMode": "Onsite",
    "location": {
      "@type": "Place",
      "name": "Doon Coding Academy, Dehradun",
      "address": { "@type": "PostalAddress", "addressLocality": "Dehradun", "addressRegion": "Uttarakhand", "addressCountry": "IN" }
    },
    "instructor": { "@type": "Person", "name": "Instructor Name" }
  }
}
```

Open Graph / Twitter (default)

```ts
export const metadata = {
  metadataBase: new URL('https://dooncodingacademy.in'),
  title: { default: 'DCA – Coding & Data Science Courses', template: '%s | DCA' },
  openGraph: { type: 'website', siteName: 'Doon Coding Academy', images: [{ url: '/og-image.jpg', width: 1200, height: 630 }] },
  twitter: { card: 'summary_large_image' }
}
```

---

## K. QA Checklists (ship gates)

Pre-merge (per page)
- One H1 with target keyword (Dehradun or Online India)
- Title ≤ 60 chars, Description 140–160 chars, Canonical present
- JSON-LD valid (Course/FAQ/Breadcrumb), zero errors
- Internal links: ≥ 3 (FAQ, relevant course, contact)
- Images: descriptive alt, hero uses <Image priority>
- Lighthouse mobile ≥ 90; LCP element is the expected hero

Post-deploy
- Request indexing in GSC for new pages
- GA4 events firing with correct page_type / course_slug
- Sitemap.xml updated and fetched; Coverage shows “Submitted and indexed”

---

## L. Priorities at a glance (what to do first)

- Fix redirects duplication → deploy
- Home upgrades (Why DCA, Why Online, table, FAQ, stories)
- /online-courses index + Full-Stack page (the biggest national search demand)
- Improve a small number of useful, verified Guides and link them to relevant published courses or Lab challenges
- /vs/coding-ninjas (captures comparison intent fast)
- Data Science online page + “Best Online DS India” post
- Remaining online slugs (Python, Java) + /vs/scaler
- Pursue relevant outreach around useful Guides and verified product information

---

Notes:
- Keep parity across offline/online course pages for schema, metadata, and internal links
- Use acceptance criteria listed per section as ship gates in PR reviews
- This file is the single source of truth for SEO execution; update it as decisions evolve