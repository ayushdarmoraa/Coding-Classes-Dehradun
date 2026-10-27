import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";
import { getCourseBySlug } from "@/lib/courses";

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
const CATEGORY_MAP: Record<string, "Full-Stack" | "Data Science" | "Python" | "Java" | "How-To"> = {
  "full-stack": "Full-Stack",
  "full stack": "Full-Stack",
  "fullstack": "Full-Stack",
  "mern": "Full-Stack",
  "data science": "Data Science",
  "datascience": "Data Science",
  "python": "Python",
  "java": "Java",
  "how-to": "How-To",
};

function normalizeCategory(input?: string | null): "Full-Stack" | "Data Science" | "Python" | "Java" | "How-To" | undefined {
  if (!input) return undefined;
  const key = String(input).trim().toLowerCase();
  return CATEGORY_MAP[key as keyof typeof CATEGORY_MAP];
}

export function parseEditorialDate(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const date = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return undefined;
  const parsed = new Date(`${date}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === date
    ? date
    : undefined;
}

export function extractMarkdownFaqs(content: string): { q: string; a: string }[] {
  const section = content
    .match(/^##\s+(?:FAQs?|Frequently asked questions)\b[^\r\n]*\r?\n([\s\S]*)/im)?.[1]
    ?.split(/^##?\s/m, 1)[0];
  if (!section) return [];

  const questions = Array.from(
    section.matchAll(/^\s*\*\*((?:Q\.\s*)?[^*\r\n]*\?)\*\*\s*$/gm),
  );
  const cleanText = (value: string) =>
    value
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/<[^>]*>/g, "")
      .replace(/[`*_~]/g, "")
      .replace(/^\s*[-*+]\s+/gm, "")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#(?:39|x27);/gi, "'")
      .replace(/\s+/g, " ")
      .trim();

  return questions.flatMap((question, index) => {
    const answerStart = question.index + question[0].length;
    const nextQuestion = questions[index + 1];
    const rawAnswer = section.slice(
      answerStart,
      nextQuestion?.index ?? section.length,
    ).split(/\r?\n\s*---\s*\r?\n/)[0];
    const q = cleanText(question[1].replace(/^Q\.\s*/i, ""));
    const a = cleanText(rawAnswer);
    return q && a ? [{ q, a }] : [];
  });
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

  // ---- Normalize front-matter (defensive) ----
  const fm = (data as Partial<BlogPost> & {
    tags?: string[];
    coverImage?: string;
  }) || {};
  const slug = name.replace(/\.mdx?$/, "");

  // Title fallback: humanize slug if missing
  const title =
    (fm.title && String(fm.title).trim()) ||
    slug.replace(/-/g, " ").replace(/\b\w/g, (m: string) => m.toUpperCase());

  const rawDate = typeof fm.date === "string" ? fm.date.trim() : "";
  const date = /^\d{4}-\d{2}-\d{2}$/.test(rawDate)
    ? new Date(`${rawDate}T00:00:00.000Z`)
    : undefined;
  if (!date || Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== rawDate) {
    throw new Error(`Missing or invalid publication date in ${name}`);
  }

  const lastModified = parseEditorialDate(fm.lastModified);

  // Image: treat empty strings as undefined; accept coverImage alias
  const imageRaw = (fm.image ?? fm.coverImage ?? "").toString().trim();
  const image = imageRaw.length
    ? (imageRaw.startsWith("http") || imageRaw.startsWith("/") ? imageRaw : `/${imageRaw}`)
    : undefined;
  const imageAlt = (fm.imageAlt || "").toString().trim() || undefined;

  // Keywords: accept `keywords` or fallback to `tags`
  const keywords =
    Array.isArray(fm.keywords) && fm.keywords.length
      ? fm.keywords
      : Array.isArray(fm.tags)
      ? fm.tags
      : [];

  // Category: empty string → undefined
  const category =
    (fm.category && String(fm.category).trim()) || undefined;

  // Flags (strict booleans)
  const featured = fm.featured === true;
  const draft = fm.draft === true;
  const noindex = fm.noindex === true;

  return {
    slug,
    title,
    description: (fm.description || "").toString(),
    date: rawDate,
    category,
    keywords,
    image,
    imageAlt,
    featured,
    authorName: fm.authorName || undefined,
    authorUrl: fm.authorUrl || undefined,
    draft,
    noindex,
    faqs: Array.isArray(fm.faqs) ? fm.faqs : undefined,
    series: fm.series || undefined,
    seriesOrder: typeof fm.seriesOrder === "number" ? fm.seriesOrder : undefined,
    howtoSteps: Array.isArray(fm.howtoSteps) ? fm.howtoSteps : undefined,
    howtoTools: Array.isArray(fm.howtoTools) ? fm.howtoTools : undefined,
    howtoSupplies: Array.isArray(fm.howtoSupplies) ? fm.howtoSupplies : undefined,
    howtoTotalTime: fm.howtoTotalTime || undefined,
    howtoEstimatedCost: fm.howtoEstimatedCost || undefined,
    lastModified,
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
  const EXCLUDE_SLUGS = new Set(["sample-1", "sample-2"]);
  const published = posts.filter((p) => !p.draft && !EXCLUDE_SLUGS.has(p.slug));

  // Sort: featured first, then newest → oldest
  return published.sort((a, b) => {
    const fa = a.featured ? 1 : 0;
    const fb = b.featured ? 1 : 0;
    if (fa !== fb) return fb - fa; // featured first
    // dates are normalized above; guard against any edge case
    const tb = new Date(b.date).getTime() || 0;
    const ta = new Date(a.date).getTime() || 0;
    return tb - ta;
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

  // Demote article-level H1s so the page title remains the route's only H1.
  const toc: { id: string; text: string; level: 2 | 3 }[] = [];
  const mkId = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .slice(0, 64);

  htmlStr = htmlStr
    .replace(/<h1>([^<]+)<\/h1>/g, (_m, text) => {
      const id = mkId(text);
      toc.push({ id, text, level: 2 });
      return `<h2 id="${id}">${text}</h2>`;
    })
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

  // Only explicit editorial update dates are eligible for display or schema.
  const lastModified = post.lastModified;

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

export function selectRelatedPosts(
  post: Pick<BlogPost, "slug" | "related">,
  posts: BlogPost[],
  limit = 3,
): BlogPost[] {
  if (!post.related?.length || limit <= 0) return [];
  const related: BlogPost[] = [];
  for (const slug of post.related) {
    const candidate = posts.find(
      (entry) => entry.slug === slug && entry.slug !== post.slug && !entry.draft,
    );
    if (candidate && !related.some((entry) => entry.slug === candidate.slug)) {
      related.push(candidate);
    }
    if (related.length === limit) break;
  }
  return related;
}

export function relatedPosts(slug: string, limit = 3): BlogPost[] {
  const all = getAllBlogPosts();
  const post = all.find((entry) => entry.slug === slug);
  return post ? selectRelatedPosts(post, all, limit) : [];
}

export type RelatedCourseLink = {
  slug: string;
  title: string;
  href: string;
  mode: "Online" | "On-Campus";
};

export function getRelatedCourseLinks(
  post: Pick<BlogPost, "content">,
): RelatedCourseLink[] {
  const links = new Map<string, RelatedCourseLink>();
  const pattern = /\]\((\/(online-)?courses\/([a-z0-9]+(?:-[a-z0-9]+)*)(?:[?#][^)]*)?)\)/gi;
  for (const match of post.content.matchAll(pattern)) {
    const [, href, online, slug] = match;
    const course = getCourseBySlug(slug);
    if (!course || links.has(href)) continue;
    links.set(href, {
      slug,
      title: course.title,
      href,
      mode: online ? "Online" : "On-Campus",
    });
  }
  return Array.from(links.values());
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

// Return only an explicitly supplied editorial update date.
export function getPostLastModified(slug: string): string | undefined {
  return getPostBySlug(slug)?.lastModified;
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
