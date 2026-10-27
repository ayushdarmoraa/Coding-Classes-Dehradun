import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";

const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));
const require = createRequire(path.join(repositoryRoot, "package.json"));
const moduleCache = new Map();
const trackedActions = [];
const Link = ({ href, children, ...props }) =>
  React.createElement("a", { href, ...props }, children);
const TrackedLink = ({ href, event, eventParams, children, ...props }) => {
  trackedActions.push({ href, event, eventParams });
  return React.createElement("a", { href, ...props }, children);
};
const Button = ({
  href,
  event,
  eventParams,
  children,
  variant,
  size,
  ...props
}) => {
  if (event) trackedActions.push({ href, event, eventParams });
  return React.createElement(href ? "a" : "button", { href, ...props }, children);
};

function resolveLocalModule(specifier, parentPath) {
  const basePath = specifier.startsWith("@/")
    ? path.resolve(repositoryRoot, "src", specifier.slice(2))
    : path.resolve(path.dirname(parentPath), specifier);
  const candidates = [
    basePath,
    `${basePath}.ts`,
    `${basePath}.tsx`,
    `${basePath}.js`,
    path.join(basePath, "index.ts"),
    path.join(basePath, "index.tsx"),
  ];
  return candidates.find((candidate) => existsSync(candidate));
}

function loadLocalModule(modulePath) {
  const absolutePath = path.resolve(modulePath);
  if (moduleCache.has(absolutePath)) return moduleCache.get(absolutePath).exports;

  const source = readFileSync(absolutePath, "utf8");
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      esModuleInterop: true,
      jsx: ts.JsxEmit.ReactJSX,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  }).outputText;
  const module = { exports: {} };
  moduleCache.set(absolutePath, module);

  const localRequire = (specifier) => {
    if (specifier === "next/link") return { __esModule: true, default: Link };
    if (specifier === "@/components/analytics/TrackedLink") {
      return { __esModule: true, default: TrackedLink };
    }
    if (specifier === "@/components/ui/Button") {
      return { __esModule: true, default: Button };
    }
    if (specifier === "remark") {
      return {
        remark: () => ({
          use() {
            return this;
          },
          process: async () => "",
        }),
      };
    }
    if (specifier === "remark-html") return {};
    const localPath = resolveLocalModule(specifier, absolutePath);
    return localPath ? loadLocalModule(localPath) : require(specifier);
  };

  try {
    new Function("require", "module", "exports", compiled)(
      localRequire,
      module,
      module.exports,
    );
  } catch (error) {
    throw new Error(`Failed to load ${absolutePath}`, { cause: error });
  }
  return module.exports;
}

const { default: HomePage, metadata } = loadLocalModule(
  path.join(repositoryRoot, "src/app/page.tsx"),
);
const { getCourses } = loadLocalModule(
  path.join(repositoryRoot, "src/lib/courses.ts"),
);
const { getAllBlogPosts } = loadLocalModule(
  path.join(repositoryRoot, "src/lib/blog.ts"),
);
const courses = getCourses();
const guides = getAllBlogPosts().slice(0, 3);
const markup = renderToStaticMarkup(React.createElement(HomePage));
const internalHrefs = [
  ...markup.matchAll(/<a\b[^>]*\bhref="([^"]+)"/g),
]
  .map((match) => match[1])
  .filter((href) => href.startsWith("/") && !href.startsWith("//"));

function escapeHtml(value) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function routeExists(href) {
  if (href.startsWith("/lab/")) {
    const { getChallenge } = loadLocalModule(
      path.join(repositoryRoot, "src/lib/lab/challenges.ts"),
    );
    const [, , track, slug] = href.split("/");
    return (
      existsSync(
        path.join(repositoryRoot, "src/app/lab/[track]/[slug]/page.tsx"),
      ) && Boolean(getChallenge(track, slug))
    );
  }
  if (href.startsWith("/courses/")) {
    return existsSync(
      path.join(repositoryRoot, "src/app/courses/[slug]/page.tsx"),
    );
  }
  if (href.startsWith("/blog/")) {
    return (
      existsSync(path.join(repositoryRoot, "src/app/blog/[slug]/page.tsx")) &&
      getAllBlogPosts().some((post) => `/blog/${post.slug}` === href)
    );
  }

  return existsSync(
    path.join(repositoryRoot, "src/app", href.slice(1), "page.tsx"),
  );
}

test("homepage presents one clear value proposition and valid primary actions", () => {
  assert.match(markup, /<h1[^>]*>Learn Coding\. Fix Real Problems\. Build Real Skills\.<\/h1>/);
  assert.match(markup, />Learn\. Debug\. Build\. Prove\.</);
  assert.match(markup, /href="\/lab\/javascript\/discount-calculation-bug"[^>]*>Try a Free Coding Challenge/);
  assert.match(markup, /href="\/courses"[^>]*>Explore Courses/);
  assert.match(markup, /href="\/contact"[^>]*>Contact the Academy/);
});

