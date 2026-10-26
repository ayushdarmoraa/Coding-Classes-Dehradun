import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";

const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));
const nativeRequire = createRequire(import.meta.url);
const moduleCache = new Map();
const coursesModule = loadTypeScript("src/lib/courses.ts");
const pricingModule = loadTypeScript("src/lib/pricing.ts");
const schemaModule = loadTypeScript("src/lib/schema.ts");
const challengesModule = loadTypeScript("src/lib/lab/challenges.ts");
const challengeUtilsModule = loadTypeScript(
  "src/lib/lab/challenge-utils.ts",
);
const siteConfigModule = loadTypeScript("src/lib/site-config.ts");
const notFoundError = new Error("NEXT_NOT_FOUND");

const blogPosts = [
  {
    slug: "best-full-stack-course-dehradun-2025",
    title: "Full-Stack Course Guide",
    description: "Full-Stack course details.",
    keywords: ["full stack"],
    category: "Full-Stack",
  },
  {
    slug: "data-science-course-dehradun-2025",
    title: "Data Science Course Guide",
    description: "Data Science course details.",
    keywords: ["data science"],
    category: "Data Science",
  },
  {
    slug: "python-course-dehradun-fees-syllabus-jobs-2025",
    title: "Python Course Guide",
    description: "Python course details.",
    keywords: ["python"],
    category: "Python",
  },
  {
    slug: "java-course-dehradun-2025",
    title: "Java Course Guide",
    description: "Java course details.",
    keywords: ["java"],
    category: "Java",
  },
];

const Link = ({ href, children, ...props }) =>
  React.createElement("a", { href, ...props }, children);

const Button = ({ href, children, event, eventParams, ...props }) =>
  React.createElement(
    "a",
    {
      href,
      ...props,
      ...(event ? { "data-event": event } : {}),
      ...(eventParams
        ? { "data-event-params": JSON.stringify(eventParams) }
        : {}),
    },
    children,
  );

const TrackedLink = ({ href, children, event, eventParams, ...props }) =>
  React.createElement(
    "a",
    {
      href,
      ...props,
      "data-event": event,
      "data-event-params": JSON.stringify(eventParams),
    },
    children,
  );

