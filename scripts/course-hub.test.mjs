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

const Link = ({ href, children, ...props }) =>
  React.createElement("a", { href, ...props }, children);

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
    if (specifier === "@/components/features/CourseCatalog") {
      return {
        __esModule: true,
        default: () => React.createElement("div", null, "Course catalog"),
      };
    }
    if (specifier === "@/components/features/LearningProgressionNote") {
      return {
        __esModule: true,
        default: () => React.createElement("p", null, "Learning progression"),
      };
    }
    if (specifier === "@/lib/lab/challenges") {
      return { getPublishedChallenges: () => [] };
    }
    if (specifier.startsWith("@/")) {
      return loadTypeScript(
        path.join("src", `${specifier.slice(2)}.ts`),
      );
    }
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

function decodeHtml(value) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#x27;", "'");
}

function parseJsonLd(markup, id) {
  const script = markup.match(
    new RegExp(
      `<script id="${id}" type="application/ld\\+json">([\\s\\S]*?)</script>`,
    ),
  );
  assert.ok(script, `missing JSON-LD script ${id}`);
  return JSON.parse(script[1]);
}

function getVisibleFaqs(markup) {
  const section = markup.match(/<section[^>]*id="faqs"[^>]*>([\s\S]*?)<\/section>/);
  assert.ok(section, "missing visible course hub FAQ section");

  return [...section[1].matchAll(
    /<summary[^>]*>([\s\S]*?)<\/summary>\s*<div[^>]*>([\s\S]*?)<\/div>/g,
  )].map(([, question, answer]) => [
    decodeHtml(question.replace(/<[^>]*>/g, "").trim()),
    decodeHtml(answer.replace(/<[^>]*>/g, "").trim()),
  ]);
}

const coursesPage = loadTypeScript("src/app/courses/page.tsx");
const markup = renderToStaticMarkup(coursesPage.default());

test("Courses hub FAQ JSON-LD exactly matches visible question and answer pairs", () => {
  const visibleFaqs = getVisibleFaqs(markup);
  const faqSchema = parseJsonLd(markup, "courses-faq-schema");
  const schemaFaqs = faqSchema.mainEntity.map((item) => [
    item.name,
    item.acceptedAnswer.text,
  ]);

  assert.equal(faqSchema["@type"], "FAQPage");
  assert.deepEqual(schemaFaqs, visibleFaqs);
  assert.equal(
    parseJsonLd(markup, "courses-breadcrumb")["@type"],
    "BreadcrumbList",
  );
  assert.equal(
    coursesPage.metadata.alternates.canonical,
    "https://dooncodingacademy.in/courses",
  );
});

test("Courses FAQ does not imply that every course includes project work", () => {
  const projectFaq = getVisibleFaqs(markup).find(
    ([question]) => question === "Does every course include project work?",
  );

  assert.deepEqual(projectFaq, [
    "Does every course include project work?",
    "Project details are not listed for every course. Contact DCA to confirm whether a specific course includes project work.",
  ]);
  assert.doesNotMatch(projectFaq[1], /every course includes|each course includes|all courses include/i);
});
