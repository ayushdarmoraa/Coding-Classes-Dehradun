import assert from "node:assert/strict";
import test from "node:test";

import {
  analyzeRenderedPage,
  extractLinkedRoutes,
  getPageRoutes,
  getPublishedGuideRoutes,
  PRODUCTION_ORIGIN,
} from "./seo-qa-check.js";

function script(data) {
  return `<script type="application/ld+json">${JSON.stringify(data)}</script>`;
}

function page(route, schemas = [], body = "<main><h1>Page title</h1></main>") {
  return [
    "<title>Page title</title>",
    '<meta name="description" content="A useful page description">',
    `<link rel="canonical" href="${PRODUCTION_ORIGIN}${route}">`,
    body,
    ...schemas.map(script),
  ].join("");
}

test("validates canonical, main heading, and nested Course JSON-LD in rendered HTML", () => {
  const html = page("/courses/full-stack", [
    {
      "@context": "https://schema.org",
      "@graph": [{ "@type": "Course", name: "Full-Stack Development" }],
    },
  ]);

  assert.deepEqual(analyzeRenderedPage(html, "/courses/full-stack"), []);
});

test("validates Lab index metadata, canonical and unique H1 without Course schema", () => {
  const html = page("/lab", [], "<main><h1>DCA Lab</h1><p>Published challenges</p></main>");
  assert.deepEqual(analyzeRenderedPage(html, "/lab"), []);
});

test("requires exactly one semantic main landmark with its page heading inside", () => {
  const missingMain = page("/courses", [], "<div><h1>Courses</h1></div>");
  const missingMainIssues = analyzeRenderedPage(missingMain, "/courses");
  assert.ok(missingMainIssues.includes("expected exactly one <main> landmark, found 0"));
  assert.ok(missingMainIssues.includes("expected exactly one <h1> in <main>, found 0"));

  const duplicateMain = page(
    "/courses",
    [],
    "<main><h1>Courses</h1></main><main><h2>Other content</h2></main>",
  );
  assert.ok(
    analyzeRenderedPage(duplicateMain, "/courses").includes(
      "expected exactly one <main> landmark, found 2",
    ),
  );
});

test("validates server-rendered mission scenario and objective without Course schema", () => {
  const html = page(
    "/lab/javascript/discount-calculation-bug",
    [],
    `<main>
      <h1>Fix the Discount Calculation Bug</h1>
      <article>
        <section><h2>Mission scenario</h2><p>An online store has a discount calculator.</p></section>
        <section><h2>Your objective</h2><p>Fix calculateTotal to return the correct price.</p></section>
      </article>
    </main>`,
  );
  assert.deepEqual(
    analyzeRenderedPage(html, "/lab/javascript/discount-calculation-bug"),
    [],
  );
});

test("reports missing Lab metadata and server-rendered mission content", () => {
  const missingMetadata = page(
    "/lab",
    [],
    "<main><h1>DCA Lab</h1><h1>Duplicate heading</h1></main>",
  )
    .replace("<title>Page title</title>", "")
    .replace('<meta name="description" content="A useful page description">', "");
  const indexIssues = analyzeRenderedPage(missingMetadata, "/lab");
  assert.ok(indexIssues.includes("page is missing a non-empty <title>"));
  assert.ok(indexIssues.includes("page is missing a non-empty meta description"));
  assert.ok(indexIssues.includes(
    "expected exactly one <h1> in <main>, found 2",
  ));

  const missingMissionContent = page(
    "/lab/javascript/discount-calculation-bug",
    [],
    "<main><h1>Fix the Discount Calculation Bug</h1><div>Client-rendered content only</div></main>",
  );
  const missionIssues = analyzeRenderedPage(
    missingMissionContent,
    "/lab/javascript/discount-calculation-bug",
  );
  assert.ok(missionIssues.includes(
    "Lab challenge is missing server-rendered mission scenario content",
  ));
  assert.ok(missionIssues.includes(
    "Lab challenge is missing server-rendered mission objective content",
  ));
});

test("discovers only valid challenge-depth links rendered by the Lab index", () => {
  const html = [
    '<a href="/lab/javascript/discount-calculation-bug">Published mission</a>',
    '<a href="/lab/javascript">Track index, not a mission</a>',
    '<a href="/lab/javascript/not_published">Invalid route</a>',
    '<a href="/lab/javascript/discount-calculation-bug?email=private">Query suffix</a>',
  ].join("");

  assert.deepEqual(extractLinkedRoutes(html, "/lab", 2), [
    "/lab/javascript/discount-calculation-bug",
  ]);
  assert.equal(
    extractLinkedRoutes(html, "/lab", 2).includes(
      "/lab/javascript/draft-mission",
    ),
    false,
  );
});

test("does not require Course schema on the courses listing page", () => {
  const html = page("/courses", [{ "@type": "BreadcrumbList", itemListElement: [] }]);
  assert.deepEqual(analyzeRenderedPage(html, "/courses"), []);
});

test("does not require Course schema when delivery availability is unconfirmed", () => {
  const html = page(
    "/courses/data-science",
    [],
    "<main><h1>Data Science &amp; AI</h1><p>Delivery availability not confirmed</p></main>",
  );
  assert.deepEqual(analyzeRenderedPage(html, "/courses/data-science"), []);
});

