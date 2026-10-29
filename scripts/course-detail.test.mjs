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
const courseCatalogModule = loadTypeScript("src/lib/course-catalog.ts");
const courseExperienceModule = loadTypeScript("src/lib/course-experience-content.ts");
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
    if (specifier === "@/components/features/CourseTabsNav") {
      return {
        __esModule: true,
        default: loadTypeScript("src/components/features/CourseTabsNav.tsx").default,
      };
    }
    if (specifier === "@/lib/courses") return coursesModule;
    if (specifier === "@/lib/course-catalog") return courseCatalogModule;
    if (specifier === "@/lib/course-experience-content") return courseExperienceModule;
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
    const hasConfirmedCampusMode = coursesModule.isCourseModeAvailable(
      course,
      "On-Campus",
    );
    const courseJsonLd = hasConfirmedCampusMode
      ? readJsonLd(markup, "course-structured-data")
      : undefined;

    const decodedMarkup = decodeHtml(markup);
    const courseHeading = decodedMarkup.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/);
    assert.ok(courseHeading, `Expected a course heading for ${course.slug}`);
    assert.equal(decodeHtml(courseHeading[1]), course.title);
    assert.ok(decodedMarkup.includes(course.description));
    assert.ok(decodedMarkup.includes(course.prerequisites[0]));
    assert.ok(decodedMarkup.includes(course.curriculum[0]));
    assert.ok(decodedMarkup.includes(course.outcomes[0]));
    assert.equal(
      metadata.alternates.canonical,
      `${siteConfigModule.SITE.url}/courses/${course.slug}`,
    );
    if (courseJsonLd) {
      assert.equal(courseJsonLd["@type"], "Course");
      assert.equal(courseJsonLd.name, course.title);
      assert.equal(courseJsonLd.courseCode, course.slug);
      assert.equal(courseJsonLd.offers.price, course.pricing.packageRate);
      assert.equal(courseJsonLd.timeRequired, `P${course.duration.value}M`);
    } else {
      assert.equal(markup.includes('id="course-structured-data"'), false);
    }
  }
});

test("course section navigation stays accessible and outside the hero for sticky behavior", async () => {
  const markup = await renderCourse("full-stack");
  const navStart = markup.indexOf('<nav aria-label="Course sections"');
  const heroEnd = markup.indexOf("</header>");

  assert.ok(navStart > heroEnd, "course section navigation follows the hero");

  const navEnd = markup.indexOf("</nav>", navStart);
  const navMarkup = markup.slice(navStart, navEnd);
  assert.match(navMarkup, /class="sticky top-16/);
  assert.match(navMarkup, /focus-visible:ring-2/);
  assert.match(navMarkup, /aria-current="location"/);
  assert.deepEqual(
    [...navMarkup.matchAll(/<a[^>]+href="#([^"]+)"/g)].map(([, id]) => id),
    [
      "overview",
      "who-for",
      "curriculum",
      "prereq",
      "projects",
      "learning-works",
      "outcomes",
      "faqs",
    ],
  );
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

test("course FAQs do not extend Data Science or Java facts beyond the canonical curriculum", async () => {
  const dataScienceMarkup = await renderCourse("data-science");
  const dataScienceFaq = readVisibleFaqs(dataScienceMarkup).find(
    ([question]) => question === "Which tools and topics are covered?",
  );
  assert.deepEqual(dataScienceFaq, [
    "Which tools and topics are covered?",
    `The listed curriculum covers ${courses.find(({ slug }) => slug === "data-science").curriculum.join("; ")}.`,
  ]);
  assert.doesNotMatch(dataScienceFaq[1], /Matplotlib|scikit-learn|real datasets/i);

  const javaMarkup = await renderCourse("java");
  const javaFaq = readVisibleFaqs(javaMarkup).find(
    ([question]) => question === "Does the curriculum include Spring Boot?",
  );
  assert.deepEqual(javaFaq, [
    "Does the curriculum include Spring Boot?",
    `The published curriculum lists ${courses.find(({ slug }) => slug === "java").curriculum.find((item) => /spring/i.test(item))}. Spring Boot is not specifically listed.`,
  ]);

  const fullStackContent = courseExperienceModule.getCourseExperienceContent(
    courses.find(({ slug }) => slug === "full-stack"),
  );
  assert.equal(
    fullStackContent.faqs[2].answer,
    `The listed curriculum covers ${courses.find(({ slug }) => slug === "full-stack").curriculum.join("; ")}.`,
  );

  const pythonContent = courseExperienceModule.getCourseExperienceContent(
    courses.find(({ slug }) => slug === "python"),
  );
  const python = courses.find(({ slug }) => slug === "python");
  assert.equal(
    pythonContent.faqs[2].answer,
    `The published prerequisite is ${python.prerequisites.join("; ")}. The curriculum starts with ${python.curriculum[0]} and continues through ${python.curriculum.slice(1).join("; ")}.`,
  );
});

test("course experience copy is tailored to published prerequisites and curriculum", () => {
  for (const course of courses) {
    const content = courseExperienceModule.getCourseExperienceContent(course);
    assert.ok(content.learnerFit.length > 50);
    assert.ok(content.practicalPractice.length > 50);
    assert.equal(content.learningApproach.length, 3);
    assert.equal(content.faqs.length, 4);
    assert.match(content.faqs[0].answer, /months/);
    assert.match(content.faqs[1].answer, /₹/);
    assert.match(content.faqs[3].answer, /upcoming batches, class arrangements, and available support/);
  }

  const javaContent = courseExperienceModule.getCourseExperienceContent(
    courses.find(({ slug }) => slug === "java"),
  );
  assert.match(javaContent.practicalPractice, /based on the published curriculum/);
  assert.doesNotMatch(javaContent.practicalPractice, /Spring Boot|specific project names/i);
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
    if (coursesModule.isCourseModeAvailable(course, "Online")) {
      assert.match(markup, new RegExp(`href="/online-courses/${slug}"`));
      assert.match(markup, /inline_online_crosslink/);
    } else {
      assert.doesNotMatch(markup, new RegExp(`href="/online-courses/${slug}"`));
    }
    assert.equal(course.slug, slug);
  }
});

test("course detail sections expose verified fit, project, delivery, Lab, and CTA information", async () => {
  for (const course of courses) {
    const markup = await renderCourse(course.slug);
    const decoded = decodeHtml(markup);
    assert.match(decoded, /id="who-for"[\s\S]*Who this course is for/);
    assert.match(decoded, /id="projects"[\s\S]*Projects and practical work/);
    assert.match(decoded, /id="learning-works"[\s\S]*How learning works/);
    assert.match(decoded, /id="related-lab"/);
    assert.match(decoded, /id="course-final-cta"/);
    assert.match(decoded, /href="\/contact"/);
    assert.match(decoded, /href="\/lab"/);
    if (course.slug !== "java") {
      assert.match(decoded, /Published course outcomes include:/);
    }
    assert.doesNotMatch(
      decoded,
      /placement guarantee|guaranteed employment|students placed|mentor-led sessions|weekly mentor hours|project reviews, learner support, and recordings are not specified/i,
    );
    if (course.slug === "java") {
      assert.match(decoded, /Practise Java syntax, object-oriented concepts, collections, exceptions, and input\/output/);
    }
  }
});
