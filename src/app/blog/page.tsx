/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Script from "next/script";
import Link from "next/link";
import Image from "next/image";
import {
  filterPosts,
  listCategories,
  paginate,
  getAllBlogPosts,
} from "@/lib/blog";
import PrevNextLinks from "@/components/seo/PrevNextLinks";
import FeedLinks from "@/components/seo/FeedLinks";

export async function generateMetadata({
  searchParams,
}: {
  searchParams?: { q?: string; page?: string; category?: string };
}): Promise<Metadata> {
  // Normalize base; prefer https even if env was set to http
  const rawBase = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  const base = rawBase.replace(/^http:\/\//, "https://");

  const q = searchParams?.q?.trim();
  const page = Number(searchParams?.page || "1");
  const self = page > 1 ? `${base}/blog?page=${page}` : `${base}/blog`;
  // For search pages, force canonical to /blog (don’t include ?q= or ?page=)
  const canonical = q ? `${base}/blog` : self;

  // If there's a search query, keep listing pages out of the index
  const robots = q ? { index: false, follow: true } : undefined;

  return {
    // Title will get " | Doon Coding Academy" appended by layout.tsx template
    title: page > 1
      ? `Coding & Career Guides (Page ${page}) – Dehradun 2025`
      : "Coding & Career Guides – Dehradun 2025",
    description:
      "In-depth guides for Dehradun students: Full-Stack (Gen AI), Data Science, Python & Java—fees, syllabus, placements, roadmaps, and tutorials.",
    robots,
  // Canonical: /blog (search) OR /blog?page=n (pagination) OR /blog (page 1)
  alternates: { canonical },
    openGraph: {
      title: "Blog – Coding & Career Guides (Dehradun)",
      description:
        "Guides on Full-Stack (Gen AI), Data Science, Python & Java: fees, syllabus, placements, roadmaps, tutorials.",
  url: canonical,
      type: "website",
      siteName: "Doon Coding Academy",
    },
    twitter: {
      card: "summary",
      title: "Blog – Coding & Career Guides (Dehradun)",
      description:
        "Full-Stack (Gen AI), Data Science, Python & Java guides: fees, syllabus, placements, roadmaps, tutorials.",
    },
  };
}
export default function BlogPage({
  searchParams,
}: {
  searchParams?: { category?: string; q?: string; page?: string };
}) {
  const category = searchParams?.category || "";
  const q = searchParams?.q || "";
  const page = Number(searchParams?.page || "1");

  const categories = listCategories();
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

  // Featured posts from frontmatter
  const all = getAllBlogPosts();
  const featured = all.filter((p) => p.featured);

  // Exclude featured from page 1 default view grid to avoid duplication
  const isDefaultView = !category && !q && page === 1;
  const filtered = filterPosts({ category, q });
  const visibleList = isDefaultView && featured.length
    ? filtered.filter((p) => !p.featured)
    : filtered;

  const { items, totalPages } = paginate(visibleList, page, 6);

  // prev/next rel URLs
  const makeUrl = (n: number) => {
    const query = new URLSearchParams();
    if (category) query.set("category", category);
    if (q) query.set("q", q);
    if (n > 1) query.set("page", String(n));
    const qs = query.toString();
    return qs ? `/blog?${qs}` : `/blog`;
  };
  const prevUrl = page > 1 ? makeUrl(page - 1) : undefined;
  const nextUrl = page < totalPages ? makeUrl(page + 1) : undefined;

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
      <h1 className="text-3xl font-bold mb-2">Our Blog</h1>
      <div className="mb-4 flex gap-4">
        <Link href="/blog/archive" className="text-blue-700 hover:underline text-sm">
          Browse the archive →
        </Link>
        <Link href="/blog/pinned" className="text-blue-700 hover:underline text-sm">
          Featured posts →
        </Link>
        <Link href="/blog/how-to" className="text-blue-700 hover:underline text-sm">
          How-To tutorials →
        </Link>
        <Link href="/blog/series" className="text-blue-700 hover:underline text-sm">
          Series →
        </Link>
        <Link href="/blog/author" className="text-blue-700 hover:underline text-sm">
          Authors →
        </Link>
      </div>

      {/* Featured strip (only on default view + if we have featured) */}
      {isDefaultView && featured.length > 0 && (
        <section aria-label="Featured posts" className="mb-8">
    const breadcrumbJsonLd = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "@id": `${base}/blog#breadcrumb`,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          item: { "@type": "WebPage", "@id": `${base}/`, name: "Home" },
        },
        {
          "@type": "ListItem",
          position: 2,
          item: { "@type": "WebPage", "@id": `${base}/blog`, name: "Blog" },
        },
      ],
    } as const;
          <div className="mb-2 flex items-center gap-2">
            <h2 className="text-xl font-semibold">Featured</h2>
            <span className="text-xs text-gray-500">Editor’s picks</span>
        {/* eslint-disable-next-line react/no-danger */}
        <Script
          id="blog-breadcrumb"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
          </div>

          <div className="-mx-4 px-4 overflow-x-auto">
            <ul className="flex gap-4 min-w-full snap-x">
              {featured.slice(0, 6).map((p) => {
                // Use the frontmatter path as-is (e.g., "/images/..."), no absolute prefixing
                const img = p.image || undefined;
                return (
                  <li key={p.slug} className="w-80 shrink-0 snap-start">
                    <article className="h-full border rounded-2xl overflow-hidden bg-white shadow-sm flex flex-col">
                      {img ? (
                        <div className="relative h-44">
                          <Image
                            src={img}
                            alt={p.imageAlt || p.title}
                            fill
                            sizes="(max-width: 768px) 100vw, 400px"
                            className="object-cover"
                          />
                          <span className="absolute left-2 top-2 inline-flex items-center rounded-md bg-yellow-100/95 px-2 py-0.5 text-xs font-medium text-yellow-800">
                            Featured
                          </span>
                        </div>
                      ) : (
                        <div className="h-44 bg-gradient-to-br from-blue-50 to-blue-100 relative">
                          <span className="absolute left-2 top-2 inline-flex items-center rounded-md bg-yellow-100/95 px-2 py-0.5 text-xs font-medium text-yellow-800">
                            Featured
                          </span>
                        </div>
                      )}

                      <div className="p-4 flex flex-col">
                        <h3 className="text-lg font-semibold leading-snug">
                          <Link href={`/blog/${p.slug}`} className="hover:underline">
                            {p.title}
                          </Link>
                        </h3>
                        <p className="text-gray-600 text-sm mt-1">
                          {new Date(p.date).toLocaleDateString()} • {p.readingTime} min read
                          {p.authorName ? (
                            <>
                              {" "}• By{" "}
                              {p.authorUrl ? (
                                <a href={p.authorUrl} className="text-blue-700 hover:underline">{p.authorName}</a>
                              ) : (
                                <span className="text-gray-800">{p.authorName}</span>
                              )}
                            </>
                          ) : null}
                        </p>
                        <p className="text-gray-700 mt-2 line-clamp-3">{p.description}</p>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <Link
                            href={`/blog/category/${encodeURIComponent(p.category)}`}
                            className="rounded-md border px-2 py-1 text-xs text-blue-700 border-blue-700"
                          >
                            {p.category}
                          </Link>
                        </div>

                        <Link
                          href={`/blog/${p.slug}`}
                          className="mt-3 inline-block text-blue-700 hover:underline"
                        >
                          Read More
                        </Link>
                      </div>
                    </article>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      )}

      {/* Filters/Search (server-side, no JS) */}
      <form className="mb-6 flex flex-wrap gap-3 items-center">
        <div className="flex flex-wrap gap-2">
          <Link
            href="/blog"
            className={`rounded-xl px-3 py-1.5 text-sm border ${
              !category ? "bg-blue-700 text-white border-blue-700" : "text-blue-700 border-blue-700"
            }`}
          >
            All
          </Link>
          {categories.map((c) => (
            <Link
              key={c}
              href={`/blog/category/${encodeURIComponent(c)}`}
              className={`rounded-xl px-3 py-1.5 text-sm border ${
                category === c
                  ? "bg-blue-700 text-white border-blue-700"
                  : "text-blue-700 border-blue-700"
              }`}
            >
              {c}
            </Link>
          ))}
        </div>

        <div className="ml-auto flex gap-2">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search posts…"
            className="rounded-lg border px-3 py-1.5 text-sm"
          />
          <button
            type="submit"
            className="rounded-lg bg-blue-700 px-3 py-1.5 text-sm font-semibold text-white"
          >
            Search
          </button>
        </div>
      </form>

      {items.length === 0 ? (
        <p className="text-lg text-gray-700">No posts found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((post) => (
            <article key={post.slug} className="border rounded-lg p-4 shadow-sm flex flex-col">
              {post.image ? (
                <div className="relative mb-3 -mx-4 -mt-4 h-40">
                  <Image
                    src={post.image}
                    alt={post.imageAlt || post.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 400px"
                    className="object-cover rounded-t-lg"
                  />
                </div>
              ) : null}
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-semibold">
                  <Link href={`/blog/${post.slug}`} className="hover:underline">
                    {post.title}
                  </Link>
                </h2>
                {post.featured && (
                  <span className="ml-2 inline-flex items-center rounded-md bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
                    Featured
                  </span>
                )}
              </div>
              <p className="text-gray-600 text-sm">
                {new Date(post.date).toLocaleDateString()} • {post.readingTime} min read
                {post.authorName ? (
                  <>
                    {" "}• By{" "}
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
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => {
            const query = new URLSearchParams();
            if (category) query.set("category", category);
            if (q) query.set("q", q);
            query.set("page", String(n));
            return (
              <Link
                key={n}
                href={`/blog?${query.toString()}`}
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
      {/* ItemList schema for this page */}
      <Script
        id="blog-itemlist"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
    </div>
  );
}