function loadTypeScript(relativePath) {
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
    if (specifier === "next/link") return { __esModule: true, default: Link };
    if (specifier === "next/navigation") {
      return { notFound: () => { throw notFoundError; } };
    }
    if (specifier === "@/components/analytics/TrackedLink") {
      return { __esModule: true, default: TrackedLink };
    }
    if (specifier === "@/components/Breadcrumbs") {
      return {
        __esModule: true,
        default: ({ items }) =>
          React.createElement(
            "nav",
            { "aria-label": "Breadcrumb" },
            items.map((item) =>
              React.createElement(
                Link,
                { href: item.href, key: item.href },
                item.label,
              ),
            ),
          ),
      };
    }
    if (specifier === "@/components/ui/Badge") {
      return {
        __esModule: true,
        default: ({ children }) => React.createElement("span", null, children),
      };
    }
    if (specifier === "@/components/ui/Button") {
      return { __esModule: true, default: Button };
    }
    if (specifier === "@/components/features/LearningProgressionNote") {
      return {
        __esModule: true,
        default: () => React.createElement("p", null, "Learning progression"),
      };
    }
    if (specifier === "@/lib/courses") return coursesModule;
    if (specifier === "@/lib/blog") {
      return { getAllBlogPosts: () => blogPosts };
    }
    if (specifier === "@/lib/schema") return schemaModule;
    if (specifier === "@/lib/pricing") return pricingModule;
    if (specifier === "@/lib/site-config") return siteConfigModule;
    if (specifier === "@/lib/lab/challenges") return challengesModule;
    if (specifier === "@/lib/lab/challenge-utils") return challengeUtilsModule;
    if (specifier.startsWith(".")) {
      const dependencyPath = path.resolve(
        path.dirname(filename),
        `${specifier}.ts`,
      );
      return loadTypeScript(path.relative(repositoryRoot, dependencyPath));
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

const routeModule = loadTypeScript("src/app/courses/[slug]/page.tsx");
const courses = coursesModule.getCourses();
const courseBySlug = new Map(courses.map((course) => [course.slug, course]));

async function renderCourse(slug) {
  const element = await routeModule.default({ params: { slug } });
  return renderToStaticMarkup(element);
}

function readJsonLd(markup, id) {
  const script = markup.match(
    new RegExp(
      `<script id="${id}" type="application/ld\\+json">([\\s\\S]*?)</script>`,
    ),
  );
  assert.ok(script, `expected ${id} JSON-LD script`);
  return JSON.parse(script[1]);
}

function decodeHtml(value) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#x27;", "'");
}

function readVisibleFaqs(markup) {
  const section = markup.match(
    /<section id="faqs"[^>]*>([\s\S]*?)<\/section>/,
  );
  assert.ok(section, "expected visible course FAQ section");
  return [...section[1].matchAll(/<dt[^>]*>([\s\S]*?)<\/dt><dd[^>]*>([\s\S]*?)<\/dd>/g)]
    .map(([, question, answer]) => [
      decodeHtml(question.replace(/<[^>]+>/g, "")),
      decodeHtml(answer.replace(/<[^>]+>/g, "")),
    ]);
}

test("all canonical course detail routes render their registry facts and metadata", async () => {
  assert.deepEqual(
    courses.map(({ slug }) => slug),
    ["full-stack", "data-science", "python", "java"],
  );

  for (const course of courses) {
    const markup = await renderCourse(course.slug);
    const metadata = await routeModule.generateMetadata({
      params: { slug: course.slug },
    });
    const courseJsonLd = readJsonLd(markup, "course-structured-data");

    const decodedMarkup = decodeHtml(markup);
    assert.ok(decodedMarkup.includes(`<h1 class="text-3xl md:text-4xl font-extrabold mb-3">${course.title}</h1>`));
    assert.ok(decodedMarkup.includes(course.description));
    assert.ok(decodedMarkup.includes(course.prerequisites[0]));
    assert.ok(decodedMarkup.includes(course.curriculum[0]));
    assert.ok(decodedMarkup.includes(course.outcomes[0]));
    assert.equal(
      metadata.alternates.canonical,
      `${siteConfigModule.SITE.url}/courses/${course.slug}`,
    );
    assert.equal(courseJsonLd["@type"], "Course");
    assert.equal(courseJsonLd.name, course.title);
    assert.equal(courseJsonLd.courseCode, course.slug);
    assert.equal(courseJsonLd.offers.price, course.pricing.packageRate);
    assert.equal(courseJsonLd.timeRequired, `P${course.duration.value}M`);
  }
});

test("unknown course slugs retain not-found behavior", async () => {
  await assert.rejects(() => renderCourse("not-a-course"), notFoundError);
});

test("only the published challenge related to Full-Stack appears on a detail page", async () => {
  const published = challengesModule.getPublishedChallenges();
  const related = published.filter(
    ({ relatedCourseSlug }) => relatedCourseSlug === "full-stack",
  );
  assert.equal(related.length, 1);
  assert.equal(
    challengeUtilsModule.getChallengePath(related[0]),
    "/lab/javascript/discount-calculation-bug",
  );

  for (const course of courses) {
    const markup = await renderCourse(course.slug);
    if (course.slug === "full-stack") {
      assert.ok(
        markup.includes('href="/lab/javascript/discount-calculation-bug"'),
      );
      assert.ok(markup.includes("Fix the Discount Calculation Bug"));
      assert.ok(markup.includes("Try this challenge"));
    } else {
      assert.doesNotMatch(markup, /href="\/lab\//);
    }
  }
});

test("course breadcrumb and visible FAQs match their structured data", async () => {
  for (const course of courses) {
    const markup = await renderCourse(course.slug);
    const breadcrumb = readJsonLd(markup, "course-breadcrumb");
    const faqSchema = readJsonLd(markup, "course-faq-schema");
    const visibleFaqs = readVisibleFaqs(markup);
    const schemaFaqs = faqSchema.mainEntity.map((item) => [
      item.name,
      item.acceptedAnswer.text,
    ]);

    assert.equal(breadcrumb["@type"], "BreadcrumbList");
    assert.deepEqual(
      breadcrumb.itemListElement.map(({ item }) => item),
      [
        `${siteConfigModule.SITE.url}/`,
        `${siteConfigModule.SITE.url}/courses`,
        `${siteConfigModule.SITE.url}/courses/${course.slug}`,
      ],
    );
    assert.equal(faqSchema["@type"], "FAQPage");
    assert.deepEqual(visibleFaqs, schemaFaqs);
  }
});

test("course links, further reading, and existing CTA analytics remain intact", async () => {
  const featuredPosts = {
    "full-stack": "best-full-stack-course-dehradun-2025",
    "data-science": "data-science-course-dehradun-2025",
    python: "python-course-dehradun-fees-syllabus-jobs-2025",
    java: "java-course-dehradun-2025",
  };

  for (const [slug, postSlug] of Object.entries(featuredPosts)) {
    const course = courseBySlug.get(slug);
    const markup = await renderCourse(slug);
    assert.match(markup, new RegExp(`href="/blog/${postSlug}"`));
    assert.match(markup, /href="\/contact"[^>]*data-event="cta_enroll_click"/);
    const contactEventParams = markup.match(
      /href="\/contact"[^>]*data-event-params="([^"]+)"/,
    );
    assert.ok(contactEventParams);
    assert.deepEqual(JSON.parse(decodeHtml(contactEventParams[1])), {
      page_type: "offline_course",
      course_slug: slug,
      city: "dehradun",
      variant: "hero_consultation",
    });
    assert.match(markup, /href="https:\/\/wa\.me\/917037905464/);
    assert.match(markup, /data-event="lead_contact_click"/);
    assert.match(
      markup,
      new RegExp(`href="/online-courses/${slug}"`),
    );
    assert.match(markup, /inline_online_crosslink/);
    assert.equal(course.slug, slug);
  }
});

test("unapproved audiences, projects, learning practices, and employment claims are not added", async () => {
  for (const course of courses) {
    const markup = await renderCourse(course.slug);
    assert.doesNotMatch(
      markup,
      /Who this course is for|How learning works|Projects you(?:'|’)ll build|placement guarantee|guaranteed employment|students placed|mentor-led sessions|weekly mentor hours|project reviews|recordings available/i,
    );
    assert.doesNotMatch(markup, /id="projects"/);
  }
});
