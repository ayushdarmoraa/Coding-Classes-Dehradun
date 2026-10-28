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
let blogModule;

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
    if (specifier === "@/lib/blog") {
      blogModule ??= loadTypeScript("src/lib/blog.ts");
      return blogModule;
    }
    if (specifier === "@/lib/courses") {
      return loadTypeScript("src/lib/courses.ts");
    }
    if (specifier === "@/lib/site-config") {
      return loadTypeScript("src/lib/site-config.ts");
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
    if (specifier === "next/link") {
      return function Link({ children, ...props }) {
        return React.createElement("a", props, children);
      };
    }
    if (specifier === "next/script") {
      return function Script({ strategy: _strategy, ...props }) {
        return React.createElement("script", props);
      };
    }
    if (specifier === "next/image") {
      return function Image({
        fill: _fill,
        priority: _priority,
        fetchPriority: _fetchPriority,
        ...props
      }) {
        return React.createElement("img", props);
      };
    }
    if (specifier === "@/components/seo/PrevNextLinks" ||
        specifier === "@/components/seo/FeedLinks" ||
        specifier === "@/components/Breadcrumbs") {
      return () => null;
    }
    if (specifier === "@/lib/seo") {
      return {
        breadcrumbLd: (items) => ({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: items,
        }),
      };
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

blogModule = loadTypeScript("src/lib/blog.ts", {
  remark: {
    remark: () => ({
      use() {
        return this;
      },
      async process(content) {
        return `<p>${content}</p>`;
      },
    }),
  },
  "remark-html": {},
});
const blogPage = loadTypeScript("src/app/blog/page.tsx");
const howToPage = loadTypeScript("src/app/blog/how-to/page.tsx");
const detailPage = loadTypeScript("src/app/blog/[slug]/page.tsx");
const sitemapModule = loadTypeScript("src/app/sitemap.ts");

function render(element) {
  return renderToStaticMarkup(element);
}

test("Guides hub presents the approved identity, metadata, canonical, and accessible search", async () => {
  const metadata = await blogPage.generateMetadata({});
  const markup = render(React.createElement(blogPage.default));

  assert.equal(metadata.alternates.canonical, "/blog");
  assert.match(metadata.title, /Coding Guides & Learning Resources/);
  assert.match(markup, /<h1[^>]*>Guides for Coding Learners<\/h1>/);
  assert.match(markup, /Beginner-friendly, practical, and useful resources to help you learn clearly\./);
  assert.match(markup, /<input[^>]*name="q"[^>]*aria-label="Search Guides"/);
  assert.match(markup, /href="\/blog\/archive"/);
});

test("published guide listing keeps existing slugs and excludes sample posts", () => {
  const slugs = blogModule.getAllBlogPosts().map(({ slug }) => slug);
  const expected = [
    "best-full-stack-course-dehradun-2025",
    "best-online-data-science-courses-india",
    "coding-classes-dehradun-complete-guide-2025",
    "coding-jobs-in-dehradun-2025",
    "data-science-course-dehradun-2025",
    "java-course-dehradun-2025",
    "learn-full-stack-online-roadmap-india-2025",
    "live-vs-recorded-coding-classes-india",
    "python-course-dehradun-fees-syllabus-jobs-2025",
    "visit-dca-campus-dehradun-guide",
  ];

  assert.deepEqual([...slugs].sort(), expected);
  assert.equal(slugs.includes("sample-1"), false);
  assert.equal(slugs.includes("sample-2"), false);
  assert.equal(render(React.createElement(blogPage.default)).includes('href="/blog/how-to"'), false);
});

test("rendered guide content does not expose raw YAML frontmatter", async () => {
  const post = await blogModule.getPostHtmlBySlug(
    "best-full-stack-course-dehradun-2025",
  );

  assert.ok(post);
  assert.match(post.html, /Related links/);
  assert.match(post.html, /^<p>\r?\n## Related links/);
  assert.doesNotMatch(
    post.html,
    /title: "Best Full-Stack Course in Dehradun \(2025 Guide\)"|description: "Compare Full-Stack \(MERN \+ Generative AI\)|date: "2025-09-02"/,
  );
});

test("course cross-links require an explicit existing guide link and a canonical course", () => {
  const roadmap = blogModule.getPostBySlug("learn-full-stack-online-roadmap-india-2025");
  assert.ok(roadmap);
  assert.ok(blogModule.getRelatedCourseLinks(roadmap).some(
    ({ href }) => href.startsWith("/online-courses/full-stack"),
  ));

  assert.deepEqual(
    blogModule.getRelatedCourseLinks({
      content: "A guide about Python, Java, Full-Stack, and data science.",
      title: "Learn Python",
      description: "A programming roadmap",
      keywords: ["python"],
    }),
    [],
  );
  assert.deepEqual(
    blogModule.getRelatedCourseLinks({
      content: "[Unverified course](/courses/not-a-course)",
    }),
    [],
  );
});

test("related guides require explicit published relationships", () => {
  const first = { slug: "first", category: "Python", related: ["second", "missing", "second"] };
  const second = { slug: "second", category: "Java" };
  const third = { slug: "third", category: "Python" };

  assert.deepEqual(
    blogModule.selectRelatedPosts(first, [first, second, third], 3).map(({ slug }) => slug),
    ["second"],
  );
  assert.deepEqual(blogModule.selectRelatedPosts(third, [first, second, third]), []);
  assert.deepEqual(blogModule.relatedPosts("best-full-stack-course-dehradun-2025"), []);
});

test("editorial update dates accept only valid explicit calendar dates", () => {
  assert.equal(blogModule.parseEditorialDate("2025-09-10"), "2025-09-10");
  assert.equal(blogModule.parseEditorialDate("2025-02-29"), undefined);
  assert.equal(blogModule.parseEditorialDate("2025-09-10T00:00:00Z"), undefined);
  assert.equal(blogModule.parseEditorialDate(undefined), undefined);

  const post = blogModule.getPostBySlug("best-full-stack-course-dehradun-2025");
  assert.equal(post.lastModified, undefined);
});

test("guide FAQ schema reflects the authored Markdown FAQ questions and answers", async () => {
  const post = blogModule.getPostBySlug("visit-dca-campus-dehradun-guide");
  assert.ok(post);
  const faqs = blogModule.extractMarkdownFaqs(post.content);
  assert.deepEqual(faqs.map(({ q }) => q), [
    "Do I need to book an appointment to visit?",
    "Can I attend a trial class?",
    "Is the campus open on Saturdays?",
  ]);

  const markup = render(await detailPage.default({
    params: { slug: post.slug },
  }));
  const faqScript = markup.match(/<script[^>]*id="faq-jsonld"[^>]*>([\s\S]*?)<\/script>/);
  assert.ok(faqScript);
  const schema = JSON.parse(faqScript[1]);
  assert.deepEqual(
    schema.mainEntity.map(({ name, acceptedAnswer }) => ({
      q: name,
      a: acceptedAnswer.text,
    })),
    faqs,
  );
});

test("how-to category normalizes and filters only matching published content", () => {
  assert.ok(blogModule.listCategories().includes("How-To"));
  const posts = blogModule.filterPosts({ category: "how-to" });
  assert.deepEqual(
    posts.map(({ slug }) => slug),
    ["coding-classes-dehradun-complete-guide-2025"],
  );
});

test("empty How-To archive explains its state and links back to available Guides", () => {
  assert.deepEqual(blogModule.listHowToPosts(), []);
  const markup = render(React.createElement(howToPage.default));

  assert.match(markup, /No step-by-step Guides are available yet/);
  assert.match(markup, /href="\/blog"[^>]*>Browse all Guides/);
});

test("guide detail renders publication date without a synthetic updated date", async () => {
  const markup = render(await detailPage.default({
    params: { slug: "best-full-stack-course-dehradun-2025" },
  }));
  const postingScript = markup.match(/<script[^>]*id="blogposting-jsonld"[^>]*>([\s\S]*?)<\/script>/);

  assert.ok(postingScript);
  const posting = JSON.parse(postingScript[1]);
  assert.equal(posting.datePublished, "2025-09-02T00:00:00.000Z");
  assert.equal(Object.hasOwn(posting, "dateModified"), false);
  assert.doesNotMatch(markup, /Updated on/);
});

test("guide detail uses only later editorial update dates in rendered text and BlogPosting schema", async () => {
  const slug = "best-full-stack-course-dehradun-2025";
  const publishedPost = blogModule.getPostBySlug(slug);
  assert.ok(publishedPost);
  const originalGetPostHtmlBySlug = blogModule.getPostHtmlBySlug;

  async function renderWithLastModified(lastModified) {
    blogModule.getPostHtmlBySlug = async () => ({
      ...publishedPost,
      html: "<p>Rendered guide content.</p>",
      toc: [],
      lastModified,
    });

    try {
      const markup = render(await detailPage.default({ params: { slug } }));
      const postingScript = markup.match(
        /<script[^>]*id="blogposting-jsonld"[^>]*>([\s\S]*?)<\/script>/,
      );
      assert.ok(postingScript);
      return { markup, posting: JSON.parse(postingScript[1]) };
    } finally {
      blogModule.getPostHtmlBySlug = originalGetPostHtmlBySlug;
    }
  }

  const validUpdate = await renderWithLastModified("2025-09-03");
  assert.match(validUpdate.markup, /Updated on 3\/9\/2025/);
  assert.equal(validUpdate.posting.datePublished, "2025-09-02T00:00:00.000Z");
  assert.equal(validUpdate.posting.dateModified, "2025-09-03T00:00:00.000Z");

  for (const lastModified of [
    "2025-09-01",
    "2025-09-02",
    "2025-02-30",
    undefined,
  ]) {
    const result = await renderWithLastModified(lastModified);
    assert.doesNotMatch(result.markup, /Updated on/);
    assert.equal(
      Object.hasOwn(result.posting, "dateModified"),
      false,
      `dateModified should be omitted for ${String(lastModified)}`,
    );
  }
});

test("sitemap retains every published guide URL", async () => {
  const entries = await sitemapModule.default();
  const urls = new Set(entries.map(({ url }) => new URL(url).pathname));

  for (const { slug } of blogModule.getAllBlogPosts()) {
    assert.ok(urls.has(`/blog/${slug}`), `sitemap should include /blog/${slug}`);
  }
  assert.ok(urls.has("/blog"));
  assert.equal(urls.has("/projects"), false);
});
