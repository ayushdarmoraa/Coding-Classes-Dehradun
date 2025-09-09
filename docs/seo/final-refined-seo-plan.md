# Final Refined SEO Plan (Local + National/Online)

Scope: dooncodingacademy.in (Next.js App Router) + repo integration

Target: India (national online) + Dehradun (local)

Tools assumed: Google Search Console (GSC) + Google Analytics 4 (GA4)

Saved: 2025-09-08

---

## A. What carries over vs. what changes (quick reconciler)

Keep:
- Online-courses section, /vs comparisons, deeper course pages, FAQ expansion, success stories, content velocity (local + national)
- Core Web Vitals (CWV) guardrails, redirects cleanup, OG/Twitter metadata, Course & FAQ schema

Fix wording / precision:
- “Google My Business” → Google Business Profile (GBP)
- Local schema is already present; extend and verify (not add from scratch)

Add what was missing:
- Concrete site architecture, internal link map, and sitemap contract
- Reusable code patterns (metadata, schema, redirects) with acceptance tests
- Content factory (templates, briefs, editorial calendar)
- Measurement (event & goal map), rollout gates (QA checklists)

---

## B. Information Architecture (IA) & URL Contract

1) Core sections
- / (Home) — dual intent: Dehradun + Online India; fold in Why-DCA, Why-Online, proof, FAQ
- /courses (index) → /courses/[slug] (Offline/Hybrid emphasis; Dehradun terms remain)
- /online-courses (index) → /online-courses/[slug] (Online emphasis; India-wide)
  - Slugs v1: full-stack, data-science, python, java
- /vs/[competitor] (comparison hub): v1: coding-ninjas, scaler (add pw-skills later if needed)
- /locations/dehradun (keep) → later: /locations/[city] content-only “learn online from [City]” landers
- /blog (+ categories/tags you already use)
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

## D. Content System (“factory”), not just a list

D1) Page templates (copy blocks you can reuse)
- Home: H1 with “Coding Courses in Dehradun & Online in India”. Why DCA (600–800 words) with bullets (small batches, GenAI in curriculum, projects, placement). Why Online with DCA (300–400 words): live + recording, mentor hours, peer community. Snapshot table (Mode / Duration / Price / Placement rate). 3–4 Success stories (name + role + company + CTC if allowed). FAQ (8–10) mixing local + online questions.
- /courses/[slug] (offline): H1: “{Course} in Dehradun (On-Campus/Hybrid)” Outcome bullets, Prerequisites, Weekly/Module breakdown (150–200 words per module), What you’ll build (3–5 projects), Placement support, Campus info (map/city). CTA + link to online version.
- /online-courses/[slug] (online): H1: “Online {Course} in India (Live + Projects)” Mirror offline page but emphasize delivery, schedule, tools, cohort flow, recordings, support, no physical location; link back to offline version.
- /vs/[competitor]: H1: “Doon Coding Academy vs {Competitor} (2025)” Comparison table (curriculum span, price, format, batch size, placement help, mentor ratio). “Who should pick which?” + CTA to relevant online course.
- /locations/dehradun: 600–1000 words about learning in Dehradun + transport + campus, plus “If you’re not local: join online cohorts”.

D2) Blog clusters (with search intent)
- Local cluster (2/mo min): “Top Coding Jobs in Dehradun 2025”; “Cost of Learning Programming in Dehradun (Fees, Duration, ROI)”; “Colleges vs Bootcamps in Dehradun: Which suits you?”
- Online/national cluster (4–6/mo): “Learn Full-Stack Online: Complete Roadmap (India)”; “Best Online Data Science Courses in India (Hands-on & Placement)”; “Live vs Recorded Coding Classes: Pros & Cons (For Indian learners)”; “How to Get Placed After an Online Bootcamp (Portfolio + Interviews)”; “DCA vs Coding Ninjas vs Scaler (2025 Comparison)”; “Top 10 Online Coding Classes in India (Fees, Duration, Outcomes)”
- Templates: Every post ends with FAQ (3–5 Qs) + CTA to the most relevant online course

D3) Editorial calendar (first 8 weeks)
- Week 1: Home Why DCA + Why Online; 2 posts (Roadmap FS Online, Dehradun Jobs 2025)
- Week 2: Publish /online-courses/full-stack + /vs/coding-ninjas; 2 posts (Live vs Recorded, Visit Campus Guide)
- Week 3: /online-courses/data-science; 2 posts (Best Online DS India, Placement after bootcamp)
- Week 4: /online-courses/python; 2 posts (Top 10 Online Classes India, Dehradun Fees & ROI)
- Week 5: /online-courses/java; /vs/scaler; 2 posts (Interview Prep for Bootcamp Grads, Portfolio Guide)
- Week 6–8: 2–3 posts/week + enrich course pages (projects gallery, outcomes screenshots), begin backlink outreach

---

## E. On-Page SEO specifics (non-negotiables)

- H1: one per page; contains primary keyword + qualifier (Dehradun/Online India)
- Meta title: ≤ 60 chars; Meta desc: 140–160 chars with value prop + CTA
- Alt text: descriptive, not stuffed (tech/tool names okay)
- Internal links: 3–5 per page pointing to next step (FAQ, relevant course, contact)
- Avoid duplication: Online page copy ≠ Offline copy (change framing, examples, FAQs)
- Canonical: each page self-canonical; /online-* and /courses-* are distinct

---

## F. GBP (Local) & NAP consistency

- GBP: ensure profile is created/claimed and matches site NAP exactly
- Citations: update top Indian directories (Justdial, Sulekha, Google Maps, Bing Places) with same name, address, phone; link to /locations/dehradun
- On-site NAP: footer NAP + LocalBusiness JSON-LD (already present) stays in sync

---

## G. Off-Page & Authority

- Stage 1 (Weeks 4–8): Education blogs, local news, regional tech communities; pitch “DCA launches national live online cohorts” + data-rich guides (Roadmap FS, DS listicle)
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

Content pipeline (parallel)
- Week 1–4: 8 posts (list above)
- Week 5–8: 6–8 posts (interview prep, portfolio, listicles, city-adjacent)

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
- Two blog posts/week (one national, one local) — start with FS Roadmap + Dehradun Jobs
- /vs/coding-ninjas (captures comparison intent fast)
- Data Science online page + “Best Online DS India” post
- Remaining online slugs (Python, Java) + /vs/scaler
- Outreach wave #1 (pitch roadmap + DS listicle) and keep publishing

---

Notes:
- Keep parity across offline/online course pages for schema, metadata, and internal links
- Use acceptance criteria listed per section as ship gates in PR reviews
- This file is the single source of truth for SEO execution; update it as decisions evolve