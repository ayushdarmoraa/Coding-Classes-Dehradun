import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { getAllBlogPosts, paginate } from "@/lib/blog";
import PrevNextLinks from "@/components/seo/PrevNextLinks";
import FeedLinks from "@/components/seo/FeedLinks";

export async function generateMetadata({
  searchParams,
}: {
  searchParams?: { q?: string; page?: string };
}): Promise<Metadata> {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  const q = searchParams?.q?.trim();
  const page = Number(searchParams?.page || "1");
  const self = page > 1 ? `${base}/blog/pinned?page=${page}` : `${base}/blog/pinned`;
  const robots = q ? { index: false, follow: true } : undefined;
  return {
    title: "Featured Blog Posts | Doon Coding Academy",
    description: "Editor’s picks: our most useful guides and tutorials.",
    robots,
    alternates: { canonical: self },
    openGraph: { title: "Featured Blog Posts | Doon Coding Academy", description: "Editor’s picks.", url: self, type: "website" },
  };
}

export default function PinnedPostsPage({
  searchParams,
}: {
  searchParams?: { q?: string; page?: string };
}) {
  const q = (searchParams?.q || "").trim().toLowerCase();
  const page = Number(searchParams?.page || "1");

  // Only featured posts
  let posts = getAllBlogPosts().filter((p) => p.featured);

  if (q) {
    posts = posts.filter((p) => {
      const hay = `${p.title} ${p.description} ${(p.keywords || []).join(" ")}`.toLowerCase();
      return hay.includes(q);
    });
  }

  const { items, totalPages } = paginate(posts, page, 9);
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

  const makeUrl = (n: number) => {
    const query = new URLSearchParams();
    if (q) query.set("q", q);
    if (n > 1) query.set("page", String(n));
    const qs = query.toString();
    return qs ? `/blog/pinned?${qs}` : `/blog/pinned`;
  };
  const prevUrl = page > 1 ? makeUrl(page - 1) : undefined;
  const nextUrl = page < totalPages ? makeUrl(page + 1) : undefined;

  // ItemList schema for visible items
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${base}/blog/${p.slug}`,
      name: p.title,
    })),
  };

  return (
    <div className="container mx-auto p-4">
  <FeedLinks />
      <PrevNextLinks prev={prevUrl} next={nextUrl} />
      <nav className="mb-3 text-sm">
        <Link href="/blog" className="text-blue-700 hover:underline">Blog</Link>
        <span> / </span>
        <span className="text-gray-700 font-semibold">Featured</span>
      </nav>

      <h1 className="text-3xl font-bold mb-2">Featured Posts</h1>
      <p className="text-gray-700 mb-6">
        Editor’s picks and evergreen guides we recommend starting with.
      </p>

      {/* Search (server-side) */}
      <form className="mb-6 flex gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search featured…"
          className="rounded-lg border px-3 py-1.5 text-sm flex-1"
        />
        <button
          type="submit"
          className="rounded-lg bg-blue-700 px-3 py-1.5 text-sm font-semibold text-white"
        >
          Search
        </button>
        {q && (
          <Link
            href="/blog/pinned"
            className="rounded-lg border border-blue-700 px-3 py-1.5 text-sm font-semibold text-blue-700"
          >
            Reset
          </Link>
        )}
      </form>

      {items.length === 0 ? (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-900">
          No featured posts found{q ? " for that search." : "."} Tip: mark posts with
          <code className="mx-1 rounded bg-gray-100 px-1.5 py-0.5">featured: true</code> in frontmatter.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((post) => (
            <article key={post.slug} className="border rounded-lg p-4 shadow-sm flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-semibold">
                  <Link href={`/blog/${post.slug}`} className="hover:underline">
                    {post.title}
                  </Link>
                </h2>
                <span className="ml-2 inline-flex items-center rounded-md bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
                  Featured
                </span>
              </div>

              <p className="text-gray-600 text-sm">
                {new Date(post.date).toLocaleDateString()} • {post.readingTime} min read
                {post.authorName ? (
                  <> • By{" "}
                    {post.authorUrl ? (
                      <a className="text-blue-700 hover:underline" href={post.authorUrl}>{post.authorName}</a>
                    ) : (
                      <span className="text-gray-800">{post.authorName}</span>
                    )}
                  </>
                ) : null}
              </p>

              <p className="text-gray-700 mt-2 line-clamp-4">{post.description}</p>

              <div className="mt-3 flex flex-wrap gap-2">
                <Link
                  href={`/blog/category/${encodeURIComponent(post.category)}`}
                  className="rounded-md border px-2 py-1 text-xs text-blue-700 border-blue-700"
                >
                  {post.category}
                </Link>
              </div>

              <Link
                href={`/blog/${post.slug}`}
                className="text-blue-700 hover:underline mt-4 inline-block"
              >
                Read More
              </Link>
            </article>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <Link
              key={n}
              href={`/blog/pinned?page=${n}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
              className={`rounded-md px-3 py-1.5 text-sm border ${
                n === page ? "bg-blue-700 text-white border-blue-700" : "text-blue-700 border-blue-700"
              }`}
            >
              {n}
            </Link>
          ))}
        </div>
      )}

      {/* ItemList schema */}
      <Script
        id="featured-itemlist"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
    </div>
  );
}
