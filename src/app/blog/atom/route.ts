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
  let updated = 0;

  const entries = posts
    .map((p) => {
      const url = `${base}/blog/${p.slug}`;
      const pub = new Date(p.date);
      const lm = getPostLastModified(p.slug);
      const mod = lm ? new Date(lm) : pub;
      updated = Math.max(updated, mod.getTime());

      return `
      <entry>
        <title>${esc(p.title)}</title>
        <link href="${url}" />
        <id>${url}</id>
        <updated>${mod.toISOString()}</updated>
        <published>${pub.toISOString()}</published>
        <summary type="html"><![CDATA[${p.description}]]></summary>
        ${(p.keywords || []).map((k) => `<category term="${esc(k)}" />`).join("")}
      </entry>
    `.trim();
    })
    .join("");

  const atom = `<?xml version="1.0" encoding="utf-8"?>
  <feed xmlns="http://www.w3.org/2005/Atom">
    <title>${esc(siteTitle)} Blog</title>
    <id>${base}/blog</id>
    <updated>${new Date(updated || Date.now()).toISOString()}</updated>
    <link rel="self" href="${base}/blog/atom.xml"/>
    <link rel="alternate" href="${base}/blog"/>
    ${entries}
  </feed>`.trim();

  return new NextResponse(atom, {
    headers: { "Content-Type": "application/atom+xml; charset=utf-8" },
  });
}
