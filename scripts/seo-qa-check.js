import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { once } from "node:events";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { glob } from "glob";
import matter from "gray-matter";

const ROOT = path.join(process.cwd(), "src", "app");
const GLOB_PATTERNS = [
  "src/app/page.tsx",
  "src/app/courses/**/page.tsx",
  "src/app/online-courses/**/page.tsx",
  "src/app/blog/page.tsx",
  "src/app/vs/**/page.tsx",
  "src/app/locations/**/page.tsx",
  "src/app/locations/page.tsx",
  "src/app/lab/page.tsx",
];
export const PRODUCTION_ORIGIN = "https://dooncodingacademy.in";
const BLOG_CONTENT_DIRECTORY = path.join(process.cwd(), "src", "content", "blog");
const EXCLUDED_BLOG_SLUGS = new Set(["sample-1", "sample-2"]);

export function getPublishedGuideRoutes() {
  if (!fs.existsSync(BLOG_CONTENT_DIRECTORY)) return [];
  return fs
    .readdirSync(BLOG_CONTENT_DIRECTORY)
    .filter((filename) => /\.(?:md|mdx)$/.test(filename))
    .filter((filename) => {
      const slug = filename.replace(/\.mdx?$/, "");
      if (EXCLUDED_BLOG_SLUGS.has(slug)) return false;
      const source = fs.readFileSync(path.join(BLOG_CONTENT_DIRECTORY, filename), "utf8");
      return matter(source).data.draft !== true;
    })
    .map((filename) => `/blog/${filename.replace(/\.mdx?$/, "")}`)
    .sort((left, right) => left.localeCompare(right));
}

