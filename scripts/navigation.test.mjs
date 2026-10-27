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
const header = readFileSync(path.resolve(repositoryRoot, "src/components/layout/Header.tsx"), "utf8");
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

test("DCA Lab navigation has a real indexable destination", () => {
  const labPage = path.resolve(repositoryRoot, "src/app/lab/page.tsx");
  assert.equal(existsSync(labPage), true);
  assert.match(readFileSync(labPage, "utf8"), /alternates:\s*\{\s*canonical:/);
  assert.doesNotMatch(readFileSync(labPage, "utf8"), /robots:\s*\{\s*index:\s*false/);
});

test("navigation destinations resolve to existing routes", () => {
  const links = [
    ...navModule.exports.NAV_LINKS,
    ...navModule.exports.COURSE_LINKS,
  ];

  for (const { href } of links) {
    const route = href === "/" ? "src/app/page.tsx" : `src/app${href}/page.tsx`;
    const dynamicCourseRoute =
      href.startsWith("/courses/") ? "src/app/courses/[slug]/page.tsx" : undefined;
    const dynamicLabRoute =
      href.startsWith("/lab/")
        ? "src/app/lab/[track]/[slug]/page.tsx"
        : undefined;
    assert.ok(
      existsSync(path.resolve(repositoryRoot, route)) ||
        (dynamicCourseRoute && existsSync(path.resolve(repositoryRoot, dynamicCourseRoute))) ||
        (dynamicLabRoute && existsSync(path.resolve(repositoryRoot, dynamicLabRoute))),
      `Missing route for ${href}`,
    );
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
    "/lab/javascript/discount-calculation-bug",
  ]) {
    const dynamicChallengeRoute =
      href.startsWith("/lab/")
        ? "src/app/lab/[track]/[slug]/page.tsx"
        : undefined;
    assert.ok(
      existsSync(path.resolve(repositoryRoot, `src/app${href}/page.tsx`)) ||
        (dynamicChallengeRoute && existsSync(path.resolve(repositoryRoot, dynamicChallengeRoute))),
      `Missing route for ${href}`,
    );
  }
});

test("responsive navigation uses native disclosure controls and visible keyboard focus", () => {
  assert.match(header, /<details/);
  assert.match(header, /<summary/);
  assert.match(header, /aria-label="Main navigation"/);
  assert.match(header, /aria-label="Mobile navigation"/);
  assert.match(header, /focus-visible:ring-2/);
  assert.match(header, /hidden items-center gap-4 whitespace-nowrap text-sm xl:flex/);
  assert.match(header, /xl:hidden/);
  assert.match(header, /isCourseSectionActive/);
  assert.match(header, /currentPath\.startsWith\(href\)/);
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
  assert.match(footer, /SITE\.whatsappUrl/);
  assert.match(footer, /const phone = SITE\.phone/);
  assert.match(footer, /const email = SITE\.email/);
  assert.match(footer, /telHref/);
  assert.match(footer, /mailto:\$\{email\}/);
});
