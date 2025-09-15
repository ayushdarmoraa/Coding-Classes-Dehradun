#!/usr/bin/env node
// Analytics coverage QA script
// - Scans src/app/**/*.ts?(x) and src/components/**/*.ts?(x)
// - Reports presence of trackLeadClick, trackEnrollClick, trackForm tokens
// - Adds targeted checks for:
//     * Locations pages (src/app/locations/**/page.tsx)
//     * VS pages (src/app/vs/**/page.tsx)
//     * EnquiryForm component (src/components/features/EnquiryForm.tsx)
// - Usage:
//     node ./scripts/check-analytics.js [--strict]
//   When --strict is provided, exits with non-zero code if expected files are missing required tokens.

import { glob } from 'glob';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const repoRoot = process.cwd();
const STRICT = process.argv.includes('--strict');

const globs = [
  'src/app/**/*.ts',
  'src/app/**/*.tsx',
  'src/components/**/*.ts',
  'src/components/**/*.tsx',
];

const tokens = {
  lead: 'trackLeadClick(',
  enroll: 'trackEnrollClick(',
  form: 'trackForm(',
  leadEvent: 'lead_contact_click',
  enrollEvent: 'cta_enroll_click',
  formEventPrefix: 'lead_form_',
};

function short(p) {
  return p.replace(repoRoot + path.sep, '').replaceAll('\\', '/');
}

async function scanFile(file) {
  try {
    const content = await readFile(file, 'utf8');
    return {
      file,
      hasLead: content.includes(tokens.lead),
      hasEnroll: content.includes(tokens.enroll),
      hasForm: content.includes(tokens.form),
      hasLeadEvent: content.includes(tokens.leadEvent),
      hasEnrollEvent: content.includes(tokens.enrollEvent),
      hasFormEvent: content.includes(tokens.formEventPrefix),
    };
  } catch {
    return { file, hasLead: false, hasEnroll: false, hasForm: false, hasLeadEvent: false, hasEnrollEvent: false, hasFormEvent: false };
  }
}

async function main() {
  const files = (await Promise.all(globs.map((g) => glob(g, { cwd: repoRoot, absolute: true })))).flat();
  const unique = Array.from(new Set(files));
  const results = await Promise.all(unique.map(scanFile));

  const totals = {
    files: results.length,
    anyLead: results.filter((r) => r.hasLead).length,
    anyEnroll: results.filter((r) => r.hasEnroll).length,
    anyForm: results.filter((r) => r.hasForm).length,
  };

  // Targeted expectations
  const locPages = results.filter((r) => /src\/app\/locations\/[^/]+\/page\.tsx$/.test(short(r.file)));
  const vsPages = results.filter((r) => /src\/app\/vs\/[^/]+\/page\.tsx$/.test(short(r.file)));
  const enquiryForm = results.find((r) => /src\/components\/features\/EnquiryForm\.tsx$/.test(short(r.file)));

  const missing = [];

  for (const r of locPages) {
    if (!(r.hasLead || r.hasLeadEvent)) missing.push({ file: short(r.file), reason: 'location page missing lead tracking (trackLeadClick or lead_contact_click event)' });
    if (!(r.hasEnroll || r.hasEnrollEvent)) missing.push({ file: short(r.file), reason: 'location page missing enroll tracking (trackEnrollClick or cta_enroll_click event)' });
  }

  for (const r of vsPages) {
    if (!(r.hasEnroll || r.hasEnrollEvent)) missing.push({ file: short(r.file), reason: 'vs page missing enroll tracking (trackEnrollClick or cta_enroll_click event)' });
  }

  if (enquiryForm && !(enquiryForm.hasForm || enquiryForm.hasFormEvent)) {
    missing.push({ file: short(enquiryForm.file), reason: 'EnquiryForm missing form tracking (trackForm or lead_form_* events)' });
  }

  // Print report
  const lines = [];
  lines.push('Analytics coverage report');
  lines.push('='.repeat(80));
  lines.push(`Scanned files: ${totals.files}`);
  lines.push(`Files with trackLeadClick: ${totals.anyLead}`);
  lines.push(`Files with trackEnrollClick: ${totals.anyEnroll}`);
  lines.push(`Files with trackForm: ${totals.anyForm}`);
  lines.push('');
  lines.push('Targeted checks:');
  lines.push(`  Location pages: ${locPages.length}`);
  lines.push(`  VS pages: ${vsPages.length}`);
  lines.push(`  EnquiryForm present: ${Boolean(enquiryForm)}`);
  lines.push('');

  if (missing.length) {
    lines.push('Missing expectations:');
    for (const m of missing) lines.push(`  - ${m.file}: ${m.reason}`);
  } else {
    lines.push('No missing expectations found.');
  }

  console.log(lines.join('\n'));

  if (STRICT && missing.length) {
    console.error(`\nStrict mode: failing with ${missing.length} missing expectation(s).`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('check-analytics error:', err);
  process.exit(2);
});
