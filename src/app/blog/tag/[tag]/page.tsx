import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { getAllBlogPosts, paginate, listTags } from "@/lib/blog";

type Params = { tag: string };

export function generateStaticParams() {
  return listTags().map((t) => ({ tag: encodeURIComponent(t) }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const tag = decodeURIComponent(params.tag);
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  const url = `${base}/blog/tag/${encodeURIComponent(tag)}`;
  return {
    title: `Posts tagged “${tag}” | Doon Coding Academy`,
    description: `Blog posts tagged with “${tag}”.`,
    alternates: { canonical: url },
    openGraph: { title: `Posts tagged “${tag}” | Doon Coding Academy`, description: `Posts with tag ${tag}.`, url, type: "website" },
  };
}

export default function TagPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams?: { page?: string };
}) {
  const tag = decodeURIComponent(params.tag);
  const page = Number(searchParams?.page || "1");

  const posts = getAllBlogPosts().filter((p) => (p.keywords || []).some((k) => k.toLowerCase() === tag.toLowerCase()));
  const { items, totalPages } = paginate(posts, page, 6);

  return (
    <div className="container mx-auto p-4">
      <nav className="mb-3 text-sm">
        <Link href="/blog" className="text-blue-700 hover:underline">Blog</Link> <span>/</span>{" "}
        <span className="text-gray-700 font-semibold">Tag</span> <span>/</span>{" "}
        <span className="text-gray-700 font-semibold">{tag}</span>
      </nav>

      <h1 className="text-3xl font-bold mb-6">Tag: {tag}</h1>

      {items.length === 0 ? (
        <p className="text-lg text-gray-700">No posts found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((post) => (
            <article key={post.slug} className="border rounded-lg p-4 shadow-sm flex flex-col">
              <h2 className="text-xl font-semibold mb-1">
                <Link href={`/blog/${post.slug}`} className="hover:underline">{post.title}</Link>
              </h2>
              <p className="text-gray-600 text-sm">
                {new Date(post.date).toLocaleDateString()} • {post.readingTime} min read
              </p>
              <p className="text-gray-700 mt-2 line-clamp-4">{post.description}</p>
              <Link href={`/blog/${post.slug}`} className="text-blue-700 hover:underline mt-4 inline-block">Read More</Link>
            </article>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <Link
              key={n}
              href={`/blog/tag/${encodeURIComponent(tag)}?page=${n}`}
              className={`rounded-md px-3 py-1.5 text-sm border ${
                n === page ? "bg-blue-700 text-white border-blue-700" : "text-blue-700 border-blue-700"
              }`}
            >
              {n}
            </Link>
          ))}
        </div>
      )}

      {/* ItemList schema for this tag page */}
      {items.length > 0 && (
        <Script
          id="tag-itemlist"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ItemList",
              itemListElement: items.map((p, i) => ({
                "@type": "ListItem",
                position: i + 1,
                url: `${(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "")}/blog/${p.slug}`,
                name: p.title,
              })),
            }),
          }}
        />
      )}
    </div>
  );
}
