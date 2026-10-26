import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { runInNewContext } from "node:vm";
import { fileURLToPath } from "node:url";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";

const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));
const nativeRequire = createRequire(import.meta.url);
const moduleCache = new Map();
const trackedEvents = [];

const Link = ({ href, children, ...props }) =>
  React.createElement("a", { href, ...props }, children);
const Card = ({ children, className }) =>
  React.createElement("div", { className }, children);

function loadTypeScript(relativePath, overrides = {}) {
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

  const localRequire = (specifier) => {
    if (Object.prototype.hasOwnProperty.call(overrides, specifier)) {
      return overrides[specifier];
    }
    if (specifier === "next/link") {
      return { __esModule: true, default: Link };
    }
    if (specifier === "@/components/ui/Button") {
      return { __esModule: true, default: buttonModule.default };
    }
    if (specifier === "@/components/ui/Card") {
      return { __esModule: true, default: Card };
    }
    if (specifier === "@/components/features/LearningProgressionNote") {
      return {
        __esModule: true,
        default: () => React.createElement("p", null, "Learning progression"),
      };
    }
    if (specifier === "@/lib/courses") return coursesModule;
    if (specifier === "@/lib/pricing") return pricingModule;
    if (specifier === "@/lib/schema") return schemaModule;
    if (specifier === "@/lib/seo") return seoModule;
    if (specifier === "@/lib/site-config") return siteConfigModule;
    if (specifier.startsWith(".")) {
      const dependencyPath = path.resolve(
        path.dirname(filename),
        `${specifier}.ts`,
      );
      return loadTypeScript(path.relative(repositoryRoot, dependencyPath), overrides);
    }
    return nativeRequire(specifier);
  };

  new Function("require", "module", "exports", compiled)(
    localRequire,
    loadedModule,
    loadedModule.exports,
  );
  return loadedModule.exports;
}

const coursesModule = loadTypeScript("src/lib/courses.ts");
const pricingModule = loadTypeScript("src/lib/pricing.ts");
const schemaModule = loadTypeScript("src/lib/schema.ts");
const seoModule = loadTypeScript("src/lib/seo.ts");
const siteConfigModule = loadTypeScript("src/lib/site-config.ts");
const buttonModule = loadTypeScript("src/components/ui/Button.tsx", {
  "@/lib/analytics": {
    track: (event, params) => trackedEvents.push({ event, params }),
  },
});
const courses = coursesModule.getCourses();
const detailRoutes = [
  ["full-stack", "src/app/online-courses/full-stack/page.tsx", "jsonld-course-online-fullstack"],
  ["data-science", "src/app/online-courses/data-science/page.tsx", "course-jsonld-data-science"],
  ["python", "src/app/online-courses/python/page.tsx", "ld-course-python"],
  ["java", "src/app/online-courses/java/page.tsx", "jsonld-course-java-online"],
];
const routeModules = new Map(
  detailRoutes.map(([slug, filename, schemaId]) => [
    slug,
    { module: loadTypeScript(filename), schemaId },
  ]),
);

function decodeHtml(value) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#x27;", "'");
}

function getVisibleText(markup) {
  return decodeHtml(
    markup
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<[^>]+>/g, " "),
  );
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#x27;");
}

function parseJsonLd(markup, id) {
  const script = markup.match(
    new RegExp(`<script id="${id}" type="application/ld\\+json">([\\s\\S]*?)</script>`),
  );
  assert.ok(script, `missing JSON-LD script ${id}`);
  return JSON.parse(script[1]);
}

function countOccurrences(value, part) {
  return value.split(part).length - 1;
}

function findElements(node, predicate, matches = []) {
  if (Array.isArray(node)) {
    node.forEach((child) => findElements(child, predicate, matches));
  } else if (React.isValidElement(node)) {
    if (predicate(node)) matches.push(node);
    findElements(node.props.children, predicate, matches);
  }
  return matches;
}

