import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

// Optional HowTo types (for HowTo schema support)
export interface HowToStep {
  name: string;       // short step title
  text?: string;      // optional details
  url?: string;       // optional anchor or external ref
  image?: string;     // optional image (absolute URL or /public path)
}
export interface MonetaryAmount {
  value: number;      // e.g., 500
  currency: string;   // e.g., "INR", "USD"
}

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;            // ISO in frontmatter
  category: string;
  keywords: string[];      // used as tags/SEO keywords
  content: string;         // raw md/mdx
  html?: string;           // rendered HTML (filled on demand)
  readingTime: number;     // minutes (200 wpm)
  related?: string[];      // optional explicit related slugs from frontmatter
  image?: string;          // optional OG/Twitter image (absolute URL or /public path)
  imageAlt?: string;       // optional alt text for social cards
  featured?: boolean;      // pin important posts
  authorName?: string;     // author display name
  authorUrl?: string;      // optional author link
  draft?: boolean;         // if true → excluded from lists/sitemap/rss
  noindex?: boolean;       // if true → page renders but requests noindex
  faqs?: { q: string; a: string }[]; // optional FAQs
  // Series (optional)
  series?: string;         // e.g., "MERN Bootcamp"
  seriesOrder?: number;    // position within the series
  // HowTo (optional)
  howtoSteps?: HowToStep[];                  // ordered steps
  howtoTools?: string[];                     // tools list
  howtoSupplies?: string[];                  // supplies list
  howtoTotalTime?: string;                   // ISO 8601 duration: "PT1H30M"
  howtoEstimatedCost?: MonetaryAmount;       // { value, currency }
  lastModified?: string;      // optional last modified date
}

const postsDirectory = path.join(process.cwd(), "src/content/blog");

// --- Taxonomy Normalizers (minimal, centralized) -----------------------------
const CATEGORY_MAP: Record<string, "Full-Stack" | "Data Science" | "Python" | "Java"> = {
  "full-stack": "Full-Stack",
  "full stack": "Full-Stack",
  "fullstack": "Full-Stack",
  "mern": "Full-Stack",
  "data science": "Data Science",
  "datascience": "Data Science",
  "python": "Python",
  "java": "Java",
};

function normalizeCategory(input?: string | null): "Full-Stack" | "Data Science" | "Python" | "Java" | undefined {
  if (!input) return undefined;
  const key = String(input).trim().toLowerCase();
  return CATEGORY_MAP[key as keyof typeof CATEGORY_MAP];
}

// We won't change how tags/keywords are displayed across the site;
// we only use this to dedupe consistently when listing tags.
function normalizeTagKey(tag: string): string {
  return String(tag)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");
}

function readOne(name: string): BlogPost {
  const filePath = path.join(postsDirectory, name);
  const fileContents = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(fileContents);

  // Basic reading-time (200wpm)
  const words = content.trim().split(/\s+/).length;
  const readingTime = Math.max(1, Math.ceil(words / 200));

  return {
    slug: name.replace(/\.mdx?$/, ""),
    ...(data as Omit<BlogPost, "slug" | "content" | "readingTime">),
    content,
    readingTime,
  } as BlogPost;
}