function getAttributes(tag) {
  const attributes = new Map();
  const attributePattern = /([^\s=/>]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g;
  let match;

  while ((match = attributePattern.exec(tag)) !== null) {
    attributes.set(match[1].toLowerCase(), match[2] ?? match[3] ?? match[4] ?? "");
  }

  return attributes;
}

function getCanonicalLinks(html) {
  const links = [];
  for (const match of html.matchAll(/<link\b[^>]*>/gi)) {
    const attributes = getAttributes(match[0]);
    if ((attributes.get("rel") ?? "").toLowerCase().split(/\s+/).includes("canonical")) {
      links.push(attributes.get("href") ?? "");
    }
  }
  return links;
}

function getPageTitle(html) {
  const match = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
  return match?.[1].replace(/<[^>]*>/g, "").trim() ?? "";
}

function getMetaDescription(html) {
  for (const match of html.matchAll(/<meta\b[^>]*>/gi)) {
    const attributes = getAttributes(match[0]);
    if ((attributes.get("name") ?? "").toLowerCase() === "description") {
      return attributes.get("content")?.trim() ?? "";
    }
  }
  return "";
}

function countH1s(html) {
  const mainMatches = Array.from(html.matchAll(/<main\b[^>]*>([\s\S]*?)<\/main>/gi));
  const mainContent = mainMatches
    .map((match) => match[1])
    .join("");
  return Array.from(mainContent.matchAll(/<h1\b[^>]*>/gi)).length;
}

function countMainLandmarks(html) {
  return Array.from(html.matchAll(/<main\b[^>]*>/gi)).length;
}

function hasNonEmptyMissionSection(html, heading) {
  const mainMatches = Array.from(html.matchAll(/<main\b[^>]*>([\s\S]*?)<\/main>/gi));
  const mainContent = mainMatches.map((match) => match[1]).join("");
  const sectionPattern = /<section\b[^>]*>([\s\S]*?)<\/section>/gi;

  for (const match of mainContent.matchAll(sectionPattern)) {
    const headingMatch = Array.from(
      match[1].matchAll(/<h[2-6]\b[^>]*>([\s\S]*?)<\/h[2-6]>/gi),
    ).find(
      (candidate) =>
        candidate[1].replace(/<[^>]*>/g, " ").trim().toLowerCase() ===
        heading.toLowerCase(),
    );
    if (!headingMatch) continue;
    const content = match[1]
      .slice(headingMatch.index + headingMatch[0].length)
      .replace(/<[^>]*>/g, " ")
      .replace(/&nbsp;|&#160;/gi, " ")
      .trim();
    if (content) return true;
  }
  return false;
}

function getJsonLd(html, issues) {
  const schemas = [];
  for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    const attributes = getAttributes(match[1]);
    if ((attributes.get("type") ?? "").toLowerCase() !== "application/ld+json") continue;

    try {
      schemas.push(JSON.parse(match[2]));
    } catch (error) {
      issues.push(`invalid JSON-LD script: ${String(error)}`);
    }
  }
  return schemas;
}

function collectTypes(value, types = new Set()) {
  if (Array.isArray(value)) {
    value.forEach((item) => collectTypes(item, types));
  } else if (value && typeof value === "object") {
    const type = value["@type"];
    if (typeof type === "string") types.add(type);
    if (Array.isArray(type)) type.forEach((item) => types.add(item));
    Object.values(value).forEach((item) => collectTypes(item, types));
  }
  return types;
}

function findSchemasByType(value, expectedType, schemas = []) {
  if (Array.isArray(value)) {
    value.forEach((item) => findSchemasByType(item, expectedType, schemas));
  } else if (value && typeof value === "object") {
    const type = value["@type"];
    if (
      type === expectedType ||
      (Array.isArray(type) && type.includes(expectedType))
    ) {
      schemas.push(value);
    }
    Object.values(value).forEach((item) =>
      findSchemasByType(item, expectedType, schemas),
    );
  }
  return schemas;
}

function getVisibleLabBreadcrumb(html) {
  const breadcrumbNavigations = Array.from(html.matchAll(/<nav\b([^>]*)>([\s\S]*?)<\/nav>/gi))
    .filter((match) => getAttributes(match[1]).get("aria-label") === "Breadcrumb");
  if (breadcrumbNavigations.length !== 1) return undefined;

  const navigation = breadcrumbNavigations[0][2];
  const links = Array.from(navigation.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi))
    .map((match) => ({
      href: getAttributes(match[1]).get("href"),
      label: match[2].replace(/<[^>]*>/g, " ").trim(),
    }));
  const currentPage = Array.from(
    navigation.matchAll(/<span\b([^>]*)>([\s\S]*?)<\/span>/gi),
  ).find((match) => getAttributes(match[1]).get("aria-current") === "page");

  return {
    links,
    currentLabel: currentPage?.[2].replace(/<[^>]*>/g, " ").trim(),
  };
}

function hasMatchingLabBreadcrumb(html, route, canonical, schemas) {
  const visible = getVisibleLabBreadcrumb(html);
  if (
    !visible ||
    visible.links.length !== 2 ||
    visible.links[0].href !== "/" ||
    visible.links[0].label !== "Home" ||
    visible.links[1].href !== "/lab" ||
    visible.links[1].label !== "DCA Lab"
  ) {
    return false;
  }

  const heading = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1]
    ?.replace(/<[^>]*>/g, " ")
    .trim();
  if (!heading || visible.currentLabel !== heading) return false;

  const breadcrumbs = findSchemasByType(schemas, "BreadcrumbList");
  if (
    breadcrumbs.length !== 1 ||
    breadcrumbs[0]["@context"] !== "https://schema.org" ||
    !Array.isArray(breadcrumbs[0].itemListElement)
  ) {
    return false;
  }

  const items = breadcrumbs[0].itemListElement;
  const expected = [
    { position: 1, name: "Home", url: new URL("/", PRODUCTION_ORIGIN).href },
    { position: 2, name: "DCA Lab", url: new URL("/lab", PRODUCTION_ORIGIN).href },
    { position: 3, name: heading, url: new URL(route, PRODUCTION_ORIGIN).href },
  ];
  return (
    items.length === expected.length &&
    items.every((item, index) => {
      const itemUrl =
        typeof item?.item === "string" ? item.item : item?.item?.["@id"];
      return (
        item?.["@type"] === "ListItem" &&
        item.position === expected[index].position &&
        item.name === expected[index].name &&
        itemUrl === expected[index].url &&
        (index !== expected.length - 1 || itemUrl === canonical)
      );
    })
  );
}

