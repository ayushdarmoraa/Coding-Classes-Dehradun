import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { filterPosts, listCategories, paginate } from "@/lib/blog";

type Params = { category: string };

export function generateStaticParams() {
  return listCategories().map((c) => ({ category: encodeURIComponent(c) }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const category = decodeURIComponent(params.category);
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  const url = `${base}/blog/category/${encodeURIComponent(category)}`;
  return {
    title: `${category} Articles | Doon Coding Academy`,
    description: `Blog posts in the ${category} category from Doon Coding Academy.`,
    alternates: { canonical: url },
    openGraph: { title: `${category} Articles | Doon Coding Academy`, description: `Posts about ${category}.`, url, type: "website" },
  };
}

export default function CategoryPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams?: { q?: string; page?: string };
}) {
  const category = decodeURIComponent(params.category);
  const q = searchParams?.q || "";
  const page = Number(searchParams?.page || "1");

  const posts = filterPosts({ category, q });
  const { items, totalPages } = paginate(posts, page, 6);
  const categories = listCategories();

  return (
    <div className="container mx-auto p-4">
      <nav className="mb-3 text-sm">
        <Link href="/blog" className="text-blue-700 hover:underline">Blog</Link> <span>/</span>{" "}
        <span className="text-gray-700 font-semibold">{category}</span>
      </nav>

      <h1 className="text-3xl font-bold mb-6">{category}</h1>

      {/* Filters/Search */}
      <form className="mb-6 flex flex-wrap gap-3 items-center">
        <div className="flex flex-wrap gap-2">
          <Link href="/blog" className="rounded-xl px-3 py-1.5 text-sm border text-blue-700 border-blue-700">All</Link>
          {categories.map((c) => (
            <Link
              key={c}
              href={`/blog/category/${encodeURIComponent(c)}`}
              className={`rounded-xl px-3 py-1.5 text-sm border ${
                c === category ? "bg-blue-700 text-white border-blue-700" : "text-blue-700 border-blue-700"
              }`}
            >
              {c}
            </Link>
          ))}
        </div>
        <div className="ml-auto flex gap-2">
          <input name="q" defaultValue={q} placeholder={`Search ${category}…`} className="rounded-lg border px-3 py-1.5 text-sm" />
          <button type="submit" className="rounded-lg bg-blue-700 px-3 py-1.5 text-sm font-semibold text-white">Search</button>
        </div>
      </form>

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
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => {
            const query = new URLSearchParams();
            if (q) query.set("q", q);
            query.set("page", String(n));
            return (
              <Link
                key={n}
                href={`/blog/category/${encodeURIComponent(category)}?${query.toString()}`}
                className={`rounded-md px-3 py-1.5 text-sm border ${
                  n === page ? "bg-blue-700 text-white border-blue-700" : "text-blue-700 border-blue-700"
                }`}
              >
                {n}
              </Link>
            );
          })}
        </div>
      )}

      {/* ItemList schema for this category page */}
      {items.length > 0 && (
        <Script
          id="category-itemlist"
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