export function getAllBlogPosts(): BlogPost[] {
  if (!fs.existsSync(postsDirectory)) return [];
  const filenames = fs
    .readdirSync(postsDirectory)
    .filter((n) => n.endsWith(".mdx") || n.endsWith(".md"));

  const posts = filenames.map(readOne);

  // filter out drafts from public listings
  const published = posts.filter((p) => !p.draft);

  // Sort: featured first, then newest → oldest
  return published.sort((a, b) => {
    const fa = a.featured ? 1 : 0;
    const fb = b.featured ? 1 : 0;
    if (fa !== fb) return fb - fa; // featured first
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  // Read a single post directly so drafts can still be accessed for metadata decisions
  const tryPaths = [
    path.join(postsDirectory, `${slug}.mdx`),
    path.join(postsDirectory, `${slug}.md`),
  ];
  for (const fp of tryPaths) {
    if (fs.existsSync(fp)) {
      // reuse readOne by passing the filename
      const filename = path.basename(fp);
      return readOne(filename);
    }
  }
  return undefined;
}

export async function getPostHtmlBySlug(
  slug: string
): Promise<
  | (BlogPost & {
      html: string;
      toc: { id: string; text: string; level: 2 | 3 }[];
      lastModified?: string;
    })
  | undefined
> {
  const post = getPostBySlug(slug);
  if (!post) return undefined;

  // Render Markdown → HTML
  const rendered = await remark().use(html).process(post.content);
  let htmlStr = String(rendered);

  // Add ids to <h2> and <h3>, build TOC (simple, dependency-free)
  const toc: { id: string; text: string; level: 2 | 3 }[] = [];
  const mkId = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .slice(0, 64);

  htmlStr = htmlStr
    .replace(/<h2>([^<]+)<\/h2>/g, (_m, text) => {
      const id = mkId(text);
      toc.push({ id, text, level: 2 });
      return `<h2 id="${id}">${text}</h2>`;
    })
    .replace(/<h3>([^<]+)<\/h3>/g, (_m, text) => {
      const id = mkId(text);
      toc.push({ id, text, level: 3 });
      return `<h3 id="${id}">${text}</h3>`;
    });

  // Optional: file mtime as lastModified (best-effort)
  const lastModified = getPostLastModified(slug);

  return { ...post, html: htmlStr, toc, lastModified };
}

// Helpers for listing/filtering/pagination

export function listCategories(): string[] {
  const posts = getAllBlogPosts();
  const set = new Set<string>();
  for (const p of posts) {
    const canon = normalizeCategory(p.category);
    if (canon) set.add(canon);
  }
  return Array.from(set).sort();
}

export function filterPosts({ category, q }: { category?: string; q?: string }): BlogPost[] {
  const qLower = q?.toLowerCase();
  const wantCat = normalizeCategory(category);
  return getAllBlogPosts().filter((p) => {
    if (wantCat) {
      const pCat = normalizeCategory(p.category);
      if (pCat !== wantCat) return false;
    }
    if (qLower) {
      const blob = `${p.title} ${p.description} ${(p.keywords || []).join(" ")}`.toLowerCase();
      if (!blob.includes(qLower)) return false;
    }
    return !p.draft;
  });
}

export function paginate<T>(items: T[], page = 1, perPage = 6) {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const current = Math.min(Math.max(1, page), totalPages);
  const start = (current - 1) * perPage;
  return {
    items: items.slice(start, start + perPage),
    page: current,
    totalPages,
    total,
  };
}

export function relatedPosts(slug: string, limit = 3): BlogPost[] {
  const all = getAllBlogPosts();
  const me = all.find((p) => p.slug === slug);
  if (!me) return all.slice(0, limit);

  // 1) If frontmatter provides explicit related slugs, respect them first
  if (me.related?.length) {
    const explicit = me.related
      .map((r) => all.find((p) => p.slug === r))
      .filter(Boolean) as BlogPost[];
    if (explicit.length >= limit) return explicit.slice(0, limit);

    // top up with category-based suggestions
    const pool = all.filter((p) => p.slug !== slug && !explicit.some((e) => e.slug === p.slug));
    const sameCat = pool.filter((p) => normalizeCategory(p.category) === normalizeCategory(me.category));
    const rest = pool.filter((p) => normalizeCategory(p.category) !== normalizeCategory(me.category));
    return [...explicit, ...sameCat, ...rest].slice(0, limit);
  }

  // 2) Otherwise, fall back to category proximity
  const pool = all.filter((p) => p.slug !== slug);
  const sameCat = pool.filter((p) => normalizeCategory(p.category) === normalizeCategory(me.category));
  const rest = pool.filter((p) => normalizeCategory(p.category) !== normalizeCategory(me.category));
  return [...sameCat, ...rest].slice(0, limit);
}

// Unique list of tags (keywords)
export function listTags(): string[] {
  const posts = getAllBlogPosts();
  // Deduplicate by a normalized key, but preserve the first-seen original label for display.
  const map = new Map<string, string>(); // key = normalized, value = original display
  for (const p of posts) {
    if (!Array.isArray(p.keywords)) continue;
    for (const k of p.keywords) {
      const key = normalizeTagKey(k);
      if (!map.has(key)) map.set(key, k); // keep first original label
    }
  }
  return Array.from(map.values()).sort();
}

// --- Author helpers ---
export function listAuthors(): string[] {
  const set = new Set<string>();
  getAllBlogPosts().forEach((p) => {
    const name = (p.authorName || "").trim();
    if (name) set.add(name);
  });
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

export function getAuthorPosts(name: string) {
  const needle = name.toLowerCase();
  return getAllBlogPosts().filter((p) => (p.authorName || "").toLowerCase() === needle);
}

// --- Archive helpers ---
export function monthName(m: number): string {
  // 1..12 → "January".."December"
  return new Date(2000, m - 1, 1).toLocaleString("en-US", { month: "long" });
}

export function groupByYearMonth(posts = getAllBlogPosts()) {
  // Map<year, Map<month, BlogPost[]>>
  const map = new Map<number, Map<number, BlogPost[]>>();
  for (const p of posts) {
    const d = new Date(p.date);
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    if (!map.has(y)) map.set(y, new Map());
    const inner = map.get(y)!;
    if (!inner.has(m)) inner.set(m, []);
    inner.get(m)!.push(p);
  }
  // sort posts newest → oldest inside each month
  map.forEach((inner) => {
    inner.forEach((arr: BlogPost[]) => {
      arr.sort((a: BlogPost, b: BlogPost) => new Date(b.date).getTime() - new Date(a.date).getTime());
    });
  });
  return map;
}

export function archiveIndex() {
  // [{ year: 2025, months: [9,8,1]}, ...] sorted desc
  const map = groupByYearMonth();
  const years = Array.from(map.keys()).sort((a, b) => b - a);
  return years.map((year) => ({
    year,
    months: Array.from(map.get(year)!.keys()).sort((a, b) => b - a),
  }));
}

export function postsIn(year?: number, month?: number) {
  const all = getAllBlogPosts();
  if (!year && !month) return all;
  return all.filter((p) => {
    const d = new Date(p.date);
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    if (year && month) return y === year && m === month;
    if (year) return y === year;
    if (month) return m === month;
    return true;
  });
}

// Get file last-modified timestamp for a post (mdx or md)
export function getPostLastModified(slug: string): string | undefined {
  try {
    const fsPathMdx = path.join(process.cwd(), "src/content/blog", `${slug}.mdx`);
    const stat = fs.statSync(fsPathMdx);
    return new Date(stat.mtime).toISOString();
  } catch {
    try {
      const fsPathMd = path.join(process.cwd(), "src/content/blog", `${slug}.md`);
      const stat = fs.statSync(fsPathMd);
      return new Date(stat.mtime).toISOString();
    } catch {
      return undefined;
    }
  }
}

// --- HowTo helpers ---
export function isHowTo(p: BlogPost): boolean {
  return Array.isArray(p.howtoSteps) && p.howtoSteps.length >= 2;
}

export function listHowToPosts(): BlogPost[] {
  return getAllBlogPosts().filter(isHowTo);
}

// --- Series helpers ---
export function listSeries(): string[] {
  const set = new Set<string>();
  getAllBlogPosts().forEach((p) => {
    if (p.series) set.add(p.series);
  });
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

export function getSeriesPosts(series: string): BlogPost[] {
  const posts = getAllBlogPosts().filter(
    (p) => (p.series || "").toLowerCase() === series.toLowerCase()
  );
  return posts.sort((a, b) => {
    const ao = a.seriesOrder ?? Number.MAX_SAFE_INTEGER;
    const bo = b.seriesOrder ?? Number.MAX_SAFE_INTEGER;
    if (ao !== bo) return ao - bo;
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });
}

export function nextPrevInSeries(
  slug: string
): { prevInSeries?: BlogPost; nextInSeries?: BlogPost } {
  const all = getAllBlogPosts();
  const me = all.find((p) => p.slug === slug);
  if (!me || !me.series) return {};
  const seq = getSeriesPosts(me.series);
  const idx = seq.findIndex((p) => p.slug === slug);
  return {
    prevInSeries: idx > 0 ? seq[idx - 1] : undefined,
    nextInSeries: idx >= 0 && idx < seq.length - 1 ? seq[idx + 1] : undefined,
  };
}


