#!/usr/bin/env node
/*
  Brand audit: find files where 'DCA' appears without 'Doon Coding Academy',
  and where 'DCA' appears before the full brand (first-mention violation).
*/
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const INCLUDE_DIRS = ['src', 'content', 'src/content', 'src/app'];
const EXTENSIONS = new Set(['.tsx', '.ts', '.mdx', '.md', '.jsx', '.js']);
const BRAND = 'Doon Coding Academy';
const DCA_RE = /\bDCA\b/g;

function listFiles(dir) {
  let out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out = out.concat(listFiles(p));
    } else if (EXTENSIONS.has(path.extname(entry.name))) {
      out.push(p);
    }
  }
  return out;
}

function safeRead(file) {
  try { return fs.readFileSync(file, 'utf8'); } catch { return ''; }
}

function auditFiles(files) {
  const dcaOnly = [];
  const both = [];
  const brandOnly = [];
  const firstMentionViolations = [];

  for (const file of files) {
    const text = safeRead(file);
    if (!text) continue;
    const hasDCA = DCA_RE.test(text);
    DCA_RE.lastIndex = 0; // reset after test
    const hasBrand = text.includes(BRAND);
    if (hasDCA && !hasBrand) dcaOnly.push(file);
    else if (!hasDCA && hasBrand) brandOnly.push(file);
    else if (hasDCA && hasBrand) {
      const dcaMatch = text.match(DCA_RE);
      const firstDCAIndex = dcaMatch ? text.indexOf(dcaMatch[0]) : -1;
      const firstBrandIndex = text.indexOf(BRAND);
      if (firstDCAIndex >= 0 && (firstBrandIndex < 0 || firstDCAIndex < firstBrandIndex)) {
        firstMentionViolations.push(file);
      }
      both.push(file);
    }
  }

  return { dcaOnly, both, brandOnly, firstMentionViolations };
}

(function main() {
  const allFiles = [];
  for (const d of INCLUDE_DIRS) {
    const abs = path.join(ROOT, d);
    if (fs.existsSync(abs)) {
      allFiles.push(...listFiles(abs));
    }
  }
  const res = auditFiles(allFiles);
  const summary = {
    totals: {
      scanned: allFiles.length,
      dcaOnly: res.dcaOnly.length,
      both: res.both.length,
      brandOnly: res.brandOnly.length,
      firstMentionViolations: res.firstMentionViolations.length,
    },
    examples: {
      dcaOnly: res.dcaOnly.slice(0, 20),
      firstMentionViolations: res.firstMentionViolations.slice(0, 20),
    },
  };

  console.log('Brand Audit Summary');
  console.log(JSON.stringify(summary, null, 2));
  const outPath = path.join(ROOT, '.brand-audit.json');
  fs.writeFileSync(outPath, JSON.stringify({ ...summary, files: res }, null, 2));
  console.log(`\nWrote detailed results to ${outPath}`);
})();
