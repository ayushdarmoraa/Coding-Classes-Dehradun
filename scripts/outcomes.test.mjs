import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";
import {
  analyzeRenderedPage,
  getPublishedOutcomeRoutes,
} from "./seo-qa-check.js";

const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));
const nativeRequire = createRequire(import.meta.url);
const moduleCache = new Map();

function loadTypeScript(relativePath, mocks = {}) {
  const filename = path.resolve(repositoryRoot, relativePath);
  if (moduleCache.has(filename)) return moduleCache.get(filename).exports;

  const loadedModule = { exports: {} };
  moduleCache.set(filename, loadedModule);
  const source = readFileSync(filename, "utf8");
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      esModuleInterop: true,
      jsx: ts.JsxEmit.ReactJSX,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  }).outputText;
  const localRequire = (specifier) =>
    Object.hasOwn(mocks, specifier)
      ? mocks[specifier]
      : specifier === "./testimonials"
        ? testimonialsModule
        : nativeRequire(specifier);

  new Function("require", "module", "exports", compiled)(
    localRequire,
    loadedModule,
    loadedModule.exports,
  );
  return loadedModule.exports;
}

const testimonialsModule = loadTypeScript("src/lib/testimonials.ts");
const outcomes = loadTypeScript("src/lib/outcomes.ts");

function metric(overrides = {}) {
  return {
    kind: "completion",
    slug: "test-completion",
    title: "Test-only completion metric",
    publicStatement: "Test-only statement, not a real learner outcome.",
    sourceLabel: "Test-only source label",
    definition: "Test-only definition for validating the metric contract.",
    numerator: 2,
    denominator: 4,
    eligibleCohort: "Test-only cohort",
    periodStart: "2025-01-01",
    periodEnd: "2025-03-31",
    sampleSize: 4,
    exclusions: ["Test-only exclusion"],
    limitations: "Test-only limitation.",
    sourceEvidenceReference: "test-source-ref",
    sourceVerified: true,
    claimVerified: true,
    verificationOwner: "Test verifier",
    verifiedAt: "2025-04-01",
    businessApprovalReference: "test-approval-ref",
    businessApproved: true,
    published: true,
    ...overrides,
  };
}

function testimonial(overrides = {}) {
  return {
    author: "Test-only learner",
    text: "Test-only quote; not a real testimonial.",
    source: "Test-only testimonial source",
    consentVerified: true,
    verified: true,
    ...overrides,
  };
}

test("owner-approved WhatsApp testimonials are publishable and no demo data is used", () => {
  const content = outcomes.getPublishedOutcomeContent();
  assert.deepEqual(
    content.stories.map(({ attribution, quote }) => [attribution, quote]),
    [
      [
        "Aarav Sharma",
        "The practical coding exercises helped me understand programming concepts better. I enjoyed learning through hands-on projects.",
      ],
      [
        "Priya Verma",
        "Working on frontend and backend concepts gave me a better understanding of full-stack web development.",
      ],
      [
        "Rahul Mehta",
        "The coding challenges helped me practice logical thinking and improve my problem-solving approach.",
      ],
    ],
  );
  assert.equal(content.metrics.length, 0);
  assert.ok(outcomes.hasPublishedOutcomeContent());
  assert.deepEqual(getPublishedOutcomeRoutes(), ["/outcomes"]);
  for (const story of content.stories) {
    assert.equal(story.sourceLabel, "WhatsApp");
    assert.match(story.quote, /\w/);
  }
});

