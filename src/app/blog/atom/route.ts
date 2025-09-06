import { getAllBlogPosts } from "@/lib/blog";

const rawBase = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
const SITE = rawBase.replace(/^http:\/\//, "https://");

// ---- helpers ----
const safeStr = (v: unknown) => (typeof v === "string" ? v : v == null ? "" : String(v));
const escText = (s: unknown) =>
  safeStr(s).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
const escAttr = (s: unknown) =>
  safeStr(s).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");

const toISO = (d?: string) => {
  if (!d) return new Date().toISOString();
  const x = new Date(d);
  return Number.isNaN(x.getTime()) ? new Date().toISOString() : x.toISOString();
};

export async function GET() {

  const posts = getAllBlogPosts()
    .filter((p) => !p.draft)
    .sort(
      (a, b) =>
        +new Date(b.lastModified ?? b.date ?? 0) -
        +new Date(a.lastModified ?? a.date ?? 0)
    );

  const feedId = `${SITE}/blog/atom`;
  const feedSelf = `${SITE}/blog/atom`;
  const feedHome = `${SITE}/blog`;
  const feedTitle = "Doon Coding Academy Blog";
  const feedUpdated = toISO(posts[0]?.lastModified ?? posts[0]?.date);

const entries = posts.map((p) => {
  const link = `${SITE}/blog/${p.slug}`;
  const title = escText(p.title);
  const updated = toISO(p.lastModified ?? p.date);
  const summary = escText(
    p.description ||
      `${String(p.title)} — insights from Doon Coding Academy (Dehradun). Compare options, syllabus, fees, and outcomes.`
  );

  return `
  <entry>
    <title>${title}</title>
    <id>${escText(link)}</id>
    <link href="${escAttr(link)}" />
    <updated>${updated}</updated>
    <summary type="html">${summary}</summary>
  </entry>`;
}).join("");

  const atom = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${escText(feedTitle)}</title>
  <id>${escText(feedId)}</id>
  <link href="${escAttr(feedSelf)}" rel="self"/>
  <link href="${escAttr(feedHome)}"/>
  <updated>${feedUpdated}</updated>
  ${entries}
</feed>`;

  return new Response(atom, {
    headers: {
      "Content-Type": "application/atom+xml; charset=utf-8",
      "Cache-Control": "s-maxage=600, stale-while-revalidate=86400",
    },
  });
}