function hasFaqHeading(html) {
  for (const match of html.matchAll(/<h[2-6]\b[^>]*>([\s\S]*?)<\/h[2-6]>/gi)) {
    const text = match[1].replace(/<[^>]*>/g, " ").replace(/<!--.*?-->/g, " ");
    if (/\bFAQs?\b|frequently asked questions/i.test(text)) return true;
  }
  return false;
}

function hasAccessibleSearchInput(html) {
  for (const match of html.matchAll(/<input\b[^>]*>/gi)) {
    const attributes = getAttributes(match[0]);
    if (attributes.get("name") !== "q") continue;
    if ((attributes.get("aria-label") ?? "").trim()) return true;
    const id = attributes.get("id");
    if (!id) continue;
    for (const label of html.matchAll(/<label\b([^>]*)>([\s\S]*?)<\/label>/gi)) {
      if (
        getAttributes(label[1]).get("for") === id &&
        label[2].replace(/<[^>]*>/g, " ").trim()
      ) {
        return true;
      }
    }
  }
  return false;
}

export function analyzeRenderedPage(html, route, productionOrigin = PRODUCTION_ORIGIN) {
  const issues = [];
  const canonicalLinks = getCanonicalLinks(html);
  const isHomePage = route === "/";
  const isLabIndex = route === "/lab";
  const isLabChallenge = /^\/lab\/[^/]+\/[^/]+$/.test(route);
  const isBlogIndex = route === "/blog";
  const isBlogPost = /^\/blog\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(route);
  if (isHomePage || isLabIndex || isLabChallenge || isBlogIndex || isBlogPost) {
    if (!getPageTitle(html)) issues.push("page is missing a non-empty <title>");
    if (!getMetaDescription(html)) {
      issues.push("page is missing a non-empty meta description");
    }
  }
  if (isBlogIndex && !hasAccessibleSearchInput(html)) {
    issues.push("Guides search input must have an accessible label");
  }

  if (canonicalLinks.length !== 1) {
    issues.push(`expected exactly one canonical link, found ${canonicalLinks.length}`);
  } else {
    try {
      const canonical = new URL(canonicalLinks[0]);
      const expected = new URL(route, productionOrigin);
      if (canonical.origin !== productionOrigin || canonical.href !== expected.href) {
        issues.push(`canonical must be ${expected.href}, found ${canonical.href}`);
      }
    } catch {
      issues.push(`invalid canonical URL: ${canonicalLinks[0]}`);
    }
  }

  const mainCount = countMainLandmarks(html);
  if (mainCount !== 1) {
    issues.push(`expected exactly one <main> landmark, found ${mainCount}`);
  }
  const h1Count = countH1s(html);
  if (h1Count !== 1) issues.push(`expected exactly one <h1> in <main>, found ${h1Count}`);

  const schemas = getJsonLd(html, issues);
  const types = collectTypes(schemas);
  const isCourseDetail =
    (route.startsWith("/courses/") && route !== "/courses/") ||
    (route.startsWith("/online-courses/") && route !== "/online-courses/");
  const visibleText = html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ");
  const courseAvailabilityUnconfirmed =
    (route === "/courses/data-science" ||
      route === "/online-courses/data-science") &&
    /delivery availability not confirmed/i.test(visibleText);
  if (isCourseDetail && !types.has("Course") && !courseAvailabilityUnconfirmed) {
    issues.push("course detail is missing Course JSON-LD");
  }
  if (isBlogPost && !types.has("BlogPosting")) {
    issues.push("guide detail is missing BlogPosting JSON-LD");
  }
  if (isBlogPost && !types.has("BreadcrumbList")) {
    issues.push("guide detail is missing BreadcrumbList JSON-LD");
  }
  if (isBlogPost && hasFaqHeading(html) && !types.has("FAQPage")) {
    issues.push("visible guide FAQ section is missing FAQPage JSON-LD");
  }
  if (isHomePage && hasFaqHeading(html) && !types.has("FAQPage")) {
    issues.push("visible homepage FAQ section is missing FAQPage JSON-LD");
  }

  const isLocation = route === "/locations" || route.startsWith("/locations/");
  if (isLocation && !types.has("BreadcrumbList")) {
    issues.push("location page is missing BreadcrumbList JSON-LD");
  }
  if (route.startsWith("/locations/") && hasFaqHeading(html) && !types.has("FAQPage")) {
    issues.push("visible location FAQ section is missing FAQPage JSON-LD");
  }

  if (isLabChallenge) {
    if (!hasNonEmptyMissionSection(html, "Mission scenario")) {
      issues.push("Lab challenge is missing server-rendered mission scenario content");
    }
    if (!hasNonEmptyMissionSection(html, "Your objective")) {
      issues.push("Lab challenge is missing server-rendered mission objective content");
    }
    if (!getVisibleLabBreadcrumb(html)) {
      issues.push("Lab challenge is missing its visible breadcrumb");
    }
    if (!types.has("BreadcrumbList")) {
      issues.push("Lab challenge is missing BreadcrumbList JSON-LD");
    } else if (
      canonicalLinks.length === 1 &&
      !hasMatchingLabBreadcrumb(html, route, canonicalLinks[0], schemas)
    ) {
      issues.push(
        "Lab challenge BreadcrumbList does not match the visible breadcrumb and canonical route",
      );
    }
  }

  return issues;
}

