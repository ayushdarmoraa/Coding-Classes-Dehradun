import { getAllBlogPosts } from "@/lib/blog";

export async function GET() {
  const allPosts = getAllBlogPosts();

  const feedItems = allPosts
    .map((post) => {
      const postUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/blog/${post.slug}`;
      return `
        <item>
          <title>${post.title}</title>
          <link>${postUrl}</link>
          <guid>${postUrl}</guid>
          <pubDate>${new Date(post.date).toUTCString()}</pubDate>
          <description><![CDATA[${post.description}]]></description>
          <author>dooncodingacademy@gmail.com (Doon Coding Academy)</author>
        </item>
      `;
    })
    .join("");

  const rssFeed = `<?xml version="1.0" encoding="UTF-8"?>
    <rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
      <channel>
        <title>Doon Coding Academy Blog</title>
        <link>${process.env.NEXT_PUBLIC_SITE_URL}</link>
        <description>Stay updated with the latest in coding, technology, and our academy news.</description>
        <language>en-us</language>
        <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
        <atom:link href="${process.env.NEXT_PUBLIC_SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
        ${feedItems}
      </channel>
    </rss>`;

  return new Response(rssFeed, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}


