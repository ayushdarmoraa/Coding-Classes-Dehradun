# Project screenshots

Unverified project images are stored outside `public` under
`src/unpublished-project-assets/<slug>/` and are not served by the site. Move
an image into `public/projects/<slug>/` only after confirming permission to
publish the asset and recording the matching `assetPublicationPermission` in
`src/lib/projects.ts`:

- `personal-project-owner-verified` for a personal project
- `internship-organization-verified` for an internship project
- `other-rightsholder-verified` for other origins

This permission is separate from consent for identifiable contributors.
Student projects require both verified contributor consent and permission to
publish their assets. Use `unverified` and keep the project unpublished when
the applicable permission is unknown.

Store approved, genuine project screenshots in a folder named for the project
slug, for example:

```text
public/projects/ai-resume-builder/dashboard.webp
```

In `src/lib/projects.ts`, add the matching local path and concise descriptive
alt text to that project's `screenshots` array. Use screenshots that have been
reviewed for personal data, credentials, API keys, and other private details.
Do not use stock images, mockups, or generated images as project evidence.

## Publication-count decision

The implementation uses a minimum of three eligible projects before exposing
the Projects index, detail pages, or sitemap entries. This is an explicit
product decision: the implementation plan requires a "small number" of genuine
projects but does not define a numeric minimum, while the visualization shows
3–6 cards. Three follows that visual lower bound; it is not a numeric mandate
from the plan.

The public routes and sitemap remain gated until at least three projects are
explicitly marked `published`, have the required factual content and origin,
pass applicable contributor-consent and asset-publication-permission checks,
and reference existing local screenshot files. This decision does not permit
inventing projects or publishing work without authorization.
