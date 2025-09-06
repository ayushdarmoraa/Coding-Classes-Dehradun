import { getAllBlogPosts } from "@/lib/blog";

/** Type we actually need for the feed (keeps TS strict & no `any`) */
type Postish = {
  slug: string;
  title: string;
  description?: string;
  date?: string;
  draft?: boolean;
  keywords?: string[];
  lastModified?: string | null;
};

/** Normalize a base URL: no trailing slash, force https */
function normalizeBase(input?: string) {
  const raw = (input || "http://localhost:3000").replace(/\/$/, "");
  return raw.replace(/^http:\/\//, "https://");
}
const SITE = normalizeBase(process.env.NEXT_PUBLIC_SITE_URL);

/** Escape text nodes for RSS XML */
function escText(s: unknown): string {
  const str = String(s ?? "");
  // strip control chars except tab, newline, carriage return
  const cleaned = str.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "");
  return cleaned.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Escape attribute values */
function escAttr(s: unknown): string {
  return escText(s).replace(/"/g, "&quot;");
}

/** Safe CDATA wrapper (splits any ']]>' sequences) */
function safeCdata(s: unknown): string {
  const str = String(s ?? "");
  return "<![CDATA[" + str.replace(/]]>/g, "]]><![CDATA[>") + "]]>";
}

/** RFC-822 date for RSS; falls back to now on invalid input */
function toRFC822(iso?: string | null): string {
  if (!iso) return new Date().toUTCString();
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? new Date().toUTCString() : d.toUTCString();
}

/** Safe timestamp (ms) for sorting; returns 0 if invalid/missing */
function toTime(iso?: string | null): number {
  if (!iso) return 0;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? 0 : d.getTime();
}

export async function GET() {
  const posts = (getAllBlogPosts() as unknown as Postish[])
    .filter((p) => !p?.draft)
    .sort((a, b) => {
      const bt = toTime(b.lastModified ?? b.date);
      const at = toTime(a.lastModified ?? a.date);
      return bt - at;
    });

  const channelTitle = "Doon Coding Academy — Blog";
  const channelLink = `${SITE}/blog`;
  const channelDesc =
    "Guides on Full-Stack (MERN + Gen AI), Data Science, Python, and Java from Doon Coding Academy, Dehradun.";

  const newest = posts[0];
  const lastBuildDate = newest
    ? toRFC822(newest.lastModified ?? newest.date)
    : new Date().toUTCString();

  const itemsXml = posts
    .map((p) => {
      const link = `${SITE}/blog/${p.slug}`;
      const title = escText(p.title);
      const pubDate = toRFC822(p.date);
      const description =
        p.description ||
        `${p.title} — insights from Doon Coding Academy (Dehradun). Compare options, syllabus, fees, and outcomes.`;
      const categories = Array.isArray(p.keywords) ? p.keywords : [];

      return `
  <item>
    <title>${title}</title>
    <link>${escText(link)}</link>
    <guid isPermaLink="true">${escText(link)}</guid>
    <pubDate>${pubDate}</pubDate>
    <description>${safeCdata(description)}</description>
    ${categories.map((c) => `<category>${escText(c)}</category>`).join("")}
  </item>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escText(channelTitle)}</title>
    <link>${escText(channelLink)}</link>
    <description>${escText(channelDesc)}</description>
    <language>en-IN</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <generator>Doon Coding Academy RSS</generator>
    <atom:link href="${escAttr(`${SITE}/blog/rss`)}" rel="self" type="application/rss+xml" />
    ${itemsXml}
  </channel>
</rss>`;

  return new Response(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=600, s-maxage=600, stale-while-revalidate=600",
    },
  });
}
