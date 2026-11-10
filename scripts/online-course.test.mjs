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
        default: () =>
          React.createElement(
            "p",
            null,
            '"Beginner to Advanced" reflects requested wording; advanced coverage is subject to curriculum and instructor validation.',
          ),
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
    sanitizeAnalyticsParams: (_event, params) => params,
  },
  "@/components/analytics/AnalyticsRouteRegistryProvider": {
    useAnalyticsRouteRegistry: () => undefined,
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

function getInlineScriptBody(id) {
  const layout = readFileSync(
    path.resolve(repositoryRoot, "src/app/layout.tsx"),
    "utf8",
  );
  const escapedId = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const script = layout.match(
    new RegExp(
      `<Script id="${escapedId}"[^>]*>\\s*\\{\\s*\`([\\s\\S]*?)\`\\s*\\}\\s*<\\/Script>`,
    ),
  );
  assert.ok(script, `missing inline script ${id}`);

  const templateBody = script[1]
    .replaceAll("${process.env.NEXT_PUBLIC_GA_ID}", "G-TEST")
    .replaceAll(
      "${ANALYTICS_ROOT_LOCATION}",
      JSON.stringify("https://dooncodingacademy.in/"),
    )
    .replaceAll(
      "${JSON.stringify(PUBLISHED_LAB_PATHS)}",
      JSON.stringify(["/lab/javascript/discount-calculation-bug"]),
    )
    .replaceAll(
      "${JSON.stringify(ANALYTICS_COURSE_SLUGS)}",
      JSON.stringify(["full-stack", "data-science", "python", "java"]),
    )
    .replaceAll(
      "${JSON.stringify(ANALYTICS_GUIDE_SLUGS)}",
      JSON.stringify(["published-guide"]),
    )
    .replaceAll(
      "${JSON.stringify(ANALYTICS_CITY_SLUGS)}",
      JSON.stringify(["dehradun", "bangalore", "mumbai", "noida"]),
    )
    .replaceAll(
      "${JSON.stringify(ANALYTICS_CANONICAL_PATHS)}",
      JSON.stringify([
        "/",
        "/contact",
        "/courses",
        "/courses/python",
        "/online-courses",
        "/online-courses/python",
        "/blog",
        "/blog/published-guide",
        "/lab",
        "/lab/javascript/discount-calculation-bug",
        "/locations",
        "/locations/dehradun",
        "/vs/scaler",
      ]),
    );
  return new Function(`return \`${templateBody}\`;`)();
}

function getDelegatedClickHandler(pathname) {
  const scriptBody = getInlineScriptBody("ga4-delegated-clicks");

  const delegatedEvents = [];
  const listeners = new Map();
  const window = {
    gtag: (...args) => delegatedEvents.push(args),
  };
  const document = {
    addEventListener: (name, handler) => listeners.set(name, handler),
    removeEventListener: (name) => listeners.delete(name),
  };
  runInNewContext(scriptBody, {
    document,
    location: { pathname },
    window,
  });
  const handler = listeners.get("click");
  assert.equal(typeof handler, "function");
  return { delegatedEvents, handler };
}

test("GA inline scripts parse after template interpolation", () => {
  for (const id of ["ga4-loader", "ga4-init", "ga4-delegated-clicks"]) {
    assert.doesNotThrow(
      () => new Function(getInlineScriptBody(id)),
      `${id} must be valid emitted browser JavaScript`,
    );
  }
});

test("GA initialization disables automatic views and starts with a safe canonical URL", () => {
  const dispatchedEvents = [];
  const window = {
    dataLayer: [],
    dispatchEvent: (event) => dispatchedEvents.push(event.type),
  };
  runInNewContext(getInlineScriptBody("ga4-init"), {
    window,
    Event,
  });

  assert.equal(typeof window.gtag, "function");
  assert.equal(window.__DCA_GA_READY__, true);
  assert.deepEqual(dispatchedEvents, ["dca:ga-ready"]);
  const command = window.dataLayer.find(
    (entry) => entry && entry[0] === "config",
  );
  assert.ok(command);
  assert.equal(command[1], "G-TEST");
  assert.deepEqual(JSON.parse(JSON.stringify(command[2])), {
    anonymize_ip: true,
    transport_type: "beacon",
    send_page_view: false,
    page_location: "https://dooncodingacademy.in/",
    page_path: "/",
    page_referrer: "",
  });
  assert.equal(
    window.dataLayer.some((entry) => entry && entry[0] === "event"),
    false,
    "GA initialization must not enqueue an automatic page_view",
  );
});

test("page views use canonical locations for initial and SPA routes only", () => {
  const { createCanonicalPageViewTracker } = loadTypeScript(
    "src/lib/analytics.ts",
  );
  const { track } = loadTypeScript("src/lib/analytics.ts");
  const calls = [];
  const previousWindow = globalThis.window;
  const routes = {
    siteUrl: "https://dooncodingacademy.in",
    courseSlugs: ["python"],
    guideSlugs: ["published-guide"],
    challengeSlugs: ["discount-calculation-bug"],
    challengeIds: ["discount-calculation-bug"],
    labTracks: ["javascript"],
    citySlugs: ["dehradun"],
    canonicalPaths: [
      "/",
      "/courses/python",
      "/blog/published-guide",
      "/lab/javascript/discount-calculation-bug",
    ],
  };
  globalThis.window = {
    gtag: (...args) => calls.push(args),
    __DCA_ANALYTICS_ROUTES__: routes,
  };

  try {
    const trackPageView = createCanonicalPageViewTracker("G-TEST", routes);
    trackPageView("/courses/python");
    trackPageView("/courses/python");
    trackPageView("/blog/published-guide");
    const callsBeforeUnsafeEvent = calls.length;
    track("page_view", {
      page_location:
        "https://dooncodingacademy.in/courses/python?email=learner%40example.test",
      page_path: "/courses/python",
      page_referrer: "",
    });
    assert.equal(calls.length, callsBeforeUnsafeEvent);

    assert.deepEqual(calls, [
      [
        "config",
        "G-TEST",
        {
          send_page_view: false,
          page_location: "https://dooncodingacademy.in/courses/python",
          page_path: "/courses/python",
          page_referrer: "",
        },
      ],
      [
        "event",
        "page_view",
        {
          page_location: "https://dooncodingacademy.in/courses/python",
          page_path: "/courses/python",
          page_referrer: "",
        },
      ],
      [
        "config",
        "G-TEST",
        {
          send_page_view: false,
          page_location: "https://dooncodingacademy.in/blog/published-guide",
          page_path: "/blog/published-guide",
          page_referrer: "",
        },
      ],
      [
        "event",
        "page_view",
        {
          page_location: "https://dooncodingacademy.in/blog/published-guide",
          page_path: "/blog/published-guide",
          page_referrer: "",
        },
      ],
    ]);

    for (const unsafePath of [
      "/courses/python?email=learner%40example.test",
      "/courses/python#learner",
      "/courses/%70ython",
      "/courses/learner@example.test",
      "/unregistered-route",
    ]) {
      trackPageView(unsafePath);
    }

    assert.equal(
      calls.filter(([, name]) => name === "page_view").length,
      2,
      "unsafe routes must not emit page_view events",
    );
    for (const [, command, params] of calls) {
      if (command === "config" || command === "page_view") {
        assert.doesNotMatch(
          JSON.stringify(params),
          /learner|example\.test|%70ython|#|private/i,
        );
        if (params.page_location) {
          assert.match(
            params.page_location,
            /^https:\/\/dooncodingacademy\.in\/(?:courses\/python|blog\/published-guide|\/)?$/,
          );
        }
      }
    }
  } finally {
    if (previousWindow === undefined) delete globalThis.window;
    else globalThis.window = previousWindow;
  }
});

test("TrackedLink serializes only allowlisted analytics parameters", () => {
  const analyticsModule = loadTypeScript("src/lib/analytics.ts");
  const routes = {
    courseSlugs: ["full-stack", "data-science", "python", "java"],
    guideSlugs: ["published-guide"],
    challengeSlugs: ["discount-calculation-bug"],
    challengeIds: ["discount-calculation-bug"],
    labTracks: ["javascript"],
    citySlugs: ["dehradun", "bangalore", "mumbai", "noida"],
    canonicalPaths: ["/contact", "/blog/published-guide"],
  };
  const TrackedLink = loadTypeScript(
    "src/components/analytics/TrackedLink.tsx",
    {
      "@/lib/analytics": analyticsModule,
      "./AnalyticsRouteRegistryProvider": {
        useAnalyticsRouteRegistry: () => routes,
      },
    },
  ).default;
  const element = TrackedLink({
    href: "/blog/published-guide",
    event: "cta_home_read_guide",
    eventParams: {
      guide_slug: "published-guide",
      email: "learner@example.test",
      url: "https://wa.me/123?text=private",
      name: "Test Learner",
    },
    children: "Read guide",
  });

  assert.equal(element.props["data-event"], "cta_home_read_guide");
  assert.deepEqual(
    JSON.parse(element.props["data-event-params"]),
    { guide_slug: "published-guide" },
  );
  assert.doesNotMatch(
    element.props["data-event-params"],
    /learner|example\.test|wa\.me|private|Test Learner/i,
  );
});

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
  assert.match(
    decoded,
    /advanced coverage is subject to curriculum and instructor validation/i,
  );
  assert.equal(
    courses.length,
    4,
    "expected the canonical registry to contain four courses",
  );
  for (const course of courses) {
    if (course.modeStatus === "confirmed") {
      assert.ok(decoded.includes(course.title));
      assert.ok(markup.includes(`href="/online-courses/${course.slug}"`));
    } else {
      assert.equal(decoded.includes(course.title), false);
      assert.equal(markup.includes(`href="/online-courses/${course.slug}"`), false);
    }
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
    const canonical = `${siteConfigModule.SITE.url}/online-courses/${slug}`;
    const hasConfirmedOnlineMode = coursesModule.isCourseModeAvailable(
      course,
      "Online",
    );

    const h1 = decoded.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    assert.ok(h1, `${slug} should render a visible H1`);
    if (hasConfirmedOnlineMode) {
      assert.match(
        h1[1].replace(/<[^>]+>/g, " "),
        /online/i,
        `${slug} should identify its online offering in the visible H1`,
      );
    } else {
      assert.doesNotMatch(
        h1[1].replace(/<[^>]+>/g, " "),
        /online/i,
        `${slug} should not advertise an unconfirmed online offering`,
      );
    }
    assert.ok(decoded.includes(course.level));
    assert.ok(decoded.includes(pricingModule.formatCourseDuration(course.duration)));
    assert.ok(decoded.includes(pricingModule.formatCoursePrice(course.pricing)));
    assert.equal(page.metadata.alternates.canonical, canonical);
    if (hasConfirmedOnlineMode) {
      const schema = parseJsonLd(markup, schemaId);
      assert.equal(schema["@type"], "Course");
      assert.equal(schema.name, course.title);
      assert.equal(schema.courseCode, course.slug);
      assert.equal(schema.url, canonical);
      assert.equal(schema.offers.price, course.pricing.packageRate);
      assert.equal(schema.timeRequired, `P${course.duration.value}M`);
      assert.equal(schema.hasCourseInstance[0].courseMode, "Online");
    } else {
      assert.equal(markup.includes(`id="${schemaId}"`), false);
    }
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
      assert.doesNotMatch(page.metadata.title, /online/i);
      assert.match(decoded, /<h1[^>]*>Data Science & AI Course Details<br\/>/);
      assert.match(decoded, /Delivery availability not confirmed/);
      assert.doesNotMatch(decoded, /Who it.s for|career switchers|structured project work/i);
      for (const fact of course.outcomes) {
        assert.equal(
          countOccurrences(markup, `<li>${escapeHtml(fact)}</li>`),
          1,
        );
      }
    }
    if (coursesModule.isCourseModeAvailable(course, "Online")) {
      assert.ok(parseJsonLd(markup, schemaId));
    } else {
      assert.equal(markup.includes(`id="${schemaId}"`), false);
    }
    if (slug !== "data-science") {
      assert.match(
        decoded,
        /This course is listed for online delivery|Confirmed delivery modes:|upcoming batches, class timings, learning support/,
      );
    }
    assert.doesNotMatch(
      visibleText,
      /weekly live sessions|recordings are included|remote mentor support is included|project feedback is provided|cohort meetings are scheduled|placement support|employment guarantee|students placed|career switchers/i,
    );
    assert.match(
      visibleText,
      /Ask the team about upcoming batches, class timings, learning support|Ask the team whether online delivery is currently available/i,
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

test("delegated tracking omits unknown and PII-like route-derived values", () => {
  for (const pathname of [
    "/courses/unknown-course",
    "/courses/learner@example.test",
    "/courses/%70ython",
    "/courses/python?email=learner%40example.test",
    "/blog/learner@example.test",
    "/locations/learner-name",
  ]) {
    const { delegatedEvents, handler } = getDelegatedClickHandler(pathname);
    handler({
      target: makeClickableAnchor({ href: "tel:+15550100" }),
    });

    assert.equal(delegatedEvents.length, 1, pathname);
    assert.equal(delegatedEvents[0][1], "lead_contact_click", pathname);
    assert.equal(delegatedEvents[0][2].channel, "phone", pathname);
    assert.equal(delegatedEvents[0][2].page_type, "generic", pathname);
    assert.equal(delegatedEvents[0][2].course_slug, undefined, pathname);
    assert.equal(delegatedEvents[0][2].city, undefined, pathname);
    assert.doesNotMatch(JSON.stringify(delegatedEvents), /learner|example\.test|%70ython/i);
  }
});

test("delegated contact and CTA events never include link destinations", () => {
  const destinations = [
    [
      "https://api.whatsapp.com/send?phone=15550100&text=Test%20Learner",
      "lead_contact_click",
      "whatsapp",
      "Chat on WhatsApp",
    ],
    ["tel:+15550100", "lead_contact_click", "phone", "Call us"],
    [
      "https://www.google.com/maps/dir/?query=Test%20Learner",
      "lead_contact_click",
      "directions",
      "Get directions",
    ],
    [
      "mailto:learner@example.test?subject=Private%20enquiry",
      undefined,
      undefined,
      "Email us",
    ],
    [
      "https://external.example.test/path?email=learner%40example.test",
      "cta_enroll_click",
      undefined,
      "Enroll now",
    ],
  ];

  for (const [href, expectedEvent, expectedChannel, label] of destinations) {
    const { delegatedEvents, handler } =
      getDelegatedClickHandler("/courses/python");
    handler({ target: makeClickableAnchor({ href }, label) });

    if (!expectedEvent) {
      assert.deepEqual(delegatedEvents, [], label);
      continue;
    }

    assert.equal(delegatedEvents.length, 1, label);
    assert.equal(delegatedEvents[0][1], expectedEvent, label);
    if (expectedChannel) {
      assert.equal(delegatedEvents[0][2].channel, expectedChannel, label);
    }
    assert.doesNotMatch(
      JSON.stringify(delegatedEvents),
      /api\.whatsapp|wa\.me|15550100|Test%20Learner|learner@example\.test|Private%20enquiry|external\.example\.test|email=|query=/i,
      label,
    );
  }
});
