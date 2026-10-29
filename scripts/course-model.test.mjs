import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";

const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));
const nativeRequire = createRequire(import.meta.url);
const moduleCache = new Map();

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
    if (specifier.startsWith(".")) {
      const dependencyPath = path.resolve(path.dirname(filename), `${specifier}.ts`);
      return loadTypeScript(path.relative(repositoryRoot, dependencyPath), overrides);
    }
    if (specifier === "@/lib/courses") return coursesModule;
    if (specifier === "@/lib/course-catalog") {
      return loadTypeScript("src/lib/course-catalog.ts");
    }
    if (specifier === "@/lib/course-experience-content") {
      return loadTypeScript("src/lib/course-experience-content.ts");
    }
    if (specifier === "@/lib/site-config") {
      return loadTypeScript("src/lib/site-config.ts");
    }
    if (specifier === "@/lib/blog") {
      return {
        getAllBlogPosts: async () => [],
        getPostLastModified: async () => undefined,
      };
    }
    if (specifier === "@/lib/lab/challenges") {
      return loadTypeScript("src/lib/lab/challenges.ts");
    }
    if (specifier === "@/lib/lab/challenge-utils") {
      return loadTypeScript("src/lib/lab/challenge-utils.ts");
    }
    if (specifier === "@/lib/projects") {
      return {
        getPublishedProjects: () => [],
        getProjectPath: ({ slug }) => `/projects/${slug}`,
      };
    }
    if (specifier === "@/lib/outcomes") {
      return { hasPublishedOutcomeContent: () => false };
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
const sitemapModule = loadTypeScript("src/app/sitemap.ts");
const {
  courseSchema,
  courseLevelSchema,
  COURSE_LEVELS,
  LEARNING_STAGES,
  getCourses,
  getCourseBySlug,
  isCourseModeAvailable,
  validateCourses,
} = coursesModule;
const { formatCourseDuration, formatCoursePrice, formatCourseModes } = pricingModule;
const { generateCourseSchema, getCourseJsonLd } = schemaModule;
const { filterAndSortCourses } = loadTypeScript("src/lib/course-catalog.ts");

function cloneCourse(course) {
  return structuredClone(course);
}

test("course hub groups the canonical courses and applies duration and fee sorting", () => {
  const {
    filterAndSortCourses,
    getCourseLearningPath,
    getCourseProjectDetails,
  } = loadTypeScript(
    "src/lib/course-catalog.ts",
  );
  const courses = getCourses();

  assert.deepEqual(
    courses.map((course) => [course.slug, getCourseLearningPath(course)]),
    [
      ["full-stack", "developer"],
      ["data-science", "data-ai"],
      ["python", "beginner"],
      ["java", "beginner"],
    ],
  );
  assert.deepEqual(
    filterAndSortCourses(courses, "data-ai", "recommended").map(({ slug }) => slug),
    ["data-science"],
  );
  assert.deepEqual(
    filterAndSortCourses(courses, "all", "duration").map(({ slug }) => slug),
    ["python", "java", "full-stack", "data-science"],
  );
  assert.deepEqual(
    filterAndSortCourses(courses, "all", "fees").map(({ slug }) => slug),
    ["python", "java", "full-stack", "data-science"],
  );
  assert.deepEqual(
    filterAndSortCourses(courses, "beginner", "duration").map(({ slug }) => slug),
    ["python", "java"],
  );
  assert.deepEqual(
    courses.map(({ slug, ...course }) => [slug, getCourseProjectDetails(course)]),
    [
      ["full-stack", ["Project, Git/GitHub, deployment (Vercel)", "Deploy production projects", "Portfolio with 2–3 projects"]],
      ["data-science", ["Mini capstone project"]],
      ["python", ["Files, JSON, simple CLI projects", "Build small utilities"]],
      ["java", []],
    ],
  );
});

test("course cards show canonical facts, course and contact links, and only supplied Lab links", () => {
  const MockCard = ({ children, className }) =>
    React.createElement("article", { className }, children);
  const MockButton = ({ children, event, eventParams, ...props }) =>
    React.createElement(
      "a",
      {
        ...props,
        ...(event
          ? {
              "data-event": event,
              "data-event-params": JSON.stringify(eventParams || {}),
            }
          : {}),
      },
      children,
    );
  const CourseCard = loadTypeScript("src/components/features/CourseCard.tsx", {
    "@/components/ui/Card": MockCard,
    "@/components/ui/Button": MockButton,
    "@/lib/pricing": pricingModule,
  }).default;
  const fullStack = getCourseBySlug("full-stack");
  const python = getCourseBySlug("python");
  const relatedChallengeHref = "/lab/javascript/discount-calculation-bug";

  const fullStackMarkup = renderToStaticMarkup(
    React.createElement(CourseCard, {
      course: fullStack,
      relatedChallengeHref,
      showProjectSummary: true,
    }),
  );
  assert.match(fullStackMarkup, new RegExp(fullStack.description));
  assert.match(fullStackMarkup, /6 months/);
  assert.match(fullStackMarkup, /Beginner to Advanced/);
  assert.match(fullStackMarkup, /Explore the listed curriculum to see what the course covers/);
  assert.match(fullStackMarkup, /₹25,000 package rate/);
  assert.match(fullStackMarkup, /href="\/courses\/full-stack"/);
  assert.match(fullStackMarkup, /View Course/);
  assert.match(fullStackMarkup, /href="\/lab\/javascript\/discount-calculation-bug"/);
  assert.match(fullStackMarkup, /Try Related Challenge/);
  assert.match(fullStackMarkup, /Practical work/);
  assert.match(fullStackMarkup, /Portfolio with 2–3 projects/);
  assert.match(fullStackMarkup, /wa\.me\/917037905464/);

  const pythonMarkup = renderToStaticMarkup(
    React.createElement(CourseCard, { course: python }),
  );
  assert.match(pythonMarkup, /href="\/courses\/python"/);
  assert.doesNotMatch(pythonMarkup, /Try Related Challenge|href="\/lab\//);
  assert.match(pythonMarkup, /href="https:\/\/wa\.me\/917037905464/);
  assert.doesNotMatch(pythonMarkup, /Practical work/);
});

test("course catalog renders each offering once and ties comparison to the same sorted list", () => {
  const MockCourseCard = ({ course, relatedChallengeHref }) =>
    React.createElement(
      "article",
      { "data-course": course.slug },
      React.createElement("a", { href: `/courses/${course.slug}` }, "View Course"),
      relatedChallengeHref &&
        React.createElement(
          "a",
          { href: relatedChallengeHref },
          "Try Related Challenge",
        ),
    );
  const CourseCatalog = loadTypeScript(
    "src/components/features/CourseCatalog.tsx",
    {
      "@/components/features/CourseCard": MockCourseCard,
      "@/lib/course-catalog": loadTypeScript("src/lib/course-catalog.ts"),
      "@/lib/pricing": pricingModule,
    },
  ).default;
  const markup = renderToStaticMarkup(
    React.createElement(CourseCatalog, {
      courses: getCourses(),
      relatedChallengeHrefs: {
        "full-stack": "/lab/javascript/discount-calculation-bug",
      },
    }),
  );

  assert.equal((markup.match(/data-course=/g) ?? []).length, 4);
  for (const course of getCourses()) {
    assert.equal(
      (markup.match(new RegExp(`href="/courses/${course.slug}"`, "g")) ?? [])
        .length,
      1,
    );
    assert.ok(markup.includes(course.outcomes[0].replaceAll("&", "&amp;")));
  }
  assert.equal(
    (markup.match(/href="\/lab\/javascript\/discount-calculation-bug"/g) ?? [])
      .length,
    1,
  );
  assert.match(markup, /Shortest duration/);
  assert.match(markup, /Lowest fees/);
  assert.match(markup, /Data &amp; AI/);
});

test("course hub controls and server page preserve comparison, routes, FAQs, and contact paths", async () => {
  const [catalog, page] = await Promise.all([
    readFile(
      path.resolve(repositoryRoot, "src/components/features/CourseCatalog.tsx"),
      "utf8",
    ),
    readFile(path.resolve(repositoryRoot, "src/app/courses/page.tsx"), "utf8"),
  ]);
  assert.match(catalog, /onClick=\{\(\) => setSortOrder\("duration"\)\}/);
  assert.match(catalog, /onClick=\{\(\) => setSortOrder\("fees"\)\}/);
  assert.match(catalog, /onClick=\{\(\) => setPath\(coursePath\.id\)\}/);
  assert.match(catalog, /filterAndSortCourses\(courses, path, sortOrder\)/);
  assert.match(catalog, /visibleCourses\.map\(\(course\) =>/);
  assert.match(catalog, /formatCourseDuration\(course\.duration\)/);
  assert.match(catalog, /formatCoursePrice\(course\.pricing\)/);
  assert.match(catalog, /formatCourseModes\(course\)/);
  assert.match(page, /canonical: `\$\{SITE\.url\}\/courses`/);
  assert.match(page, /getPublishedChallenges\(\)/);
  assert.match(page, /getChallengePath\(challenge\)/);
  assert.match(page, /href="\/lab"/);
  assert.match(page, /id="faqs"/);
  assert.match(page, /href="\/contact"/);
  assert.match(page, /https:\/\/wa\.me\/917037905464/);
});

test("validates non-negative structured prices", () => {
  const course = cloneCourse(getCourseBySlug("python"));
  course.pricing.packageRate = -1;
  assert.throws(() => courseSchema.parse(course));

  course.pricing.packageRate = 12000;
  course.pricing.monthlyRate = -1;
  assert.throws(() => courseSchema.parse(course));
});

test("rejects zero or invalid course durations", () => {
  const course = cloneCourse(getCourseBySlug("python"));
  course.duration.value = 0;
  assert.throws(() => courseSchema.parse(course));

  course.duration.value = 4.5;
  assert.throws(() => courseSchema.parse(course));
});

test("validates canonical levels while keeping learner progression independent of duration", () => {
  assert.deepEqual(LEARNING_STAGES, [
    "Beginner",
    "Advanced Beginner",
    "Beginner to Intermediate",
  ]);
  for (const level of COURSE_LEVELS) {
    assert.equal(courseLevelSchema.parse(level), level);
  }
  assert.throws(() => courseLevelSchema.parse("Advanced"));
  const courses = getCourses();
  assert.deepEqual(
    courses.map(({ slug, level }) => [slug, level]),
    [
      ["full-stack", "Beginner to Advanced"],
      ["data-science", "Beginner to Advanced"],
      ["python", "Beginner to Advanced"],
      ["java", "Beginner to Advanced"],
    ],
  );
  for (const course of courses) {
    assert.equal(courseSchema.parse(course).level, course.level);
    assert.ok([4, 6].includes(course.duration.value));
  }

  const missingLevel = cloneCourse(getCourseBySlug("python"));
  delete missingLevel.level;
  assert.throws(() => courseSchema.parse(missingLevel));

  const emptyLevel = cloneCourse(getCourseBySlug("python"));
  emptyLevel.level = null;
  assert.throws(() => courseSchema.parse(emptyLevel));

  const unknownLevel = cloneCourse(getCourseBySlug("python"));
  unknownLevel.level = "Advanced";
  assert.throws(() => courseSchema.parse(unknownLevel));
});

test("rejects an empty delivery-mode assignment", () => {
  const course = cloneCourse(getCourseBySlug("python"));
  course.modes = [];
  assert.throws(() => courseSchema.parse(course));

  course.modes = ["In-Person"];
  const invalidMode = courseSchema.safeParse(course);
  assert.equal(invalidMode.success, false);
  if (invalidMode.success) assert.fail("unsupported delivery mode should be rejected");
  assert.deepEqual(
    invalidMode.error.issues.map(({ path }) => path),
    [["modes", 0]],
  );

  delete course.modes;
  assert.throws(() => courseSchema.parse(course));

  course.modes = ["Online"];
  delete course.modeStatus;
  assert.throws(() => courseSchema.parse(course));

  course.modeStatus = "unverified";
  assert.throws(() => courseSchema.parse(course));
});

test("rejects missing and duplicate course slugs", () => {
  const course = cloneCourse(getCourseBySlug("python"));
  delete course.slug;
  assert.throws(() => courseSchema.parse(course));

  const courses = getCourses();
  assert.throws(() => validateCourses([...courses, cloneCourse(courses[0])]));
});

test("rejects duplicate course IDs used as list keys", () => {
  const duplicateId = cloneCourse(getCourseBySlug("python"));
  duplicateId.id = getCourseBySlug("java").id;

  assert.throws(() => validateCourses([...getCourses(), duplicateId]), /Duplicate course id/);
});

test("rejects courses with an empty curriculum", () => {
  const course = cloneCourse(getCourseBySlug("python"));
  course.curriculum = [];
  assert.throws(() => courseSchema.parse(course));
});

test("retains canonical course titles, levels, pricing, durations, and mode status", () => {
  assert.deepEqual(
    getCourses().map(({ slug, title, level, pricing, duration, modes, modeStatus }) => ({
      slug,
      title,
      level,
      packageRate: pricing.packageRate,
      monthlyRate: pricing.monthlyRate,
      duration: duration.value,
      modes,
      modeStatus,
    })),
    [
      { slug: "full-stack", title: "Full-Stack Development (MERN + Gen AI)", level: "Beginner to Advanced", packageRate: 25000, monthlyRate: 5000, duration: 6, modes: ["On-Campus", "Online", "Hybrid"], modeStatus: "confirmed" },
      { slug: "data-science", title: "Data Science & AI", level: "Beginner to Advanced", packageRate: 30000, monthlyRate: 6000, duration: 6, modes: ["On-Campus", "Online", "Hybrid"], modeStatus: "temporary" },
      { slug: "python", title: "Python Programming", level: "Beginner to Advanced", packageRate: 12000, monthlyRate: 4000, duration: 4, modes: ["On-Campus", "Online", "Hybrid"], modeStatus: "confirmed" },
      { slug: "java", title: "Java Programming", level: "Beginner to Advanced", packageRate: 12000, monthlyRate: 4000, duration: 4, modes: ["On-Campus", "Online", "Hybrid"], modeStatus: "confirmed" },
    ],
  );
});

test("course path filtering returns no results for empty collections and unknown runtime values", () => {
  assert.deepEqual(filterAndSortCourses([], "all", "recommended"), []);
  assert.deepEqual(
    filterAndSortCourses(getCourses(), "invalid", "recommended"),
    [],
  );
});

test("formats canonical pricing and duration at presentation boundaries", () => {
  const fullStack = getCourseBySlug("full-stack");
  const python = getCourseBySlug("python");
  assert.equal(formatCoursePrice(fullStack.pricing), "₹25,000 package rate; ₹5,000/month option");
  assert.equal(formatCoursePrice(python.pricing), "₹12,000 package rate; ₹4,000/month option");
  assert.equal(formatCourseDuration(python.duration), "4 months");
  for (const course of getCourses()) {
    assert.equal(
      formatCourseModes(course),
      course.modeStatus === "confirmed"
        ? "On-Campus / Online / Hybrid"
        : "Delivery availability not confirmed",
    );
  }
});

test("published course guides align DCA pricing and duration with the canonical registry", async () => {
  const guides = {
    python: "src/content/blog/python-course-dehradun-fees-syllabus-jobs-2025.mdx",
    java: "src/content/blog/java-course-dehradun-2025.mdx",
    "full-stack": "src/content/blog/best-full-stack-course-dehradun-2025.mdx",
    "data-science": "src/content/blog/data-science-course-dehradun-2025.mdx",
  };

  for (const [slug, relativePath] of Object.entries(guides)) {
    const course = getCourseBySlug(slug);
    const guide = await readFile(path.resolve(repositoryRoot, relativePath), "utf8");
    const packageAmount = course.pricing.packageRate.toLocaleString("en-IN");
    const monthlyAmount = course.pricing.monthlyRate.toLocaleString("en-IN");

    assert.ok(
      guide.includes(`₹${packageAmount} package rate`),
      `${slug} guide should identify its package rate`,
    );
    assert.ok(
      guide.includes(`₹${monthlyAmount}/month rate option`),
      `${slug} guide should identify its monthly rate option`,
    );
    assert.doesNotMatch(guide, /EMI/i, `${slug} guide should not present the monthly rate as an EMI`);
  }

  const pythonGuide = await readFile(
    path.resolve(repositoryRoot, guides.python),
    "utf8",
  );
  assert.match(pythonGuide, /scheduled Python course is 4 months/i);
  assert.doesNotMatch(pythonGuide, /DCA.{0,80}(?:6 months|6 mo|₹30,000|₹6,000|₹6k)/i);
});

test("only owner-confirmed courses expose delivery modes", () => {
  const courses = getCourses();
  assert.equal(courses.length, 4);
  for (const course of courses.filter(({ slug }) => slug !== "data-science")) {
    for (const mode of ["On-Campus", "Online", "Hybrid"]) {
      assert.equal(isCourseModeAvailable(course, mode), true);
    }
    assert.equal(course.modeStatus, "confirmed");
  }
  const dataScience = getCourseBySlug("data-science");
  assert.equal(dataScience.modeStatus, "temporary");
  for (const mode of ["On-Campus", "Online", "Hybrid"]) {
    assert.equal(isCourseModeAvailable(dataScience, mode), false);
  }
  assert.equal(isCourseModeAvailable(getCourseBySlug("python"), "Online"), true);
  assert.deepEqual(
    getCourses()
      .filter((course) => isCourseModeAvailable(course, "Online"))
      .map((course) => course.slug),
    ["full-stack", "python", "java"],
  );
});

test("course schemas propagate canonical facts and preserve route variants", () => {
  const oldSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  process.env.NEXT_PUBLIC_SITE_URL = "https://dooncodingacademy.in";
  try {
    for (const course of getCourses()) {
      const standardSchema = generateCourseSchema(course);
      assert.equal(standardSchema.name, course.title);
      assert.equal(standardSchema.offers.price, course.pricing.packageRate);
      assert.equal(standardSchema.offers.priceCurrency, course.pricing.currency);
      assert.equal(standardSchema.duration, formatCourseDuration(course.duration));
      assert.equal("educationalLevel" in standardSchema, false);
      if (course.modeStatus === "confirmed") {
        assert.deepEqual(standardSchema.courseMode, course.modes);
      } else {
        assert.equal("courseMode" in standardSchema, false);
      }
      assert.equal(standardSchema.offers.description, `${formatCourseDuration(course.duration)} package rate`);
      assert.equal(standardSchema.offers.priceSpecification?.price, course.pricing.monthlyRate);

      const onCampusSchema = getCourseJsonLd(course, { variant: "offline" });
      const onlineSchema = getCourseJsonLd(course, {
        variant: "online",
        pathPrefix: "online-courses",
      });
      assert.equal(Boolean(onCampusSchema), isCourseModeAvailable(course, "On-Campus"));
      assert.equal(Boolean(onlineSchema), isCourseModeAvailable(course, "Online"));
      if (onCampusSchema) {
        assert.equal(onCampusSchema.name, course.title);
        assert.equal("educationalLevel" in onCampusSchema, false);
        assert.equal(onCampusSchema.offers.price, course.pricing.packageRate);
        assert.equal(onCampusSchema.offers.priceSpecification?.price, course.pricing.monthlyRate);
        assert.equal(onCampusSchema.timeRequired, `P${course.duration.value}M`);
        assert.equal(onCampusSchema.url, `https://dooncodingacademy.in/courses/${course.slug}`);
        assert.equal(onCampusSchema["@id"], `https://dooncodingacademy.in/courses/${course.slug}#course`);
        assert.equal(onCampusSchema.hasCourseInstance[0].courseMode, "Onsite");
      }
      if (onlineSchema) {
        assert.equal("educationalLevel" in onlineSchema, false);
        assert.equal(onlineSchema.url, `https://dooncodingacademy.in/online-courses/${course.slug}`);
        assert.equal(
          onlineSchema["@id"],
          `https://dooncodingacademy.in/online-courses/${course.slug}#course`,
        );
        assert.equal(onlineSchema.hasCourseInstance[0].courseMode, "Online");
        assert.equal(onlineSchema.offers.price, course.pricing.packageRate);
        assert.equal(onlineSchema.offers.priceSpecification?.price, course.pricing.monthlyRate);
      }
    }
  } finally {
    if (oldSiteUrl === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
    else process.env.NEXT_PUBLIC_SITE_URL = oldSiteUrl;
  }
});

test("sitemap includes each course route supported by the canonical modes", async () => {
  const entries = await sitemapModule.default();
  const urls = new Set(entries.map(({ url }) => url));

  for (const course of getCourses()) {
    assert.equal(
      urls.has(`https://dooncodingacademy.in/online-courses/${course.slug}`),
      isCourseModeAvailable(course, "Online"),
    );
    assert.equal(
      urls.has(`https://dooncodingacademy.in/courses/${course.slug}`),
      isCourseModeAvailable(course, "On-Campus"),
    );
  }
});

test("sitemap includes only published Lab routes from the challenge registry", async () => {
  const entries = await sitemapModule.default();
  const urls = new Set(entries.map(({ url }) => url));
  assert.ok(urls.has("https://dooncodingacademy.in/lab"));
  assert.ok(
    urls.has(
      "https://dooncodingacademy.in/lab/javascript/discount-calculation-bug",
    ),
  );
  assert.equal(
    [...urls].filter((url) => url.includes("/lab/")).length,
    1,
  );
});

test("course display consumers use structured canonical facts", async () => {
  const consumers = [
    ["src/app/page.tsx", /const courses = getCourses\(\)/],
    ["src/app/page.tsx", /courses\.map\(\(course, index\)/],
    ["src/app/page.tsx", /<CourseCard[\s\S]*?course=\{course\}/],
    ["src/app/page.tsx", /import \{ SITE \} from "@\/lib\/site-config"/],
    ["src/app/page.tsx", /canonical: `\$\{SITE\.url\}\/`/],
    ["src/components/features/CourseCard.tsx", /SITE\.whatsappUrl/],
    ["src/components/features/CourseCatalog.tsx", /formatCourseDuration\(course\.duration\)/],
    ["src/components/features/CourseCatalog.tsx", /course\.level/],
    ["src/components/features/CourseCatalog.tsx", /formatCoursePrice\(course\.pricing\)/],
    ["src/app/courses/page.tsx", /canonical: `\$\{SITE\.url\}\/courses`/],
    ["src/app/courses/[slug]/page.tsx", /const url = `\$\{SITE\.url\}\/courses\/\$\{course\.slug\}`/],
    ["src/app/courses/[slug]/page.tsx", /formatCoursePrice\(course\.pricing\)/],
    ["src/app/online-courses/page.tsx", /formatCoursePrice\(course\.pricing\)/],
    ["src/app/online-courses/page.tsx", /Level: \{course\.level\}/],
    ["src/app/online-courses/page.tsx", /canonical: `\$\{SITE\.url\}\/online-courses`/],
    ["src/app/online-courses/page.tsx", /isCourseModeAvailable\(course, "Online"\)/],
    ["src/app/online-courses/page.tsx", /href=\{`\/online-courses\/\$\{course\.slug\}`\}/],
    ["src/app/online-courses/page.tsx", /Online Coding Courses in India/],
    ["src/app/online-courses/page.tsx", /confirmed online delivery/],
    ["src/app/online-courses/data-science/page.tsx", /Data Science &amp; AI Course Details/],
    ["src/app/online-courses/data-science/page.tsx", /Level: \$\{course\.level\}/],
    ["src/app/online-courses/data-science/page.tsx", /canonical: `\$\{SITE\.url\}\/online-courses\/data-science`/],
    ["src/app/online-courses/data-science/page.tsx", /View Course Details/],
    ["src/app/online-courses/data-science/page.tsx", /course\?\.curriculum\.map/],
    ["src/app/online-courses/data-science/page.tsx", /href="\/courses\/data-science"[\s\S]*?View Course Details/],
    ["src/app/online-courses/full-stack/page.tsx", /formatCoursePrice\(course\.pricing\)/],
    ["src/app/online-courses/full-stack/page.tsx", /Level: \{course\.level\}/],
    ["src/app/online-courses/full-stack/page.tsx", /const CANON = `\$\{SITE\.url\}\/online-courses\/full-stack`/],
    ["src/app/online-courses/data-science/page.tsx", /formatCoursePrice\(course\.pricing\)/],
    ["src/app/online-courses/python/page.tsx", /formatCoursePrice\(course\.pricing\)/],
    ["src/app/online-courses/python/page.tsx", /Level: \{course\.level\}/],
    ["src/app/online-courses/python/page.tsx", /const CANONICAL = `\$\{SITE\.url\}\/online-courses\/python`/],
    ["src/app/online-courses/java/page.tsx", /formatCoursePrice\(course\.pricing\)/],
    ["src/app/online-courses/java/page.tsx", /Level: <strong>\{course\.level\}<\/strong>/],
    ["src/app/online-courses/java/page.tsx", /const PAGE_URL = `\$\{SITE\.url\}\/online-courses\/java`/],
    ["src/app/locations/dehradun/page.tsx", /formatCoursePrice\(course\.pricing\)/],
    ["src/app/locations/dehradun/page.tsx", /isCourseModeAvailable\(course, "On-Campus"\)/],
    ["src/app/about/page.tsx", /formatCoursePrice\(course\.pricing\)/],
    ["src/app/faq/page.tsx", /formatCoursePrice\(course\.pricing\)/],
    ["src/components/faq/HomeFAQ.tsx", /formatCoursePrice\(course\.pricing\)/],
    ["src/components/features/CourseCard.tsx", /formatCoursePrice\(course\.pricing\)/],
    ["src/components/features/CourseCard.tsx", /\{course\.level\}/],
    ["src/components/features/CourseSnapshotMobile.tsx", /level: string/],
    ["src/components/features/CourseSnapshotMobile.tsx", /Course level/],
    ["src/app/vs/coding-ninjas/page.tsx", /formatCoursePrice\(fullStack\.pricing\)/],
    ["src/app/vs/scaler/page.tsx", /formatCoursePrice\(fullStack\.pricing\)/],
    ["src/lib/faq.ts", /formatCoursePrice\(course\.pricing\)/],
    ["src/app/layout.tsx", /const coursePrices = getCourses\(\)\.map\(\(course\) => course\.pricing\.packageRate\)/],
    ["src/lib/schema.ts", /price: course\.pricing\.packageRate/],
    ["src/lib/schema.ts", /price: course\.pricing\.monthlyRate/],
    ["src/lib/schema.ts", /if \(!isCourseModeAvailable\(course, requiredMode\)\) return null/],
    ["src/app/sitemap.ts", /if \(!isCourseModeAvailable\(c, 'Online'\)\) continue/],
    ["src/app/sitemap.ts", /if \(!isCourseModeAvailable\(c, 'On-Campus'\)\) continue/],
    ["src/app/courses/[slug]/page.tsx", /\{courseJsonLd && \(/],
    ["src/app/sitemap.ts", /url: `\$\{BASE_URL\}\/courses\/\$\{c\.slug\}`/],
  ];

  for (const [relativePath, pattern] of consumers) {
    const source = await readFile(path.resolve(repositoryRoot, relativePath), "utf8");
    assert.match(source, pattern, `${relativePath} should consume canonical course data`);
  }

  const onlineHub = await readFile(
    path.resolve(repositoryRoot, "src/app/online-courses/page.tsx"),
    "utf8",
  );
  assert.doesNotMatch(onlineHub, /Live \+ Projects/);
  assert.doesNotMatch(onlineHub, /mentor support/i);
  assert.match(onlineHub, /isCourseModeAvailable\(course, "Online"\)/);
  assert.doesNotMatch(onlineHub, /cohort/i);

  for (const route of ["python", "java", "full-stack"]) {
    const source = await readFile(
      path.resolve(repositoryRoot, `src/app/online-courses/${route}/page.tsx`),
      "utf8",
    );
    assert.doesNotMatch(
      source,
      /weekly live sessions|recordings are included|mentor hours are provided|project reviews are included|placement support|mock interviews|referrals|Zoom\/Meet|cohort space/i,
      `${route} online page should not make unsupported service claims`,
    );
  }

  const dataScienceOnline = await readFile(
    path.resolve(repositoryRoot, "src/app/online-courses/data-science/page.tsx"),
    "utf8",
  );
  assert.doesNotMatch(
    dataScienceOnline,
    /Python, NumPy, Pandas, cleaning, Viz, basic stats, simple ML/,
    "Data Science online page should not duplicate curriculum copy",
  );
  const comparisonAndLocationPages = await Promise.all(
    [
      "src/app/vs/coding-ninjas/page.tsx",
      "src/app/vs/scaler/page.tsx",
      "src/app/locations/dehradun/page.tsx",
    ].map((relativePath) => readFile(path.resolve(repositoryRoot, relativePath), "utf8")),
  );
  for (const source of comparisonAndLocationPages) {
    assert.doesNotMatch(
      source,
      /live \+ projects|recordings|weekly mentor hours|project reviews|small cohorts|small-batch|mentor-led|placement prep|mock interviews|referrals|live mentor feedback|practice interviews/i,
    );
  }
  const courseDetail = await readFile(
    path.resolve(repositoryRoot, "src/app/courses/[slug]/page.tsx"),
    "utf8",
  );
  assert.doesNotMatch(
    courseDetail,
    /placement support|placement assistance|interview prep|resume reviews|referrals|mentor|career guidance|job-ready|portfolio-ready|live cohort|live \+ projects|free consultation|trial session/i,
  );
  assert.match(courseDetail, /\{course\.description\}/);
  assert.match(courseDetail, /Python Course in Dehradun \| Doon Coding Academy/);
  assert.match(courseDetail, /Learning stage: \{course\.level\}/);
  assert.match(courseDetail, /LearningProgressionNote/);
  assert.match(courseDetail, /course\.curriculum\.map/);
  assert.match(courseDetail, /course\.outcomes\.map/);
  assert.doesNotMatch(courseDetail, /Projects you’ll build|Console Banking App|Auth-ready MERN Starter/);
  const coursesPage = await readFile(
    path.resolve(repositoryRoot, "src/app/courses/page.tsx"),
    "utf8",
  );
  assert.match(coursesPage, /<CourseCatalog/);
  assert.match(coursesPage, /Course details and learning path/);
  assert.match(coursesPage, /Have questions about fit, upcoming batches, or learning formats/);
  assert.match(coursesPage, /Discuss your\s+goals with the DCA team/);
  assert.match(coursesPage, /Try a coding challenge in DCA Lab/);
  assert.doesNotMatch(
    coursesPage,
    /Portfolio projects on GitHub|Interview prep & guidance|Local mentor support|free consultation|every course includes portfolio-ready work/i,
  );
  assert.match(dataScienceOnline, /Contact the academy to confirm delivery availability/);
  assert.match(dataScienceOnline, /formatCourseModes\(course\)/);
  assert.match(dataScienceOnline, /LearningProgressionNote/);
  assert.match(dataScienceOnline, /getCourseJsonLd\(course, \{ variant: "online"/);
  assert.match(dataScienceOnline, /\{jsonLd && \(/);
  assert.equal(
    getCourseJsonLd(getCourseBySlug("data-science"), {
      variant: "online",
      pathPrefix: "online-courses",
    }),
    null,
  );
  const learningNote = await readFile(
    path.resolve(repositoryRoot, "src/components/features/LearningProgressionNote.tsx"),
    "utf8",
  );
  assert.match(learningNote, /Course levels are a broad guide/);
  assert.match(learningNote, /starting[\s\S]*point depends on your skills and goals, not course duration/);
  const homeFaq = await readFile(
    path.resolve(repositoryRoot, "src/components/faq/HomeFAQ.tsx"),
    "utf8",
  );
  assert.match(homeFaq, /const deliveryOptions = courses\.map\(\(course\) =>/);
  assert.match(homeFaq, /formatCourseModes\(course\)/);
  assert.doesNotMatch(homeFaq, /All four courses are available On-Campus, Online, and Hybrid/);
  for (const course of getCourses()) {
    assert.doesNotMatch(course.description, /Beginner|Intermediate/i);
  }
});
