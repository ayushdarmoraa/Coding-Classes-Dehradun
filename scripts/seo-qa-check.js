// scripts/seo-qa-check.js
// ESM script to run simple SEO QA checks over src/app/**/page.tsx
// Rules implemented:
//  - Exactly one <h1> in the body/main area
//  - Presence of a canonical (heuristic): <link rel="canonical"...> OR metadataBase OR 'canonical' in exported metadata
//  - Presence of JSON-LD script for Course / FAQPage / BreadcrumbList when applicable (heuristic detection)
// Usage: node scripts/seo-qa-check.js
import fs from "fs";
import path from "path";
import { glob } from "glob";

const ROOT = path.join(process.cwd(), "src", "app");
const GLOB_PATTERNS = [
  "courses/**/page.tsx",
  "online-courses/**/page.tsx",
  "vs/**/page.tsx",
  "locations/**/page.tsx",
  "locations/page.tsx",
];

function warn(msg) {
  console.log("\x1b[33m%s\x1b[0m", `WARN: ${msg}`);
}
function ok(msg) {
  console.log("\x1b[32m%s\x1b[0m", `OK: ${msg}`);
}
function error(msg) {
  console.log("\x1b[31m%s\x1b[0m", `ERR: ${msg}`);
}

function countH1sInMain(content) {
  const mainMatches = content.matchAll(/<main\b[^>]*>([\s\S]*?)<\/main>/gi);
  let count = 0;
  for (const [, mainContent] of mainMatches) {
    count += (mainContent.match(/<h1\b[^>]*>/gi) || []).length;
  }
  return count;
}

function hasCanonicalHeuristic(content) {
  // look for <link rel="canonical"...> or metadataBase or export const metadata = { canonical...
  if (/<link[^>]+rel=(?:'|")canonical(?:'|")/i.test(content)) return true;
  if (/metadataBase\s*[:=]/i.test(content)) return true;
  if (/\bcanonical\s*:/i.test(content)) return true;
  if (/['"`]canonical['"`]\s*[:=]/i.test(content)) return true;
  if (/export\s+const\s+metadata\s*=/i.test(content) && /canonical/i.test(content)) return true;
  return false;
}

function detectJsonLdTypes(content) {
  // Next Script components and self-closing JSX scripts do not have literal closing tags.
  const hasJsonLdScript = /<(?:script|Script)\b[^>]*\btype\s*=\s*(?:'|")application\/ld\+json(?:'|")/i.test(content);
  if (!hasJsonLdScript) return [];

  const types = new Set();
  if (/"@type"\s*:\s*["']Course["']/i.test(content) || /\bgetCourseJsonLd\s*\(/.test(content)) types.add("Course");
  if (/"@type"\s*:\s*["']FAQPage["']/i.test(content) || /\bgenerateFAQPageSchema\s*\(/.test(content)) types.add("FAQPage");
  if (/"@type"\s*:\s*["']BreadcrumbList["']/i.test(content) || /\bbreadcrumbLd\s*\(/.test(content)) types.add("BreadcrumbList");
  if (/"@type"\s*:\s*["']EducationalOrganization["']/i.test(content)) types.add("EducationalOrganization");
  return Array.from(types);
}

function isCoursePage(filepath) {
  const normalizedPath = filepath.replace(/\\/g, "/");
  return /\/(?:courses|online-courses)\/[^/]+\/page\.tsx$/i.test(normalizedPath);
}

function isLocationPage(filepath) {
  return filepath.replace(/\\/g, "/").includes("/locations/");
}

function isFaqExpected(filepath, content) {
  if (!isLocationPage(filepath) && !/\/faq\b/.test(filepath.replace(/\\/g, "/"))) return false;
  const headings = content.matchAll(/<h[1-6]\b[^>]*>([\s\S]*?)<\/h[1-6]>/gi);
  return Array.from(headings).some(([, heading]) =>
    /faq|frequently asked questions/i.test(heading.replace(/<[^>]*>/g, "")),
  );
}

async function run() {
  console.log("Running SEO QA checks...");
  const results = [];
  let exitCode = 0;
  const scannedFiles = new Set();

  for (const pattern of GLOB_PATTERNS) {
    const files = await glob(pattern, { cwd: ROOT, nodir: true });
    for (const relativeFile of files) {
      const relPath = relativeFile.replace(/\\/g, "/");
      if (scannedFiles.has(relPath)) continue;
      scannedFiles.add(relPath);
      const file = path.join(ROOT, ...relPath.split("/"));
      try {
        const raw = fs.readFileSync(file, "utf8");
        const rel = path.posix.join("src", "app", relPath);
        const h1Count = countH1sInMain(raw);
        const hasCanonical = hasCanonicalHeuristic(raw);
        const jsonLdTypes = detectJsonLdTypes(raw);

        const issues = [];
        const mainCount = (raw.match(/<main\b[^>]*>/gi) || []).length;

        if (mainCount !== 1) {
          issues.push(`expected exactly one <main> landmark, found ${mainCount}`);
        }

        if (h1Count === 0) {
          issues.push("missing <h1> in <main>");
        } else if (h1Count > 1) {
          issues.push(`multiple <h1> tags in <main> (${h1Count})`);
        }

        // canonical heuristic: for pages we expect canonical, warn if not found
        if (!hasCanonical) {
          issues.push("no canonical detected by heuristic (look for <link rel=\"canonical\"> or metadataBase/export metadata)");
        }

        // JSON-LD checks: for Course pages, expect Course or EducationalOrganization or BreadcrumbList
        if (isCoursePage(rel)) {
          if (!jsonLdTypes.includes("Course")) {
            issues.push("Course page missing Course JSON-LD (heuristic)");
          }
        }

        if (isLocationPage(rel) && !jsonLdTypes.includes("BreadcrumbList")) {
          issues.push("Missing BreadcrumbList JSON-LD (recommended for location pages)");
        }

        if (isFaqExpected(rel, raw) && !jsonLdTypes.includes("FAQPage")) {
          issues.push("Page contains FAQ section but no FAQPage JSON-LD detected");
        }

        if (issues.length) {
          exitCode = 2;
          error(`${rel} — ${issues.length} issue(s):`);
          issues.forEach((it) => console.log(`  - ${it}`));
          console.log(""); // blank line
        } else {
          ok(`${rel} — all checks passed`);
        }

        results.push({ file: rel, issues });
      } catch (e) {
        exitCode = 3;
        error(`Failed to read/parse ${file}: ${String(e)}`);
      }
    }
  }

  // summary
  const failed = results.filter((r) => r.issues.length);
  console.log("\nSummary:");
  if (failed.length) {
    error(`${failed.length} file(s) failed SEO QA checks.`);
    failed.forEach(f => console.log(` - ${f.file}: ${f.issues.length} issue(s)`));
  } else {
    ok("All scanned files passed SEO QA checks.");
  }

  process.exit(exitCode);
}

run().catch((e) => {
  console.error(e);
  process.exit(10);
});
