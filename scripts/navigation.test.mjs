import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));
const require = createRequire(import.meta.url);
const source = readFileSync(path.resolve(repositoryRoot, "src/lib/nav.ts"), "utf8");
const footer = readFileSync(path.resolve(repositoryRoot, "src/components/layout/Footer.tsx"), "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2020,
  },
}).outputText;
const navModule = { exports: {} };
new Function("require", "module", "exports", compiled)(require, navModule, navModule.exports);

test("primary navigation matches the approved product destinations", () => {
  assert.deepEqual(
    navModule.exports.NAV_LINKS.map(({ label, href }) => [label, href]),
    [
      ["Home", "/"],
      ["Courses", "/courses"],
      ["DCA Lab", "/lab"],
      ["Guides", "/blog"],
      ["About", "/about"],
      ["Contact", "/contact"],
    ],
  );
});

test("course navigation preserves delivery hubs and individual course routes", () => {
  assert.deepEqual(
    navModule.exports.COURSE_LINKS.map(({ label, href }) => [label, href]),
    [
      ["Full-Stack with Gen AI", "/courses/full-stack"],
      ["Data Science & AI", "/courses/data-science"],
      ["Python", "/courses/python"],
      ["Java", "/courses/java"],
      ["→ All Courses", "/courses"],
    ],
  );
});

test("all primary and course navigation destinations resolve to App Router pages", () => {
  const resolveRoute = (href) => {
    const dynamicCourse = href.match(/^\/courses\/[^/]+$/);
    const pagePath = dynamicCourse
      ? path.resolve(repositoryRoot, "src/app/courses/[slug]/page.tsx")
      : path.resolve(repositoryRoot, `src/app${href}/page.tsx`);
    assert.equal(existsSync(pagePath), true, `${href} should resolve to ${pagePath}`);
  };

  for (const { href } of [
    ...navModule.exports.NAV_LINKS,
    ...navModule.exports.COURSE_LINKS,
  ]) {
    resolveRoute(href);
  }

  const footerRoutes = [...footer.matchAll(/href="(\/[^"]*)"/g)].map((match) => match[1]);
  for (const href of footerRoutes) resolveRoute(href);
});

test("DCA Lab navigation has a real non-indexed destination", () => {
  const labPage = path.resolve(repositoryRoot, "src/app/lab/page.tsx");
  assert.equal(existsSync(labPage), true);
  assert.match(readFileSync(labPage, "utf8"), /robots:\s*\{\s*index:\s*false/);
});

test("footer uses the planned groups and only configured or existing destinations", () => {
  assert.match(footer, /import Link from "next\/link"/);
  for (const group of ["Learn", "Resources", "Academy", "Connect"]) {
    assert.ok(footer.includes(`>${group}<`), `Missing footer group: ${group}`);
  }
  for (const href of [
    "/courses",
    "/online-courses",
    "/lab",
    "/blog",
    "/faq",
    "/about",
    "/locations/dehradun",
    "/contact",
  ]) {
    assert.ok(footer.includes(`href="${href}"`), `Missing footer destination: ${href}`);
  }
  assert.doesNotMatch(footer, /facebook\.com|instagram\.com/);
  assert.match(footer, /wa\.me\/917037905464/);
  assert.match(footer, /telHref/);
  assert.match(footer, /mailto:\$\{email\}/);
});