function getDelegatedClickHandler(pathname) {
  const layout = readFileSync(
    path.resolve(repositoryRoot, "src/app/layout.tsx"),
    "utf8",
  );
  const script = layout.match(
    /<Script id="ga4-delegated-clicks"[^>]*>\s*\{\s*`([\s\S]*?)`\s*\}\s*<\/Script>/,
  );
  assert.ok(script, "missing delegated click handler script");

  const delegatedEvents = [];
  const listeners = new Map();
  const window = {
    gtag: (...args) => delegatedEvents.push(args),
  };
  const document = {
    addEventListener: (name, handler) => listeners.set(name, handler),
    removeEventListener: (name) => listeners.delete(name),
  };
  const scriptBody = script[1].replace(
    "${JSON.stringify(PUBLISHED_LAB_PATHS)}",
    "[]",
  );
  runInNewContext(scriptBody, {
    document,
    location: { pathname },
    window,
  });
  const handler = listeners.get("click");
  assert.equal(typeof handler, "function");
  return { delegatedEvents, handler };
}

function makeClickableAnchor(attributes, textContent = "Talk to a Mentor") {
  const anchor = {
    getAttribute: (name) => attributes[name] ?? null,
    textContent,
  };
  anchor.closest = () => anchor;
  return anchor;
}

test("online course index lists the canonical courses and keeps its links", () => {
  const page = loadTypeScript("src/app/online-courses/page.tsx");
  const markup = renderToStaticMarkup(page.default());
  const decoded = decodeHtml(markup);

  assert.equal(
    courses.length,
    4,
    "expected the canonical registry to contain four courses",
  );
  for (const course of courses) {
    assert.ok(decoded.includes(course.title));
    assert.ok(markup.includes(`href="/online-courses/${course.slug}"`));
  }
  assert.equal(
    page.metadata.alternates.canonical,
    `${siteConfigModule.SITE.url}/online-courses`,
  );
  assert.ok(markup.includes('href="/faq"'));
  assert.ok(markup.includes('href="/contact"'));
  assert.ok(markup.includes("breadcrumbs-online-courses"));
});

test("online detail routes render canonical facts, metadata, schema, and crosslinks", () => {
  for (const [slug, , schemaId] of detailRoutes) {
    const course = coursesModule.getCourseBySlug(slug);
    const { module: page } = routeModules.get(slug);
    const markup = renderToStaticMarkup(page.default());
    const decoded = decodeHtml(markup);
    const schema = parseJsonLd(markup, schemaId);
    const canonical = `${siteConfigModule.SITE.url}/online-courses/${slug}`;

    const h1 = decoded.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    assert.ok(h1, `${slug} should render a visible H1`);
    assert.match(
      h1[1].replace(/<[^>]+>/g, " "),
      /online/i,
      `${slug} should identify its online offering in the visible H1`,
    );
    assert.ok(decoded.includes(course.level));
    assert.ok(decoded.includes(pricingModule.formatCourseDuration(course.duration)));
    assert.ok(decoded.includes(pricingModule.formatCoursePrice(course.pricing)));
    assert.equal(page.metadata.alternates.canonical, canonical);
    assert.equal(schema["@type"], "Course");
    assert.equal(schema.name, course.title);
    assert.equal(schema.courseCode, course.slug);
    assert.equal(schema.url, canonical);
    assert.equal(schema.offers.price, course.pricing.packageRate);
    assert.equal(schema.timeRequired, `P${course.duration.value}M`);
    assert.equal(schema.hasCourseInstance[0].courseMode, "Online");
    assert.equal(
      parseJsonLd(markup, `breadcrumbs-online-courses-${slug}`)["@type"],
      "BreadcrumbList",
    );
    assert.ok(markup.includes(`href="/courses/${slug}"`));
    assert.ok(markup.includes('href="/contact"'));
  }
});

