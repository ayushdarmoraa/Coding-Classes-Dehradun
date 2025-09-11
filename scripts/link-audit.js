import fs from "fs";
import path from "path";
import { glob } from "glob";

// Body-only unique internal link target audit
async function run() {
  const ROOT = path.join(process.cwd(), "src", "app");
  const patterns = [
    "courses/**/page.tsx",
    "online-courses/**/page.tsx",
    "vs/**/page.tsx",
    "locations/**/page.tsx",
    "locations/page.tsx",
  ];

  const rows = [];

  for (const pat of patterns) {
    const files = await glob(pat, { cwd: ROOT, nodir: true, absolute: true });
    for (const file of files) {
      if (file.includes("__tests__") || file.includes(".stories.")) continue;
      const raw = fs.readFileSync(file, "utf8");
      const mainMatch = raw.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
      const body = mainMatch ? mainMatch[1] : raw;
      const set = new Set();
      const hrefRegex = /href=(?:["'`])(\/[a-z0-9-\/]+)(?:["'`])/gi;
      let m;
      while ((m = hrefRegex.exec(body)) !== null) {
        const href = m[1];
        if (/^\/(courses|online-courses|locations|vs|faq|contact)/.test(href)) set.add(href.replace(/\/$/, ""));
      }
      rows.push({ file: path.relative(process.cwd(), file), count: set.size, links: Array.from(set).sort() });
    }
  }

  rows.sort((a, b) => b.count - a.count);
  console.log("Internal Link Audit (body-only unique targets)");
  for (const r of rows) {
    console.log(`${r.count.toString().padStart(2, " ")} — ${r.file}`);
    if (r.links.length) console.log("   targets:", r.links.join(", "));
  }
  console.log("\nAim: 3–5 unique contextual internal link targets per core page (body-only). Heuristic.");
}

run().catch(e => { console.error(e); process.exit(1); });
