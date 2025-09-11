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
  const mainMatch = content.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  const mainContent = mainMatch ? mainMatch[1] : content;
  const matches = mainContent.match(/<h1\b[^>]*>/gi) || [];
  return matches.length;
}

function hasCanonicalHeuristic(content) {
  // look for <link rel="canonical"...> or metadataBase or export const metadata = { canonical...
  if (/<link[^>]+rel=(?:'|")canonical(?:'|")/i.test(content)) return true;
  if (/metadataBase\s*[:=]/i.test(content)) return true;
  if (/['"`]canonical['"`]\s*[:=]/i.test(content)) return true;
  if (/export\s+const\s+metadata\s*=/i.test(content) && /canonical/i.test(content)) return true;
  return false;
}

function detectJsonLdTypes(content) {
  // find <script type="application/ld+json"> blocks and search for @type values
  const types = new Set();
  const regex = /<script[^>]*type=(?:'|")application\/ld\+json(?:'|")[^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = regex.exec(content)) !== null) {
    const jsonText = m[1];
    if (!jsonText) continue;
    if (/"@type"\s*:\s*"(Course)"/i.test(jsonText) || /"@type"\s*:\s*Course\b/i.test(jsonText)) types.add("Course");
    if (/"@type"\s*:\s*"(FAQPage)"/i.test(jsonText) || /"@type"\s*:\s*FAQPage\b/i.test(jsonText)) types.add("FAQPage");
    if (/"@type"\s*:\s*"(BreadcrumbList)"/i.test(jsonText) || /"@type"\s*:\s*BreadcrumbList\b/i.test(jsonText)) types.add("BreadcrumbList");
    if (/"@type"\s*:\s*"(EducationalOrganization)"/i.test(jsonText) || /"@type"\s*:\s*EducationalOrganization\b/i.test(jsonText)) types.add("EducationalOrganization");
  }
  return Array.from(types);
}

function isCoursePage(filepath, content) {
  // heuristic: path includes /courses/ or /online-courses/
  if (filepath.includes("/courses/") || filepath.includes("/online-courses/")) return true;
  // also check explicit Course JSON-LD
  if (/"@type"\s*:\s*["']Course["']/.test(content)) return true;
  return false;
}

function isLocationPage(filepath) {
  return filepath.includes("/locations/");
}

function isFaqExpected(filepath) {
  // We expect FAQ JSON-LD on the location pages and maybe explicit /faq route; heuristic:
  return isLocationPage(filepath) || /\/faq\b/.test(filepath);
}

async function run() {
  console.log("Running SEO QA checks...");
  const results = [];
  let exitCode = 0;

  for (const pattern of GLOB_PATTERNS) {
    const files = await glob(path.join(ROOT, pattern), { nodir: true });
    for (const file of files) {
      try {
        const raw = fs.readFileSync(file, "utf8");
        const rel = path.relative(process.cwd(), file);
        const h1Count = countH1sInMain(raw);
        const hasCanonical = hasCanonicalHeuristic(raw);
        const jsonLdTypes = detectJsonLdTypes(raw);

        const issues = [];

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
        if (isCoursePage(file, raw)) {
          if (!jsonLdTypes.includes("Course")) {
            issues.push("Course page missing Course JSON-LD (heuristic)");
          }
        }

        if (isFaqExpected(file)) {
          // for location pages, expect BreadcrumbList and FAQPage optionally
            if (!jsonLdTypes.includes("BreadcrumbList")) {
            issues.push("Missing BreadcrumbList JSON-LD (recommended for location pages)");
          }
          // FAQPage is optional, but warn if absent on location pages that explicitly have FAQ markup
          // We'll only warn if there's an actual 'FAQ' heading in the main content
          const mainMatch = raw.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
          const mainText = mainMatch ? mainMatch[1] : raw;
          if (/faq|frequently asked questions/i.test(mainText) && !jsonLdTypes.includes("FAQPage")) {
            issues.push("Page contains FAQ section but no FAQPage JSON-LD detected");
          }
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