test("still requires Course schema on unrelated routes with an availability notice", () => {
  const html = page(
    "/courses/python",
    [],
    "<main><h1>Python</h1><p>Delivery availability not confirmed</p></main>",
  );
  assert.ok(
    analyzeRenderedPage(html, "/courses/python").includes(
      "course detail is missing Course JSON-LD",
    ),
  );
});

test("requires Course schema when the availability notice is not visible", () => {
  const html = page(
    "/courses/data-science",
    [],
    '<main><h1>Data Science &amp; AI</h1><script>const notice = "Delivery availability not confirmed";</script></main>',
  );
  assert.ok(
    analyzeRenderedPage(html, "/courses/data-science").includes(
      "course detail is missing Course JSON-LD",
    ),
  );
});

test("validates Guides index metadata, canonical, heading, and accessible search", () => {
  const html = page(
    "/blog",
    [{ "@type": "BreadcrumbList", itemListElement: [] }],
    `<main>
      <h1>Guides for Coding Learners</h1>
      <label for="guide-search">Search Guides</label>
      <input id="guide-search" name="q">
    </main>`,
  );
  assert.deepEqual(analyzeRenderedPage(html, "/blog"), []);
});

test("rejects an unlabeled Guides search input", () => {
  const html = page(
    "/blog",
    [],
    '<main><h1>Guides for Coding Learners</h1><input name="q"></main>',
  );
  assert.ok(analyzeRenderedPage(html, "/blog").includes(
    "Guides search input must have an accessible label",
  ));
});

test("requires BlogPosting and breadcrumb schemas on guide detail routes", () => {
  const html = page("/blog/python-guide", [
    { "@type": "BlogPosting", headline: "Python Guide" },
    { "@type": "BreadcrumbList", itemListElement: [] },
  ]);
  assert.deepEqual(analyzeRenderedPage(html, "/blog/python-guide"), []);
  assert.ok(analyzeRenderedPage(page("/blog/python-guide"), "/blog/python-guide").includes(
    "guide detail is missing BlogPosting JSON-LD",
  ));
});

test("requires a breadcrumb on the locations index but no irrelevant FAQ schema", () => {
  const html = page("/locations", [{ "@type": "BreadcrumbList", itemListElement: [] }]);
  assert.deepEqual(analyzeRenderedPage(html, "/locations"), []);
});

test("requires FAQPage schema when a location page visibly has an FAQ heading", () => {
  const html = page(
    "/locations/noida",
    [{ "@type": "BreadcrumbList", itemListElement: [] }],
    "<main><h1>Noida</h1><h2>FAQs</h2><p>Visible answers</p></main>"
  );

  assert.ok(analyzeRenderedPage(html, "/locations/noida").includes(
    "visible location FAQ section is missing FAQPage JSON-LD"
  ));
});

test("rejects non-production or duplicate canonicals, missing headings, and missing Course schema", () => {
  const html = [
    `<link rel="canonical" href="https://localhost:3000/courses/java">`,
    `<link rel="canonical" href="${PRODUCTION_ORIGIN}/courses/java">`,
    "<main><h2>Java</h2></main>",
  ].join("");
  const issues = analyzeRenderedPage(html, "/courses/java");

  assert.ok(issues.some((issue) => issue.startsWith("expected exactly one canonical link")));
  assert.ok(issues.some((issue) => issue.includes("expected exactly one <h1>")));
  assert.ok(issues.includes("course detail is missing Course JSON-LD"));
});

test("reports malformed JSON-LD rather than silently ignoring it", () => {
  const html = page("/locations", []).concat(
    '<script type="application/ld+json">{"@type":</script>'
  );
  assert.ok(analyzeRenderedPage(html, "/locations").some((issue) =>
    issue.startsWith("invalid JSON-LD script:")
  ));
});

test("discovers and deduplicates all affected page routes", async () => {
  const routes = await getPageRoutes();

  for (const route of [
    "/courses",
    "/blog",
    "/online-courses",
    "/online-courses/full-stack",
    "/vs/coding-ninjas",
    "/vs/scaler",
    "/locations",
    "/locations/dehradun",
    "/locations/noida",
    "/locations/mumbai",
    "/locations/bangalore",
    "/lab",
  ]) {
    assert.ok(routes.includes(route), `expected route discovery to include ${route}`);
  }
  assert.equal(routes.filter((route) => route === "/locations").length, 1);
  assert.deepEqual(
    getPublishedGuideRoutes(),
    [
      "/blog/best-full-stack-course-dehradun-2025",
      "/blog/best-online-data-science-courses-india",
      "/blog/coding-classes-dehradun-complete-guide-2025",
      "/blog/coding-jobs-in-dehradun-2025",
      "/blog/data-science-course-dehradun-2025",
      "/blog/java-course-dehradun-2025",
      "/blog/learn-full-stack-online-roadmap-india-2025",
      "/blog/live-vs-recorded-coding-classes-india",
      "/blog/python-course-dehradun-fees-syllabus-jobs-2025",
      "/blog/visit-dca-campus-dehradun-guide",
    ],
  );
  assert.ok(!routes.includes("/blog/archive"));
  assert.ok(!routes.includes("/blog/sample-1"));
});
