# Pre-Merge SEO & Performance QA Checklist

Use this checklist before merging any PR that adds or materially changes a page (content, layout, templates, metadata). Tick only what you actually verified.

## 1. Content & Semantic Structure
- [ ] Single descriptive H1 (no duplicates) and matches page intent
- [ ] Clear intro paragraph (primary intent / keyword within first 120 words)
- [ ] Logical heading hierarchy (no unjustified skips; h2 → h3 as needed)
- [ ] No thin placeholder sections (blog/article pages ≥ ~300 meaningful words unless intentionally short)
- [ ] At least 3 contextual internal links in body (excludes nav/footer/sidebars)
- [ ] No broken internal links (spot-checked new/edited links)

## 2. Metadata & Markup
- [ ] <title> length ~45–60 chars (concise, differentiating)
- [ ] Meta description ~120–160 chars (compelling, non-keyword-stuffed)
- [ ] Canonical tag present and correct apex (no unintended `www` / query duplication)
- [ ] OG tags (og:title, og:description, og:image) present & relevant
- [ ] Twitter card meta present (`summary_large_image` when image available)
- [ ] JSON-LD (if included) validates (no console errors) and matches visible content
- [ ] No accidental `noindex` or `nofollow` directives
- [ ] `<link rel="alternate" type="application/rss+xml">` unaffected (if editing blog plumbing)

## 3. Media & Accessibility
- [ ] All meaningful images have descriptive `alt`; decorative images use empty alt or `aria-hidden`
- [ ] Largest above-the-fold image uses Next `<Image>` with explicit width & height
- [ ] LCP hero image: optimized (target ≤ 200 KB compressed) & uses `priority` + proper `sizes`
- [ ] No layout shift caused by images (CLS-safe dimensions)

## 4. Performance & Core Web Vitals (Lab Checks)
- [ ] Mobile Lighthouse Performance ≥ 90 (or documented reason if < 90)
- [ ] LCP < 2.5s (lab) on throttled mobile test
- [ ] CLS < 0.1 (no late-loading layout shifts)
- [ ] JS console: no errors or noisy warnings introduced
- [ ] Network: no 404/500 for newly referenced assets

## 5. Analytics & Tracking
- [ ] GA4 page_view firing (check DebugView)
- [ ] Custom events relevant to change (e.g., `lead_form_*`) fire with expected params
- [ ] No duplicate event bursts (e.g., submit firing twice)

## 6. Sitemap / Indexability
- [ ] New page (if applicable) is (or will be) added to sitemap generation logic
- [ ] `robots.txt` does not block the new/modified path
- [ ] URL structure consistent (trailing slash policy unchanged)

## 7. Slugs & Routing Integrity
- [ ] Slug naming consistent (kebab-case, descriptive, stable)
- [ ] No duplicate slug conflict (no shadowed route or overwritten existing page)
- [ ] Internal links updated if slug changed

## 8. Quality & Consistency Extras
- [ ] Keyword intent aligned with user problem (no stuffing)
- [ ] CTAs present & clear (primary action above the fold or near decision points)
- [ ] Structured data (Breadcrumb / Article / FAQ / HowTo) updated if content meaning changed
- [ ] Date metadata (for blog) correct & in ISO format

## 9. Post-Merge Follow-Ups (Track After Deployment)
- [ ] Inspect URL in Google Search Console once deployed
- [ ] Monitor GA4 for initial engagement & event integrity
- [ ] Optional: Capture baseline Lighthouse report (store score in PR comments)

## 10. Quick Triage for Rejections
If any of these are true, request revisions before merge:
- Missing or incorrect canonical
- Title/description grossly out of range or duplicate of another core URL
- LCP asset > 400 KB or no dimensions
- Introduces console errors or broken internal links
- JSON-LD syntax error for a previously valid page

---
**Tip:** Paste this checklist into your PR description and check items as you verify them. For small copy-only edits (typo, wording) you may mark only directly impacted items.