test("empty Outcomes remain noindex and unavailable in development", () => {
  const pagePath = path.resolve(repositoryRoot, "src/app/outcomes/page.tsx");
  moduleCache.delete(pagePath);
  const priorEnvironment = process.env.NODE_ENV;
  process.env.NODE_ENV = "development";

  try {
    const emptyContent = { metrics: [], stories: [] };
    const page = loadTypeScript("src/app/outcomes/page.tsx", {
      "@/components/outcomes/OutcomesContent": {
        __esModule: true,
        default: (props) => props,
      },
      "@/lib/outcomes": {
        getPublishedOutcomeContent: () => emptyContent,
        hasPublishedOutcomeContent: () => false,
      },
      "@/lib/site-config": { SITE: { url: "https://dooncodingacademy.in" } },
      "next/navigation": {
        notFound() {
          throw new Error("NEXT_NOT_FOUND");
        },
      },
    });

    assert.deepEqual(page.generateMetadata().robots, {
      index: false,
      follow: false,
    });
    assert.throws(() => page.default(), /NEXT_NOT_FOUND/);
  } finally {
    if (priorEnvironment === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = priorEnvironment;
    moduleCache.delete(pagePath);
  }
});

test("metric validation requires coherent counts and a valid measurement period", () => {
  assert.doesNotThrow(() => outcomes.validateOutcomeEvidence([metric()]));
  assert.throws(
    () => outcomes.validateOutcomeEvidence([metric({ numerator: 5 })]),
    /numerator/i,
  );
  assert.throws(
    () =>
      outcomes.validateOutcomeEvidence(
        [metric({ periodStart: "2025-04-01", periodEnd: "2025-03-31" })],
      ),
    /period/i,
  );
  assert.throws(
    () =>
      outcomes.validateOutcomeEvidence(
        [metric({ periodStart: "2025-02-31" })],
      ),
    /calendar date/i,
  );
  assert.throws(
    () => outcomes.validateOutcomeEvidence([metric({ kind: "placement" })]),
    /what counts as placed/i,
  );
  assert.doesNotThrow(() =>
    outcomes.validateOutcomeEvidence(
      [metric({ kind: "placement", published: false })],
    ),
  );
  assert.doesNotThrow(() =>
    outcomes.validateOutcomeEvidence(
      [metric({ kind: "placement", placementDefinition: "Test-only placement definition." })],
    ),
  );
  assert.throws(
    () =>
      outcomes.validateOutcomeEvidence(
        [metric({ kind: "project-completion" })],
      ),
    /publication permission/i,
  );
  assert.doesNotThrow(() =>
    outcomes.validateOutcomeEvidence(
      [metric({ kind: "project-completion", published: false })],
    ),
  );
});

test("publication excludes metrics without verified sources, claims, or business approval", () => {
  const ineligibleMetrics = [
    metric({ sourceVerified: false }),
    metric({ claimVerified: false }),
    metric({ businessApproved: false }),
  ];

  for (const ineligibleMetric of ineligibleMetrics) {
    const content = outcomes.getPublishedOutcomeContent([ineligibleMetric], []);
    assert.deepEqual(content.metrics, []);
  }
});

test("publication fails closed when project-completion permission is missing or unverified", () => {
  const missingPermission = metric({
    kind: "project-completion",
    consentVerified: true,
    consentScope: ["project"],
  });
  const unverifiedPermission = metric({
    kind: "project-completion",
    consentEvidenceReference: "test-project-consent-ref",
    consentVerified: false,
    consentScope: ["project"],
  });

  for (const projectMetric of [missingPermission, unverifiedPermission]) {
    assert.throws(
      () => outcomes.getPublishedOutcomeContent([projectMetric], []),
      /publication permission/i,
    );
  }
});

test("Outcomes stories derive only from verified, consented central testimonials", () => {
  const rejectedTestimonials = [
    testimonial({ author: "Unverified learner", verified: false }),
    testimonial({ author: "No-consent learner", consentVerified: false }),
    testimonial({ author: "", verified: true, consentVerified: true }),
    testimonial({ author: "No-quote learner", text: " " }),
    testimonial({ author: "No-source learner", source: "" }),
    testimonial({
      author: "Unsafe-source learner",
      sourceUrl: "javascript:alert(1)",
    }),
  ];
  const content = outcomes.getPublishedOutcomeContent(
    [metric()],
    [testimonial(), ...rejectedTestimonials],
  );

  assert.deepEqual(content.metrics.map(({ slug }) => slug), ["test-completion"]);
  assert.deepEqual(content.stories, [
    {
      slug: "testimonial-1",
      attribution: "Test-only learner",
      quote: "Test-only quote; not a real testimonial.",
      sourceLabel: "Test-only testimonial source",
    },
  ]);
  const schema = outcomes.buildOutcomeItemListSchema(content);
  assert.deepEqual(
    schema.itemListElement.map(({ item }) => item.name),
    ["Test-only completion metric", "Test-only learner"],
  );
  const OutcomesContent = loadTypeScript("src/components/outcomes/OutcomesContent.tsx", {
    "@/lib/outcomes": outcomes,
  }).default;
  const markup = renderToStaticMarkup(
    React.createElement(OutcomesContent, content),
  );
  for (const rejected of rejectedTestimonials) {
    if (rejected.author) assert.doesNotMatch(markup, new RegExp(rejected.author));
  }
});

test("eligible central testimonial source links are carried into Outcomes safely", () => {
  const content = outcomes.getPublishedOutcomeContent(
    [],
    [testimonial({ sourceUrl: "https://reviews.example.test/testimonial/1" })],
  );
  const OutcomesContent = loadTypeScript("src/components/outcomes/OutcomesContent.tsx", {
    "@/lib/outcomes": outcomes,
  }).default;
  const markup = renderToStaticMarkup(
    React.createElement(OutcomesContent, content),
  );

  assert.match(markup, /href="https:\/\/reviews\.example\.test\/testimonial\/1"/);
  assert.match(markup, /rel="noopener noreferrer"/);
  assert.match(markup, /opens in a new tab/);
});

test("canonical testimonial registry enforces its existing verification and consent flags", () => {
  const sourceRecords = [
    testimonial(),
    testimonial({ author: "Unverified", verified: false }),
    testimonial({ author: "No consent", consentVerified: false }),
    testimonial({ author: "Empty quote", text: " " }),
  ];
  assert.deepEqual(
    testimonialsModule.getPublishableTestimonials(sourceRecords),
    [sourceRecords[0]],
  );
  assert.deepEqual(
    testimonialsModule.testimonials.map(({ author, verified, consentVerified }) => [
      author,
      verified,
      consentVerified,
    ]),
    [
      ["Aarav Sharma", true, true],
      ["Priya Verma", true, true],
      ["Rahul Mehta", true, true],
    ],
  );
});

test("duplicate metric evidence slugs are rejected", () => {
  assert.throws(
    () =>
      outcomes.validateOutcomeEvidence([
        metric(),
        metric({ slug: "test-completion" }),
      ]),
    /unique|duplicate/i,
  );
});

test("outcomes UI is accessible and JSON-LD contains exactly its visible approved evidence", () => {
  const content = outcomes.getPublishedOutcomeContent([metric()], [testimonial()]);
  const OutcomesContent = loadTypeScript("src/components/outcomes/OutcomesContent.tsx", {
    "@/lib/outcomes": outcomes,
  }).default;
  const markup = renderToStaticMarkup(
    React.createElement(OutcomesContent, content),
  );
  const jsonLdMatch = markup.match(
    /<script type="application\/ld\+json">([\s\S]*?)<\/script>/,
  );

  assert.match(markup, /<main\b/);
  assert.match(markup, /<h1\b/);
  assert.match(markup, /Test-only completion metric/);
  assert.match(markup, /Test-only learner/);
  assert.match(markup, /2 \/ 4/);
  assert.match(markup, /Test-only cohort/);
  assert.match(markup, /Test-only limitation\./);
  assert.match(markup, /Test-only source label/);
  assert.match(markup, /Test-only testimonial source/);
  assert.match(markup, /Course completion/);
  assert.match(markup, /Verified learner stories/);
  assert.match(markup, /grid-cols-1 gap-5 md:grid-cols-2/);
  assert.match(markup, /aria-labelledby="outcomes-title"/);
  assert.ok(jsonLdMatch, "approved visible evidence should have matching JSON-LD");
  const schema = JSON.parse(jsonLdMatch[1]);
  assert.deepEqual(
    schema.itemListElement.map(({ item }) => [item.name, item.description]),
    [
      ["Test-only completion metric", "Test-only statement, not a real learner outcome."],
      ["Test-only learner", "Test-only quote; not a real testimonial."],
    ],
  );
});

test("approved learner stories enable canonical Outcomes discovery", async () => {
  const page = loadTypeScript("src/app/outcomes/page.tsx", {
    "@/components/outcomes/OutcomesContent": { __esModule: true, default: () => null },
    "@/lib/outcomes": outcomes,
    "@/lib/site-config": { SITE: { url: "https://dooncodingacademy.in" } },
    "next/navigation": {
      notFound() {
        throw new Error("NEXT_NOT_FOUND");
      },
    },
  });
  const metadata = page.generateMetadata();
  const nav = loadTypeScript("src/lib/nav.ts", {
    "@/lib/outcomes": outcomes,
  }).NAV_LINKS;

  assert.equal(metadata.robots, undefined);
  assert.equal(metadata.alternates.canonical, "https://dooncodingacademy.in/outcomes");
  assert.doesNotThrow(() => page.default());
  assert.equal(nav.some(({ href }) => href === "/outcomes"), true);
  assert.deepEqual(await getPublishedOutcomeRoutes(), ["/outcomes"]);

  const sitemapPath = path.resolve(repositoryRoot, "src/app/sitemap.ts");
  const sitemap = loadTypeScript("src/app/sitemap.ts", {
    "@/lib/courses": { getCourses: async () => [], isCourseModeAvailable: () => false },
    "@/lib/blog": { getAllBlogPosts: async () => [], getPostLastModified: async () => undefined },
    "@/lib/lab/challenges": { getPublishedChallenges: () => [] },
    "@/lib/lab/challenge-utils": { getChallengePath: () => "" },
    "@/lib/projects": { getPublishedProjects: () => [], getProjectPath: () => "" },
    "@/lib/outcomes": outcomes,
    "@/lib/site-config": { SITE: { url: "https://dooncodingacademy.in" } },
  });
  const sitemapEntries = await sitemap.default();
  assert.equal(sitemapEntries.some(({ url }) => url.endsWith("/outcomes")), true);
});

test("approved evidence enables canonical metadata and renders the page", () => {
  const pagePath = path.resolve(repositoryRoot, "src/app/outcomes/page.tsx");
  moduleCache.delete(pagePath);
  const approvedContent = outcomes.getPublishedOutcomeContent(
    [metric()],
    [testimonial()],
  );
  const page = loadTypeScript("src/app/outcomes/page.tsx", {
    "@/components/outcomes/OutcomesContent": { __esModule: true, default: () => null },
    "@/lib/outcomes": {
      getPublishedOutcomeContent: () => approvedContent,
      hasPublishedOutcomeContent: () => true,
    },
    "@/lib/site-config": { SITE: { url: "https://dooncodingacademy.in" } },
    "next/navigation": {
      notFound() {
        throw new Error("NEXT_NOT_FOUND");
      },
    },
  });
  const metadata = page.generateMetadata();

  assert.equal(metadata.alternates.canonical, "https://dooncodingacademy.in/outcomes");
  assert.ok(metadata.description.length > 0);
  const html = `
    <html>
      <head>
        <title>${metadata.title}</title>
        <meta name="description" content="${metadata.description}">
        <link rel="canonical" href="${metadata.alternates.canonical}">
        <script type="application/ld+json">${JSON.stringify(
          outcomes.buildOutcomeItemListSchema(approvedContent),
        )}</script>
      </head>
      <body><main><h1>Learner stories</h1></main></body>
    </html>
  `;
  assert.deepEqual(
    analyzeRenderedPage(html, "/outcomes"),
    [],
  );
  assert.doesNotThrow(() => page.default());
});

test("Outcomes title uses the root layout template exactly once", () => {
  const pagePath = path.resolve(repositoryRoot, "src/app/outcomes/page.tsx");
  const layoutPath = path.resolve(repositoryRoot, "src/app/layout.tsx");
  moduleCache.delete(pagePath);
  moduleCache.delete(layoutPath);

  const page = loadTypeScript("src/app/outcomes/page.tsx", {
    "@/components/outcomes/OutcomesContent": { __esModule: true, default: () => null },
    "@/lib/outcomes": outcomes,
    "@/lib/site-config": { SITE: { url: "https://dooncodingacademy.in" } },
    "next/navigation": {
      notFound() {
        throw new Error("NEXT_NOT_FOUND");
      },
    },
  });
  const rootLayout = loadTypeScript("src/app/layout.tsx", {
    "./globals.css": {},
    "@/components/layout/HeaderClient": { __esModule: true, default: () => null },
    "@/components/layout/Footer": { __esModule: true, default: () => null },
    "@/components/layout/FloatingWhatsApp": { __esModule: true, default: () => null },
    "@/components/layout/StickyCtaBar": { __esModule: true, default: () => null },
    "@/components/motion/MotionProvider": { __esModule: true, default: ({ children }) => children },
    "@/components/motion/RevealOnScroll": { __esModule: true, default: () => null },
    "next/font/google": {
      Figtree: () => ({ variable: "font-figtree" }),
      JetBrains_Mono: () => ({ variable: "font-jetbrains-mono" }),
      Outfit: () => ({ variable: "font-outfit" }),
    },
    "next/script": { __esModule: true, default: () => null },
    "@/lib/courses": { getCourses: async () => [] },
    "@/lib/pricing": { formatINR: () => "" },
    "@/lib/lab/analytics-metadata": { PUBLISHED_LAB_ANALYTICS_METADATA: [] },
    "@/lib/site-config": {
      SITE: {
        url: "https://dooncodingacademy.in",
        name: "Doon Coding Academy",
        description: "Leading coding institute in Dehradun.",
      },
    },
  });

  const pageTitle = page.generateMetadata().title;
  const titleTemplate = rootLayout.metadata.title.template;

  assert.equal(pageTitle, "Learner Stories");
  assert.equal(titleTemplate, "%s | Doon Coding Academy");
  assert.equal(
    titleTemplate.replace("%s", pageTitle),
    "Learner Stories | Doon Coding Academy",
  );
});

test("SEO QA requires visible approved evidence and matching ItemList schema", () => {
  const html = `
    <html>
      <head>
        <title>Learner Outcomes | Doon Coding Academy</title>
        <meta name="description" content="Verified outcomes are presented with clear cohort definitions, source checks, measurement periods, and limitations.">
        <link rel="canonical" href="https://dooncodingacademy.in/outcomes">
      </head>
      <body><main><h1>Learner stories</h1></main></body>
    </html>
  `;
  assert.ok(
    analyzeRenderedPage(html, "/outcomes").some((issue) =>
      issue.includes("missing ItemList JSON-LD"),
    ),
  );
});

test("only owner-approved testimonials appear on the public testimonials page", () => {
  const testimonialModule = loadTypeScript("src/lib/testimonials.ts");
  const schemaModule = loadTypeScript("src/lib/schema.ts", {
    "./courses": { isCourseModeAvailable: () => false },
    "./pricing": { courseDurationToIso: () => "", formatCourseDuration: () => "" },
    "./site-config": { SITE: { url: "https://dooncodingacademy.in" } },
  });
  const testimonialPage = loadTypeScript("src/app/testimonials/page.tsx", {
    "@/lib/testimonials": testimonialModule,
    "@/lib/schema": schemaModule,
    "@/lib/site-config": {
      SITE: {
        url: "https://dooncodingacademy.in",
        name: "Doon Coding Academy",
        description: "Leading coding institute in Dehradun.",
      },
    },
    "next/script": { __esModule: true, default: () => null },
    "next/link": {
      __esModule: true,
      default: ({ href, children }) => React.createElement("a", { href }, children),
    },
  });
  const markup = renderToStaticMarkup(
    React.createElement(testimonialPage.default),
  );

  assert.deepEqual(
    testimonialModule.testimonials.map(({ author, source }) => [author, source]),
    [
      ["Aarav Sharma", "WhatsApp"],
      ["Priya Verma", "WhatsApp"],
      ["Rahul Mehta", "WhatsApp"],
    ],
  );
  assert.ok(schemaModule.generateTestimonialSchema(testimonialModule.testimonials));
  assert.match(markup, /Aarav Sharma/);
  assert.match(markup, /Priya Verma/);
  assert.match(markup, /Rahul Mehta/);
  assert.doesNotMatch(markup, /AggregateRating/);
});
