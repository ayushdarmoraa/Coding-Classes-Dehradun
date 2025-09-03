import { NextResponse } from "next/server";
import { getAllBlogPosts, getPostLastModified } from "@/lib/blog";

export const revalidate = 3600;
export const dynamic = "force-static";

function esc(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export async function GET() {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  const siteTitle = process.env.NEXT_PUBLIC_SITE_NAME || "Doon Coding Academy";
  const posts = getAllBlogPosts();

  // Channel lastBuildDate = latest of pubDate/lastModified
  let latest = 0;
  const items = posts
    .map((p) => {
      const url = `${base}/blog/${p.slug}`;
      const pub = new Date(p.date);
      const lastmod = getPostLastModified(p.slug);
      const updated = lastmod ? new Date(lastmod) : pub;

      latest = Math.max(latest, updated.getTime());

      return `
        <item>
          <title>${esc(p.title)}</title>
          <link>${url}</link>
          <guid isPermaLink="true">${url}</guid>
          <pubDate>${pub.toUTCString()}</pubDate>
          <atom:updated>${updated.toISOString()}</atom:updated>
          <description><![CDATA[${p.description}]]></description>
          ${p.keywords?.map((k) => `<category>${esc(k)}</category>`).join("") || ""}
        </item>
      `.trim();
    })
    .join("");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
  <rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
    <channel>
      <title>${esc(siteTitle)} Blog</title>
      <link>${base}/blog</link>
      <atom:link href="${base}/blog/rss.xml" rel="self" type="application/rss+xml"/>
      <description>Guides, tutorials, and career advice from ${esc(siteTitle)}.</description>
      <language>en</language>
      <lastBuildDate>${new Date(latest || Date.now()).toUTCString()}</lastBuildDate>
      ${items}
    </channel>
  </rss>`.trim();

  return new NextResponse(rss, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
