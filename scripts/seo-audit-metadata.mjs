// Quick SEO audit for blog post titles and descriptions
// Usage: node scripts/seo-audit-metadata.mjs
import { glob } from 'glob';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const TITLE_MAX = 60;
const DESC_MAX = 160;
// Soft minimums (recommendations); not hard errors
const TITLE_MIN = 30;
const DESC_MIN = 120;

function statusFor(len, min, max) {
  if (len > max) return 'over';
  if (len < min) return 'under';
  return 'ok';
}

async function main() {
  const base = path.join(process.cwd(), 'src', 'content', 'blog');
  const files = await glob('**/*.mdx', { cwd: base, absolute: true });
  const rows = [];
  for (const file of files) {
    const raw = fs.readFileSync(file, 'utf8');
    const { data } = matter(raw);
    const slug = path.basename(file).replace(/\.mdx?$/, '');
    let title = (data?.title ?? '').toString().trim();
    let description = (data?.description ?? '').toString().trim();

    // Fallback: some files may have a frontmatter-like header without an opening '---'
    if (!title && !description) {
      const lines = raw.split(/\r?\n/);
      const headerLines = [];
      for (const line of lines) {
        if (line.trim() === '---') break;
        headerLines.push(line);
        if (headerLines.length > 50) break; // safety
      }
      const header = headerLines.join('\n');
      const tMatch = header.match(/^title:\s*["']?([^\n"']+)["']?/m);
      const dMatch = header.match(/^description:\s*["']?([^\n"']+)["']?/m);
      if (tMatch) title = tMatch[1].trim();
      if (dMatch) description = dMatch[1].trim();
    }
    const tLen = title.length;
    const dLen = description.length;
    rows.push({
      slug,
      title,
      titleLen: tLen,
      titleStatus: statusFor(tLen, TITLE_MIN, TITLE_MAX),
      description,
      descLen: dLen,
      descStatus: statusFor(dLen, DESC_MIN, DESC_MAX),
    });
  }

  // Pretty print table-like output
  rows.sort((a, b) => a.slug.localeCompare(b.slug));
  const header = ['slug', 'titleLen', 'titleStatus', 'descLen', 'descStatus'];
  console.log(header.join('\t'));
  for (const r of rows) {
    console.log([r.slug, r.titleLen, r.titleStatus, r.descLen, r.descStatus].join('\t'));
  }

  const over = rows.filter(r => r.titleStatus === 'over' || r.descStatus === 'over');
  const under = rows.filter(r => r.titleStatus === 'under' || r.descStatus === 'under');
  console.log('\nSummary:');
  console.log(`Total: ${rows.length}`);
  console.log(`Over limits: ${over.length}`);
  console.log(`Under recommended mins: ${under.length}`);
}

main().catch((err) => {
  console.error('Audit failed:', err);
  process.exit(1);
});
