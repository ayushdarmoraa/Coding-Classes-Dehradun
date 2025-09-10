## Summary
Describe the change and its purpose.

## Pre-Merge SEO & Performance QA
(Reference: docs/seo-qa-checklist.md) — Check only what you verified for this PR.

### 1. Content & Semantics
- [ ] Single H1, clear intro, logical headings
- [ ] ≥3 contextual internal links (if applicable)
- [ ] No broken internal links

### 2. Metadata
- [ ] Title & meta description within recommended lengths
- [ ] Canonical correct (apex, no unintended www/query)
- [ ] OG & Twitter tags accurate (if affected)

### 3. Media & Performance
- [ ] Hero / LCP image optimized (≤200 KB) + dimensions
- [ ] No new layout shifts (CLS safe)
- [ ] Mobile Lighthouse ≥90 or documented reason

### 4. Analytics
- [ ] GA4 page_view firing
- [ ] Relevant custom events firing once (e.g., lead_form_submit)

### 5. Indexability
- [ ] Sitemap will include / updated for new page
- [ ] robots.txt not blocking

### 6. Structured Data (if present)
- [ ] JSON-LD valid (no console errors)

### 7. Slugs & Routing
- [ ] No duplicate / conflicting slug
- [ ] Internal links updated if slug changed

### 8. Extras
- [ ] LCP <2.5s (lab) & CLS <0.1
- [ ] Alt text present on meaningful images

## Notes / Exceptions
Document any intentional deviations (with reason & follow-up plan):

-

## Screenshots / Reports (Optional)
Attach Lighthouse / console / GA DebugView evidence if helpful.