test("homepage course previews render every canonical course and route", () => {
  assert.equal(courses.length, 4);
  assert.match(
    markup,
    /Advanced coverage is subject to curriculum and instructor validation/,
  );
  assert.match(markup, /Delivery availability not confirmed/);
  for (const course of courses) {
    assert.ok(
      markup.includes(escapeHtml(course.title)),
      `Missing course: ${course.title}`,
    );
    assert.ok(
      markup.includes(`href="/courses/${course.slug}"`),
      `Missing course route: ${course.slug}`,
    );
  }
});

test("homepage lab preview uses the available mission and links to working Lab routes", () => {
  const mission = loadLocalModule(
    path.join(repositoryRoot, "src/lib/lab/mission.ts"),
  );
  const { getChallenge } = loadLocalModule(
    path.join(repositoryRoot, "src/lib/lab/challenges.ts"),
  );
  assert.match(markup, /Fix the Discount Calculation Bug/);
  assert.match(markup, /₹800/);
  assert.match(markup, /₹720/);
  assert.ok(internalHrefs.includes("/lab"));
  assert.ok(
    internalHrefs.includes("/lab/javascript/discount-calculation-bug"),
  );
  assert.equal(
    existsSync(path.join(repositoryRoot, "src/app/lab/[track]/[slug]/page.tsx")),
    true,
  );
  assert.equal(
    getChallenge("javascript", "discount-calculation-bug")?.id,
    "discount-calculation-bug",
  );
  assert.equal(mission.MISSION_TESTS[0].expected, 720);
});

test("homepage guides come from the published guide listing", () => {
  assert.ok(guides.length > 0);
  for (const guide of guides) {
    assert.ok(
      markup.includes(escapeHtml(guide.title)),
      `Missing published guide: ${guide.slug}`,
    );
    assert.ok(internalHrefs.includes(`/blog/${guide.slug}`));
  }
});

test("homepage internal destinations resolve and metadata retains canonical SEO", () => {
  assert.ok(internalHrefs.length > 0);
  for (const href of new Set(internalHrefs)) {
    assert.ok(routeExists(href), `Missing homepage destination: ${href}`);
  }
  assert.equal(metadata.alternates.canonical.endsWith("/"), true);
  assert.equal(metadata.openGraph.url, metadata.alternates.canonical);
  assert.equal((markup.match(/<h1\b/g) ?? []).length, 1);
  assert.equal((markup.match(/id="home-faq-heading"/g) ?? []).length, 1);
});

test("homepage FAQ structured data matches the visible questions and unconfirmed modes", () => {
  const schemaMarkup = markup.match(
    /<script id="home-faq-schema" type="application\/ld\+json">([\s\S]*?)<\/script>/,
  );
  assert.ok(schemaMarkup, "Missing server-rendered homepage FAQ JSON-LD");

  const schema = JSON.parse(schemaMarkup[1]);
  assert.equal(schema["@type"], "FAQPage");
  assert.deepEqual(
    schema.mainEntity.map((question) => question.name),
    [
      "What delivery options are available?",
      "Are classes live or recorded?",
      "Where is your Dehradun campus?",
      "What are the fees for each course?",
      "How long are the programs?",
    ],
  );
  assert.match(
    schema.mainEntity[0].acceptedAnswer.text,
    /Data Science & AI: Delivery availability not confirmed/,
  );
});

test("homepage avoids unsupported placement and fabricated testimonial claims", () => {
  assert.doesNotMatch(
    markup,
    /placement guarantee|guaranteed placement|students placed|salary guarantee|verified student testimonial/i,
  );
  assert.doesNotMatch(markup, /<h[1-6][^>]*>\s*Testimonials\s*<\/h[1-6]>/i);
});

test("homepage discovery and course actions include attributable analytics events", () => {
  const events = new Set(trackedActions.map((action) => action.event));
  for (const event of [
    "cta_home_try_challenge",
    "cta_home_explore_courses",
    "cta_home_view_all_courses",
    "cta_home_intent",
    "cta_home_audience_path",
    "cta_home_lab_start",
    "cta_home_lab_explore",
    "cta_home_view_guides",
    "cta_home_read_guide",
    "cta_home_course_details",
  ]) {
    assert.ok(events.has(event), `Missing homepage analytics event: ${event}`);
  }

  const courseDetails = trackedActions.filter(
    (action) => action.event === "cta_home_course_details",
  );
  assert.equal(courseDetails.length, courses.length);
  for (const course of courses) {
    assert.ok(
      courseDetails.some(
        (action) =>
          action.href === `/courses/${course.slug}` &&
          action.eventParams.location === "home_course_preview" &&
          action.eventParams.course_slug === course.slug,
      ),
      `Missing analytics context for course ${course.slug}`,
    );
  }
});
