// Google PageSpeed Insights batch checker
// Usage:
//   PAGESPEED_API_KEY=your_key node scripts/psi-check.mjs
// Options (env or CLI):
//   STRATEGY=mobile|desktop (default: mobile)
//   BASE_URL=https://dooncodingacademy.in (fallbacks to NEXT_PUBLIC_SITE_URL)
//   PSI_URLS=/,/courses,/blog (comma-separated overrides)
//   LIMIT=5 (max blog posts to sample)
// Output:
//   reports/psi-YYYYMMDD-HHMMSS.json (raw + summary)

import fs from 'fs';
import path from 'path';

const API_KEY = process.env.PAGESPEED_API_KEY;
if (!API_KEY) {
  console.error('Missing PAGESPEED_API_KEY. Set PAGESPEED_API_KEY in env to your Google PageSpeed Insights API key.');
  process.exit(1);
}

const RAW_BASE = process.env.BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://dooncodingacademy.in';
const BASE = RAW_BASE.replace(/\/$/, '').replace(/^http:\/\//, 'https://').replace(/^https:\/\/www\./, 'https://');
const STRATEGY = (process.env.STRATEGY || process.argv.find(a => a.startsWith('--strategy='))?.split('=')[1] || 'mobile').toLowerCase();
const LIMIT = Number(process.env.LIMIT || 6);

// Default target set (can override via PSI_URLS)
const DEFAULT_URLS = [
  '/',
  '/courses',
  '/online-courses',
  '/blog',
  '/contact',
  '/locations',
  '/faq',
];

// Try sampling a few blog posts (best-effort); if content folder not found, skip.
function discoverBlogUrls(baseDir, limit) {
  try {
    const contentDir = path.join(baseDir, 'src', 'content', 'blog');
    const files = fs.readdirSync(contentDir).filter(f => f.endsWith('.mdx'));
    const slugs = files.map(f => f.replace(/\.mdx?$/, ''))
      .sort((a, b) => a.localeCompare(b))
      .slice(0, Math.max(0, limit));
    return slugs.map(s => `/blog/${s}`);
  } catch {
    return [];
  }
}

function unique(arr) {
  return Array.from(new Set(arr));
}

async function runPsi(fullUrl, strategy) {
  const endpoint = new URL('https://www.googleapis.com/pagespeedonline/v5/runPagespeed');
  endpoint.searchParams.set('url', fullUrl);
  endpoint.searchParams.set('strategy', strategy);
  // Request multiple categories; use append to avoid overwriting
  endpoint.searchParams.append('category', 'PERFORMANCE');
  endpoint.searchParams.append('category', 'ACCESSIBILITY');
  endpoint.searchParams.append('category', 'BEST_PRACTICES');
  endpoint.searchParams.append('category', 'SEO');
  endpoint.searchParams.set('key', API_KEY);

  const res = await fetch(endpoint, { method: 'GET' });
  if (!res.ok) {
    // Surface full response body for better diagnostics (API key/Referer/IP issues, etc.)
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} for ${strategy} ${fullUrl} :: ${text}`);
  }
  return res.json();
}

function summarizePsi(json) {
  const audits = json?.lighthouseResult?.audits || {};
  const cats = json?.lighthouseResult?.categories || {};
  const perf = cats.performance?.score ?? null;
  const a11y = cats.accessibility?.score ?? null;
  const bp = cats['best-practices']?.score ?? null;
  const seo = cats.seo?.score ?? null;
  const fcp = audits['first-contentful-paint']?.numericValue ?? null;
  const lcp = audits['largest-contentful-paint']?.numericValue ?? null;
  const tbt = audits['total-blocking-time']?.numericValue ?? null;
  const cls = audits['cumulative-layout-shift']?.numericValue ?? null;
  return { perf, a11y, bp, seo, fcp, lcp, tbt, cls };
}

async function main() {
  const baseDir = process.cwd();
  const reportsDir = path.join(baseDir, 'reports');
  if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });

  const override = (process.env.PSI_URLS || '').trim();
  const list = override
    ? override.split(',').map(s => s.trim()).filter(Boolean)
    : unique([...DEFAULT_URLS, ...discoverBlogUrls(baseDir, LIMIT)]);

  console.log(`PSI run — strategy=${STRATEGY}, base=${BASE}`);
  console.log('URLs:', list.join(', '));

  const results = [];
  for (const route of list) {
    const url = `${BASE}${route.startsWith('/') ? route : `/${route}`}`;
    process.stdout.write(`→ ${url} ... `);
    try {
      const json = await runPsi(url, STRATEGY);
      const summary = summarizePsi(json);
      results.push({ route, url, summary, raw: json });
      console.log('ok');
    } catch (e) {
      console.error(`Error → ${e?.message || String(e)}`);
      results.push({ route, url, error: e?.message || String(e) });
    }
    // Polite delay to avoid rate limits
    await new Promise(r => setTimeout(r, 1200));
  }

  const ts = new Date();
  const stamp = ts.toISOString().replace(/[-:]/g, '').split('.')[0];
  const outPath = path.join(reportsDir, `psi-${stamp}.json`);
  const summary = results.map(r => ({
    route: r.route,
    url: r.url,
    ...r.summary,
    error: r.error,
  }));
  fs.writeFileSync(outPath, JSON.stringify({
    generatedAt: ts.toISOString(),
    base: BASE,
    strategy: STRATEGY,
    results,
    summary,
  }, null, 2));

  console.log(`\nSaved report → ${path.relative(baseDir, outPath)}`);
  // Print compact table
  console.log('\nroute\tperf\ta11y\tbp\tseo\tFCP(ms)\tLCP(ms)\tTBT(ms)\tCLS');
  for (const s of summary) {
    const fmt = v => (v == null ? '-' : typeof v === 'number' && v <= 1 ? (v * 100).toFixed(0) : v);
    console.log([
      s.route,
      fmt(s.perf), fmt(s.a11y), fmt(s.bp), fmt(s.seo),
      s.fcp ?? '-', s.lcp ?? '-', s.tbt ?? '-', s.cls ?? '-',
    ].join('\t'));
  }
}

main().catch(err => {
  console.error('PSI run failed:', err);
  process.exit(1);
});