test("online detail pages render registry-backed sections without repeated or unsupported claims", () => {
  for (const [slug, , schemaId] of detailRoutes) {
    const course = coursesModule.getCourseBySlug(slug);
    const { module: page } = routeModules.get(slug);
    const markup = renderToStaticMarkup(page.default());
    const decoded = decodeHtml(markup);
    const visibleText = getVisibleText(markup);

    if (slug === "full-stack" || slug === "java") {
      for (const fact of [...course.curriculum, ...course.outcomes]) {
        assert.equal(
          countOccurrences(
            markup,
            `<li>${slug === "java" ? "• " : ""}${escapeHtml(fact)}</li>`,
          ),
          1,
          `${slug} should display ${fact} once`,
        );
      }
    }
    if (slug === "python") {
      for (const fact of [
        ...course.curriculum,
        ...course.prerequisites,
        ...course.outcomes,
      ]) {
        assert.equal(
          countOccurrences(markup, `<li>${escapeHtml(fact)}</li>`),
          1,
          `Python should display ${fact} once`,
        );
      }
      assert.match(decoded, /Confirmed delivery modes:.*Online/);
    }
    if (slug === "java") {
      for (const fact of course.prerequisites) {
        assert.equal(
          countOccurrences(markup, `<li>• ${escapeHtml(fact)}</li>`),
          1,
        );
      }
    }
    if (slug === "data-science") {
      assert.match(page.metadata.title, /online/i);
      assert.match(decoded, /<h1[^>]*>Online Data Science & AI Course in India<br\/>/);
      assert.doesNotMatch(decoded, /Who it.s for|career switchers|structured project work/i);
      for (const fact of course.outcomes) {
        assert.equal(
          countOccurrences(markup, `<li>${escapeHtml(fact)}</li>`),
          1,
        );
      }
    }
    assert.ok(parseJsonLd(markup, schemaId));
    assert.doesNotMatch(
      visibleText,
      /live sessions?|recordings|remote mentorship|mentor support|online community|accountability|project reviews?|project feedback|cohort structure|placement support|employment guarantee|students placed|career switchers/i,
    );
  }
});

test("explicit contact events take precedence over delegated tracking without losing parameters", () => {
  const { module: fullStackPage } = routeModules.get("full-stack");
  const pageTree = fullStackPage.default();
  const contactButtons = findElements(
    pageTree,
    (element) =>
      element.type === buttonModule.default && element.props.href === "/contact",
  );
  assert.equal(contactButtons.length, 2);

  for (const button of contactButtons) {
    trackedEvents.length = 0;
    const anchorElement = buttonModule.default(button.props);
    const params = button.props.eventParams;
    const { delegatedEvents, handler } = getDelegatedClickHandler(
      "/online-courses/full-stack",
    );
    const anchor = makeClickableAnchor({
      "data-event": anchorElement.props["data-event"],
      "data-event-params": anchorElement.props["data-event-params"],
      href: anchorElement.props.href,
    });

    handler({ target: anchor });
    anchorElement.props.onClick({});

    assert.equal(anchorElement.props["data-event"], "cta_enroll_click");
    assert.deepEqual(JSON.parse(anchorElement.props["data-event-params"]), params);
    assert.equal(delegatedEvents.length, 0);
    assert.deepEqual(trackedEvents, [{ event: "cta_enroll_click", params }]);
  }
});

test("unmarked contact links retain delegated online-route event parameters", () => {
  trackedEvents.length = 0;
  const { delegatedEvents, handler } =
    getDelegatedClickHandler("/online-courses/python");
  handler({
    target: makeClickableAnchor({ href: "/contact" }),
  });

  assert.deepEqual(trackedEvents, []);
  assert.equal(delegatedEvents.length, 1);
  assert.equal(delegatedEvents[0][0], "event");
  assert.equal(delegatedEvents[0][1], "cta_enroll_click");
  assert.equal(delegatedEvents[0][2].page_type, "online_course");
  assert.equal(delegatedEvents[0][2].course_slug, "python");
  assert.equal(delegatedEvents[0][2].city, undefined);
});