function routeFromPageFile(file) {
  const relativePath = path.relative(ROOT, file).split(path.sep).join("/");
  if (relativePath === "page.tsx") return "/";
  if (!relativePath.endsWith("/page.tsx")) return undefined;

  const segments = relativePath.slice(0, -"/page.tsx".length).split("/");
  if (segments.some((segment) => segment.startsWith("[") && segment.endsWith("]"))) {
    return undefined;
  }
  return `/${segments.join("/")}`;
}

export async function getPageRoutes() {
  const files = new Set();
  for (const pattern of GLOB_PATTERNS) {
    (await glob(pattern, { cwd: process.cwd(), nodir: true })).forEach((file) =>
      files.add(path.resolve(process.cwd(), file))
    );
  }
  const routes = Array.from(files, routeFromPageFile)
    .filter(Boolean)
    .sort((left, right) => left.localeCompare(right));
  routes.push(...getPublishedGuideRoutes());
  if (
    !routes.includes("/") ||
    !routes.includes("/blog") ||
    !routes.includes("/courses") ||
    !routes.includes("/locations") ||
    !routes.includes("/lab")
  ) {
    throw new Error(`SEO QA route discovery was incomplete: ${routes.join(", ")}`);
  }
  return routes;
}

export function extractLinkedRoutes(html, prefix, segmentCount = 1) {
  const routes = new Set();
  for (const match of html.matchAll(/\bhref=(["'])(\/[^"']+)\1/gi)) {
    const pathname = new URL(match[2], PRODUCTION_ORIGIN).pathname;
    const remainder = pathname.slice(prefix.length + 1);
    const segments = remainder.split("/");
    if (
      pathname.startsWith(`${prefix}/`) &&
      segments.length === segmentCount &&
      segments.every((segment) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(segment))
    ) {
      routes.add(pathname);
    }
  }
  return Array.from(routes).sort();
}

async function getAvailablePort() {
  const server = createServer();
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("Could not determine an available port for the production server.");
  }
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
  return address.port;
}

function startProductionServer(port) {
  const nextCli = path.join(process.cwd(), "node_modules", "next", "dist", "bin", "next");
  const child = spawn(
    process.execPath,
    [nextCli, "start", "--hostname", "127.0.0.1", "--port", String(port)],
    { cwd: process.cwd(), stdio: ["ignore", "pipe", "pipe"] }
  );
  let output = "";
  child.stdout.on("data", (chunk) => {
    output = `${output}${chunk}`.slice(-5000);
  });
  child.stderr.on("data", (chunk) => {
    output = `${output}${chunk}`.slice(-5000);
  });
  return { child, getOutput: () => output };
}

async function waitForProductionServer(baseUrl, child, getOutput) {
  let lastError;
  for (let attempt = 0; attempt < 60; attempt += 1) {
    if (child.exitCode !== null || child.signalCode !== null) {
      throw new Error(`Production server exited before becoming ready.\n${getOutput()}`);
    }
    try {
      const response = await fetch(baseUrl, { signal: AbortSignal.timeout(2000) });
      if (response.ok) return;
      lastError = new Error(`Readiness request returned HTTP ${response.status}.`);
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`Production server did not become ready: ${String(lastError)}\n${getOutput()}`);
}

async function stopProductionServer(child) {
  if (child.exitCode !== null || child.signalCode !== null) return;
  child.kill();
  await Promise.race([
    once(child, "exit"),
    new Promise((resolve) => setTimeout(resolve, 2000)),
  ]);
  if (child.exitCode === null && child.signalCode === null) child.kill("SIGKILL");
}

async function run() {
  console.log("Running SEO QA against the production build...");
  const routes = await getPageRoutes();
  const port = await getAvailablePort();
  const baseUrl = `http://127.0.0.1:${port}`;
  const { child, getOutput } = startProductionServer(port);
  const pageCache = new Map();
  const failed = [];

  try {
    await waitForProductionServer(baseUrl, child, getOutput);

    const fetchPage = async (route) => {
      if (pageCache.has(route)) return pageCache.get(route);
      const response = await fetch(new URL(route, baseUrl), {
        signal: AbortSignal.timeout(10000),
      });
      if (!response.ok) {
        const result = { issues: [`route returned HTTP ${response.status}`], html: "" };
        pageCache.set(route, result);
        return result;
      }
      const result = { issues: [], html: await response.text() };
      pageCache.set(route, result);
      return result;
    };

    const listingRoutes = [
      { route: "/courses", segmentCount: 1 },
      { route: "/online-courses", segmentCount: 1 },
      { route: "/lab", segmentCount: 2 },
    ];
    for (const { route: listingRoute, segmentCount } of listingRoutes) {
      if (!routes.includes(listingRoute)) continue;
      const { html, issues } = await fetchPage(listingRoute);
      if (issues.length) continue;
      const linkedRoutes = extractLinkedRoutes(html, listingRoute, segmentCount);
      if (!linkedRoutes.length) {
        failed.push({
          route: listingRoute,
          issues: [`no ${segmentCount}-segment detail links found under ${listingRoute}/`],
        });
      } else {
        linkedRoutes.forEach((route) => routes.push(route));
      }
    }

    for (const route of Array.from(new Set(routes)).sort()) {
      const { html, issues: responseIssues } = await fetchPage(route);
      const issues = [...responseIssues, ...analyzeRenderedPage(html, route)];
      if (issues.length) {
        failed.push({ route, issues });
        console.error(`ERR: ${route}`);
        issues.forEach((issue) => console.error(`  - ${issue}`));
      } else {
        console.log(`OK: ${route} — rendered SEO checks passed`);
      }
    }
  } finally {
    await stopProductionServer(child);
  }

  console.log("\nSummary:");
  if (failed.length) {
    console.error(`ERR: ${failed.length} route(s) failed SEO QA checks.`);
    process.exitCode = 2;
    return;
  }
  console.log(`OK: All ${new Set(routes).size} scanned route(s) passed SEO QA checks.`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  run().catch((error) => {
    console.error(error);
    process.exitCode = 10;
  });
}
