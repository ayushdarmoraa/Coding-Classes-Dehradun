import assert from "node:assert/strict";
import { createRequire } from "node:module";
import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { analyzeRenderedPage } from "./seo-qa-check.js";

const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));
const require = createRequire(path.join(repositoryRoot, "package.json"));
const sourcePath = path.resolve(repositoryRoot, "src/lib/projects.ts");
const source = readFileSync(sourcePath, "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    esModuleInterop: true,
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2020,
  },
}).outputText;
const projectModule = { exports: {} };
new Function("require", "module", "exports", compiled)(
  require,
  projectModule,
  projectModule.exports,
);
const {
  MIN_PUBLISHED_PROJECTS,
  PROJECTS,
  getProjectOriginLabel,
  getProjectForEnvironment,
  getProjectPath,
  getProjectsForEnvironment,
  getPublishedProjectBySlug,
  getPublishedProjects,
  getProjectsByTag,
  getProjectTags,
  resolveProjectScreenshotPath,
  validateProjects,
} = projectModule.exports;

function makeProject(slug, overrides = {}) {
  return {
    slug,
    title: `Project ${slug}`,
    summary: "A verified project summary.",
    origin: "personal-project",
    published: true,
    category: "Web application",
    tags: ["React", "Testing"],
    problem: "A verified problem statement.",
    solution: "A verified solution statement.",
    technologies: ["React"],
    features: ["A verified feature."],
    screenshots: [
      { src: `/projects/${slug}/screen.webp`, alt: `Screenshot of ${slug}` },
    ],
    seo: {
      title: `Project ${slug}`,
      description: "A verified project description.",
    },
    ...overrides,
  };
}

