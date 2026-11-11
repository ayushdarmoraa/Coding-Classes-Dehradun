import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));
const require = createRequire(path.join(repositoryRoot, "package.json"));
const source = readFileSync(
  path.join(repositoryRoot, "src/components/motion/RevealOnScroll.tsx"),
  "utf8",
);
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    esModuleInterop: true,
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2020,
  },
}).outputText;
const componentModule = { exports: {} };
let effect;
let observedElements;
const localRequire = (specifier) => {
  if (specifier === "react") {
    return { useEffect: (callback) => { effect = callback; } };
  }
  if (specifier === "next/navigation") {
    return { usePathname: () => "/" };
  }
  return require(specifier);
};
new Function("require", "module", "exports", compiled)(
  localRequire,
  componentModule,
  componentModule.exports,
);
const { default: RevealOnScroll, hasGridUtilityClass } = componentModule.exports;

class Element {
  constructor(className = "", children = []) {
    this.className = className;
    this.children = children;
    this.attributes = new Map();
    this.style = { setProperty: (name, value) => this.attributes.set(name, value) };
    this.classList = { add: (name) => this.attributes.set(`class:${name}`, "") };
  }

  closest() {
    return null;
  }

  hasAttribute(name) {
    return this.attributes.has(name);
  }

  setAttribute(name, value) {
    this.attributes.set(name, value);
  }
}

function flatten(elements) {
  return elements.flatMap((element) => [element, ...flatten(element.children)]);
}

test("grid utility detection matches grid layouts and responsive variants only", () => {
  for (const className of [
    "grid",
    "inline-grid",
    "grid-cols-2",
    "grid-rows-[auto_1fr]",
    "grid-flow-col",
    "md:grid-cols-2",
    "sm:inline-grid",
    "2xl:grid-rows-3",
    "[@supports(display:grid)]:grid-cols-3",
  ]) {
    assert.equal(hasGridUtilityClass(className), true, className);
  }

  for (const className of [
    "to-bg-grid",
    "bg-grid",
    "grid-pattern",
    "gridlines",
    "md:to-bg-grid",
  ]) {
    assert.equal(hasGridUtilityClass(className), false, className);
  }
});

test("reveal tagging leaves the hero decoration alone and preserves grid-card behavior", () => {
  const heroDecoration = new Element("pointer-events-none absolute rounded-full");
  const hero = new Element(
    "relative isolate overflow-hidden bg-gradient-to-br to-bg-grid",
    [heroDecoration],
  );
  const baseGridCard = new Element("rounded-xl");
  const baseGrid = new Element("grid grid-cols-2", [baseGridCard]);
  const responsiveGridCard = new Element("rounded-lg");
  const responsiveGrid = new Element("md:grid-cols-2", [responsiveGridCard]);
  const heading = new Element("section-heading");
  const mainElements = [hero, baseGrid, responsiveGrid, heading];
  const allElements = () => flatten(mainElements);
  const main = {
    querySelectorAll(selector) {
      if (selector === "h2, h2 + p") return [heading];
      if (selector === "[class]") return allElements();
      if (selector === "[data-reveal]") {
        return allElements().filter((element) => element.hasAttribute("data-reveal"));
      }
      throw new Error(`Unexpected selector: ${selector}`);
    },
  };
  const htmlClassList = new Set();
  global.document = {
    documentElement: { classList: { add: (name) => htmlClassList.add(name) } },
    querySelector: (selector) => selector === "main" ? main : null,
  };
  global.window = { IntersectionObserver: class {
    constructor(callback, options) {
      this.callback = callback;
      this.options = options;
      observedElements = [];
    }

    observe(element) {
      observedElements.push(element);
    }

    unobserve() {}
    disconnect() {}
  } };
  global.IntersectionObserver = global.window.IntersectionObserver;

  try {
    RevealOnScroll();
    effect();

    assert.equal(heroDecoration.hasAttribute("data-card"), false);
    assert.equal(heroDecoration.hasAttribute("data-reveal"), false);
    for (const card of [baseGridCard, responsiveGridCard]) {
      assert.equal(card.hasAttribute("data-card"), true);
      assert.equal(card.hasAttribute("data-reveal"), true);
    }
    assert.equal(heading.hasAttribute("data-reveal"), true);
    assert.equal(heading.attributes.get("--i"), "0");
    assert.equal(htmlClassList.has("js"), true);
    assert.deepEqual(observedElements, [baseGridCard, responsiveGridCard, heading]);
  } finally {
    delete global.document;
    delete global.window;
    delete global.IntersectionObserver;
  }
});