function withTemporaryPublicDirectory(callback) {
  const directory = mkdtempSync(path.join(os.tmpdir(), "dca-projects-test-"));
  try {
    callback(directory);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

function addScreenshot(publicDirectory, slug, filename = "screen.webp") {
  const screenshotDirectory = path.join(publicDirectory, "projects", slug);
  mkdirSync(screenshotDirectory, { recursive: true });
  writeFileSync(path.join(screenshotDirectory, filename), "test screenshot fixture");
}

function loadTypeScript(relativePath, overrides = {}) {
  const filename = path.resolve(repositoryRoot, relativePath);
  const compiledSource = ts.transpileModule(
    readFileSync(filename, "utf8"),
    {
      compilerOptions: {
        esModuleInterop: true,
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2020,
      },
    },
  ).outputText;
  const loadedModule = { exports: {} };
  const localRequire = (specifier) =>
    Object.prototype.hasOwnProperty.call(overrides, specifier)
      ? overrides[specifier]
      : require(specifier);
  new Function("require", "module", "exports", compiledSource)(
    localRequire,
    loadedModule,
    loadedModule.exports,
  );
  return loadedModule.exports;
}

test("registry contains the three supplied projects without inventing missing details", () => {
  assert.deepEqual(
    PROJECTS.map(({ slug }) => slug),
    ["e-commerce-website", "ai-resume-builder", "standupsync"],
  );
  assert.deepEqual(
    PROJECTS.map(({ published }) => published),
    [true, true, true],
  );
  assert.deepEqual(PROJECTS[0].technologies, [
    "MongoDB",
    "Express.js",
    "React.js",
    "Node.js",
  ]);
  assert.deepEqual(PROJECTS[0].features, []);
  assert.deepEqual(PROJECTS[1].technologies, [
    "MongoDB",
    "Express.js",
    "React.js",
    "Node.js",
  ]);
  assert.deepEqual(PROJECTS[1].features, []);
  assert.equal(PROJECTS[0].demoUrl, "https://e-commerce-seven-mu-27.vercel.app/");
  assert.equal(PROJECTS[1].demoUrl, "https://ai-resume-builder-omega-one.vercel.app/");
  assert.equal(PROJECTS[2].demoUrl, "https://standup-live.vercel.app/feed");
  assert.deepEqual(PROJECTS.map(({ repositoryUrl }) => repositoryUrl), [
    undefined,
    undefined,
    undefined,
  ]);
  assert.deepEqual(
    PROJECTS.map(({ screenshots }) => screenshots.length),
    [2, 2, 2],
  );
  assert.deepEqual(
    PROJECTS.map(({ screenshots }) => screenshots.map(({ src }) => src)),
    [
      [
        "/projects/e-commerce-website/pro1.webp",
        "/projects/e-commerce-website/pro2.webp",
      ],
      [
        "/projects/ai-resume-builder/pro1.webp",
        "/projects/ai-resume-builder/pro2.webp",
      ],
      ["/projects/standupsync/pro1.webp", "/projects/standupsync/pro2.webp"],
    ],
  );
  assert.equal(PROJECTS[2].origin, "internship-project");
  assert.deepEqual(PROJECTS[2].technologies, [
    "MongoDB",
    "Express.js",
    "React.js",
    "Node.js",
    "Socket.io",
    "Gemini API",
  ]);
  assert.deepEqual(PROJECTS[2].features, [
    "Real-time communication using Socket.io.",
    "AI-powered productivity insights.",
    "Weekly productivity summaries.",
    "Team standup and update management.",
  ]);
  assert.equal(getProjectOriginLabel("personal-project"), undefined);
  assert.equal(getProjectOriginLabel("internship-project"), "Internship Project");
  assert.equal(PROJECTS[0].seo.title, "E-Commerce Website");
  assert.equal(PROJECTS[1].seo.title, "AI Resume Builder");
  assert.equal(MIN_PUBLISHED_PROJECTS, 3);
  assert.deepEqual(
    getPublishedProjects().map(({ slug }) => slug),
    ["e-commerce-website", "ai-resume-builder", "standupsync"],
  );
  assert.equal(
    getPublishedProjectBySlug("e-commerce-website")?.slug,
    "e-commerce-website",
  );
  assert.deepEqual(
    getProjectsForEnvironment("development").map(({ slug }) => slug),
    ["e-commerce-website", "ai-resume-builder", "standupsync"],
  );
  assert.equal(
    getProjectForEnvironment("standupsync", "development")?.origin,
    "internship-project",
  );
  assert.deepEqual(
    getProjectsForEnvironment("production").map(({ slug }) => slug),
    ["e-commerce-website", "ai-resume-builder", "standupsync"],
  );
  assert.equal(
    getProjectForEnvironment("standupsync", "production")?.origin,
    "internship-project",
  );
  const unconsentedStudentDraft = makeProject("unconsented-student-draft", {
    origin: "student",
    published: false,
    contributors: [{ name: "Unverified learner", consentVerified: false }],
  });
  assert.deepEqual(
    getProjectsForEnvironment("development", [
      makeProject("personal-preview", { published: false }),
      unconsentedStudentDraft,
    ]).map(({ slug }) => slug),
    ["personal-preview"],
  );
});

test("registry rejects duplicate slugs, unsafe screenshot paths, and invalid student consent", () => {
  assert.throws(() =>
    validateProjects([makeProject("resume"), makeProject("resume")]),
  );
  assert.throws(() =>
    validateProjects([
      makeProject("resume", {
        screenshots: [
          { src: "https://example.com/image.webp", alt: "External screenshot" },
        ],
      }),
    ]),
  );
  assert.throws(() =>
    validateProjects([
      makeProject("student-work", {
        origin: "student",
        contributors: [{ name: "Student Name", consentVerified: false }],
      }),
    ]),
  );
  assert.throws(() =>
    validateProjects([
      makeProject("personal-work", {
        contributors: [{ name: "Contributor Name", consentVerified: false }],
      }),
    ]),
  );
  for (const screenshotSrc of [
    "/projects/alpha/../beta/screen.webp",
    "/projects/alpha/subdir/../../beta/screen.webp",
    "/projects/alpha/./screen.webp",
    "/projects/beta/screen.webp",
    "C:\\projects\\alpha\\screen.webp",
    "https://example.com/projects/alpha/screen.webp",
  ]) {
    assert.throws(
      () =>
        validateProjects([
          makeProject("alpha", {
            screenshots: [{ src: screenshotSrc, alt: "Screenshot" }],
          }),
        ]),
      `should reject screenshot path: ${screenshotSrc}`,
    );
  }
});

test("screenshot paths resolve only inside their own project directory", () => {
  const publicDirectory = path.join(os.tmpdir(), "dca-projects-path-check");
  const projectDirectory = path.join(publicDirectory, "projects", "alpha");
  const validPath = resolveProjectScreenshotPath(
    "alpha",
    "/projects/alpha/screen.webp",
    publicDirectory,
  );

  assert.equal(validPath, path.join(projectDirectory, "screen.webp"));
  assert.equal(
    resolveProjectScreenshotPath(
      "alpha",
      "/projects/alpha/../beta/screen.webp",
      publicDirectory,
    ),
    undefined,
  );
  assert.equal(
    resolveProjectScreenshotPath(
      "alpha",
      "/projects/alpha/subdir/../../beta/screen.webp",
      publicDirectory,
    ),
    undefined,
  );
  assert.equal(
    resolveProjectScreenshotPath(
      "alpha",
      "/projects/beta/screen.webp",
      publicDirectory,
    ),
    undefined,
  );
  assert.equal(
    resolveProjectScreenshotPath(
      "alpha",
      "/projects/alpha/./screen.webp",
      publicDirectory,
    ),
    undefined,
  );
  assert.equal(
    resolveProjectScreenshotPath(
      "alpha",
      "/projects/alpha/%2e%2e/beta.webp",
      publicDirectory,
    ),
    undefined,
  );
});

test("published routes require three complete projects and existing screenshots in each project folder", () => {
  assert.equal(MIN_PUBLISHED_PROJECTS, 3);
  const records = [
    makeProject("one"),
    makeProject("two"),
    makeProject("three"),
  ];
  withTemporaryPublicDirectory((publicDirectory) => {
    assert.equal(getPublishedProjects(records.slice(0, 2), publicDirectory).length, 0);
    for (const project of records) addScreenshot(publicDirectory, project.slug);
    assert.equal(
      getPublishedProjects(records, publicDirectory).length,
      MIN_PUBLISHED_PROJECTS,
    );
    assert.equal(
      getPublishedProjectBySlug("two", records, publicDirectory)?.slug,
      "two",
    );
    assert.deepEqual(
      getPublishedProjects(records, publicDirectory).map(({ slug }) => slug),
      ["one", "two", "three"],
    );
  });

  withTemporaryPublicDirectory((publicDirectory) => {
    for (const project of records) addScreenshot(publicDirectory, project.slug);
    rmSync(path.join(publicDirectory, "projects", "two", "screen.webp"));
    assert.deepEqual(getPublishedProjects(records, publicDirectory), []);
  });

  withTemporaryPublicDirectory((publicDirectory) => {
    addScreenshot(publicDirectory, "beta");
    const recordsWithTraversal = [
      makeProject("alpha", {
        screenshots: [
          { src: "/projects/alpha/../beta/screen.webp", alt: "Other project image" },
        ],
      }),
      records[1],
      records[2],
    ];
    assert.throws(() => validateProjects(recordsWithTraversal));
    assert.deepEqual(getPublishedProjects(recordsWithTraversal, publicDirectory), []);
  });

  assert.equal(
    getPublishedProjectBySlug("../two", records, ".", () => true),
    undefined,
  );
});

test("publication rejects symlinked screenshots that escape the project folder", (context) => {
  withTemporaryPublicDirectory((publicDirectory) => {
    const outsidePath = path.join(publicDirectory, "projects", "outside.webp");
    mkdirSync(path.dirname(outsidePath), { recursive: true });
    writeFileSync(outsidePath, "outside fixture");
    const projectDirectory = path.join(publicDirectory, "projects", "one");
    mkdirSync(projectDirectory, { recursive: true });
    try {
      symlinkSync(outsidePath, path.join(projectDirectory, "screen.webp"));
    } catch (error) {
      if (error.code === "EPERM" || error.code === "EACCES") {
        context.skip("The operating system does not allow creating symlinks");
        return;
      }
      throw error;
    }

    addScreenshot(publicDirectory, "two");
    addScreenshot(publicDirectory, "three");
    assert.deepEqual(
      getPublishedProjects(
        [makeProject("one"), makeProject("two"), makeProject("three")],
        publicDirectory,
      ),
      [],
    );
  });
});

test("publication rejects project directories redirected to another project", (context) => {
  withTemporaryPublicDirectory((publicDirectory) => {
    const projectsDirectory = path.join(publicDirectory, "projects");
    const redirectedProjectDirectory = path.join(projectsDirectory, "one");
    const targetProjectDirectory = path.join(projectsDirectory, "two");
    mkdirSync(targetProjectDirectory, { recursive: true });
    addScreenshot(publicDirectory, "two");
    addScreenshot(publicDirectory, "three");
    addScreenshot(publicDirectory, "four");

    try {
      symlinkSync(
        targetProjectDirectory,
        redirectedProjectDirectory,
        process.platform === "win32" ? "junction" : "dir",
      );
    } catch (error) {
      if (["EPERM", "EACCES", "ENOTSUP", "EOPNOTSUPP"].includes(error.code)) {
        context.skip(
          `The platform denied directory symlink/junction creation (${error.code})`,
        );
        return;
      }
      throw error;
    }

    const projects = [
      makeProject("one"),
      makeProject("two"),
      makeProject("three"),
      makeProject("four"),
    ];
    assert.deepEqual(
      getPublishedProjects(projects, publicDirectory).map(({ slug }) => slug),
      ["two", "three", "four"],
    );
  });
});

test("project tags filter safely and route paths validate slugs", () => {
  const projects = [
    makeProject("one", { tags: ["React", "Web"] }),
    makeProject("two", { tags: ["Python", "Data"] }),
  ];
  assert.deepEqual(getProjectTags(projects), [
    "Data",
    "Python",
    "React",
    "Web",
    "Web application",
  ]);
  assert.deepEqual(getProjectsByTag("Python", projects).map(({ slug }) => [slug]), [
    ["two"],
  ]);
  assert.deepEqual(getProjectsByTag(undefined, projects), projects);
  assert.equal(getProjectPath({ slug: "valid-project" }), "/projects/valid-project");
  assert.throws(() => getProjectPath({ slug: "../private" }));
});

test("project pages use publication gating and stay out of public navigation and sitemap while gated", () => {
  const indexPage = readFileSync(
    path.join(repositoryRoot, "src/app/projects/page.tsx"),
    "utf8",
  );
  const detailPage = readFileSync(
    path.join(repositoryRoot, "src/app/projects/[slug]/page.tsx"),
    "utf8",
  );
  const seoQa = readFileSync(
    path.join(repositoryRoot, "scripts/seo-qa-check.js"),
    "utf8",
  );
  const sitemap = readFileSync(
    path.join(repositoryRoot, "src/app/sitemap.ts"),
    "utf8",
  );
  const navigation = readFileSync(
    path.join(repositoryRoot, "src/lib/nav.ts"),
    "utf8",
  );
  const homepage = readFileSync(
    path.join(repositoryRoot, "src/app/page.tsx"),
    "utf8",
  );

  assert.match(indexPage, /getProjectsForEnvironment\(\)/);
  assert.match(indexPage, /process\.env\.NODE_ENV === "development"/);
  assert.match(indexPage, /if \(projects\.length === 0\) notFound\(\)/);
  assert.match(indexPage, /canonical: `\$\{SITE\.url\}\/projects`/);
  assert.match(detailPage, /getProjectForEnvironment\(params\.slug\)/);
  assert.match(detailPage, /process\.env\.NODE_ENV === "development"/);
  assert.match(detailPage, /if \(!project\) notFound\(\)/);
  assert.match(detailPage, /generateStaticParams/);
  assert.match(detailPage, /canonical/);
  assert.match(sitemap, /getPublishedProjects\(\)/);
  assert.match(seoQa, /getPublishedProjectRoutes/);
  assert.doesNotMatch(navigation, /\/projects/);
  assert.match(homepage, /getPublishedProjects\(\)/);
  assert.match(homepage, /projects\.length > 0/);
});

test("screenshot location documents the approved local asset convention", () => {
  const readme = readFileSync(
    path.join(repositoryRoot, "public/projects/README.md"),
    "utf8",
  );
  assert.match(readme, /public\/projects\/ai-resume-builder\/dashboard\.webp/);
  assert.match(readme, /Do not use stock images, mockups, or generated images/);
  assert.match(readme, /minimum of three eligible projects/);
  assert.match(readme, /does not define a numeric minimum/);
  assert.match(readme, /not a numeric mandate\s+from the plan/);
});

test("SEO QA enforces the Projects index's 140-160 character description requirement", () => {
  const description =
    "Explore verified coding projects from Doon Coding Academy. See each project's purpose, features, technologies, and learning links, then explore a course.";
  assert.equal(description.length, 153);

  const page = (metaDescription) => `
    <html>
      <head>
        <title>Projects | Doon Coding Academy</title>
        <meta name="description" content="${metaDescription}">
        <link rel="canonical" href="https://dooncodingacademy.in/projects">
      </head>
      <body><main><h1>Projects</h1></main></body>
    </html>
  `;

  assert.deepEqual(analyzeRenderedPage(page(description), "/projects"), []);
  assert.ok(
    analyzeRenderedPage(page("Short description."), "/projects").some((issue) =>
      issue.includes("must be 140-160 characters"),
    ),
  );
  assert.ok(
    analyzeRenderedPage(page("x".repeat(161)), "/projects").some((issue) =>
      issue.includes("must be 140-160 characters"),
    ),
  );
});

test("sitemap adds the index and detail URLs only after project publication gates pass", async () => {
  const projects = [
    makeProject("one"),
    makeProject("two"),
    makeProject("three"),
  ];
  const screenshotExists = () => true;
  const sitemapModule = loadTypeScript("src/app/sitemap.ts", {
    "@/lib/courses": {
      getCourses: async () => [],
      isCourseModeAvailable: () => false,
    },
    "@/lib/blog": {
      getAllBlogPosts: async () => [],
      getPostLastModified: async () => undefined,
    },
    "@/lib/lab/challenges": { getPublishedChallenges: () => [] },
    "@/lib/lab/challenge-utils": {
      getChallengePath: ({ track, slug }) => `/lab/${track}/${slug}`,
    },
    "@/lib/projects": {
      getPublishedProjects: () =>
        getPublishedProjects(projects, ".", screenshotExists),
      getProjectPath,
    },
    "@/lib/outcomes": { hasPublishedOutcomeContent: () => false },
    "@/lib/site-config": { SITE: { url: "https://dooncodingacademy.in" } },
  });

  const entries = await sitemapModule.default();
  const urls = new Set(entries.map(({ url }) => new URL(url).pathname));

  assert.ok(urls.has("/projects"));
  for (const project of projects) {
    assert.ok(urls.has(getProjectPath(project)));
  }
});
