/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

import {
  filterPosts,
  listCategories,
  paginate,
  getAllBlogPosts,
  listHowToPosts,
} from "@/lib/blog";
import PrevNextLinks from "@/components/seo/PrevNextLinks";
import FeedLinks from "@/components/seo/FeedLinks";
import { SITE } from "@/lib/site-config";

const BASE = SITE.url;

export async function generateMetadata({
  searchParams,
}: {
  searchParams?: { q?: string; page?: string; category?: string };
}): Promise<Metadata> {

  // Normalize base; prefer https even if env was set to http

  const q = searchParams?.q?.trim();
  const page = Number(searchParams?.page || "1");


  // If there's a search query, keep listing pages out of the index
  const robots = q ? { index: false, follow: true } : undefined;

  return {
    // Title will get " | Doon Coding Academy" appended by layout.tsx template
    title: page > 1
      ? `Coding Guides & Learning Resources (Page ${page})`
      : "Coding Guides & Learning Resources",
    description: "Beginner-friendly, practical, and useful resources to help you learn clearly.",
    robots,
  // Canonical: /blog (search) OR /blog?page=n (pagination) OR /blog (page 1)
  // Per repo guardrails, prefer relative canonical hints; metadataBase in layout handles host
  alternates: { canonical: "/blog" },
    openGraph: {
      title: "Coding Guides & Learning Resources",
      description: "Beginner-friendly, practical, and useful resources to help you learn clearly.",
      url: BASE + "/blog",
      type: "website",
      siteName: "Doon Coding Academy"
    },
    twitter: {
      card: "summary",
      title: "Coding Guides & Learning Resources",
      description: "Beginner-friendly, practical, and useful resources to help you learn clearly."
    }
  }
  }
  export default function BlogPage({ searchParams }: { searchParams?: { category?: string; q?: string; page?: string } }) {

  const category = searchParams?.category || "";
  const q = searchParams?.q || "";
  const page = Number(searchParams?.page || "1");

  const categories = listCategories();
  const hasHowToGuides = listHowToPosts().length > 0;
  const base = SITE.url;

  // Featured posts from frontmatter
  const all = getAllBlogPosts();
  const featured = all.filter((p) => p.featured);

  // Exclude featured from page 1 default view grid to avoid duplication
  const isDefaultView = !category && !q && page === 1;
  const filtered = filterPosts({ category, q });
  // Show all filtered posts in the grid (do not exclude featured from page 1)
  const visibleList = filtered;

  const { items, totalPages } = paginate(visibleList, page, 6);

  // Helpers
  const fmtDate = (iso?: string) => {
    if (!iso) return null;
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? null : d.toLocaleDateString("en-IN");
  };
  const fallbackDesc = (title?: string) => {
    const t = (title || "").trim();
    if (!t) return undefined;
    const base = `${t} — insights from Doon Coding Academy (Dehradun).`;
    const v = base;
    return v.length > 160 ? v.slice(0, 157) + "…" : v;
  };

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

  // Breadcrumb JSON-LD for SEO
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
        item: { "@type": "WebPage", "@id": `${base}/blog`, name: "Guides" },
      },
    ],
  } as const;

  return (
    <div className="container mx-auto p-4">
      <FeedLinks />
      <PrevNextLinks prev={prevUrl} next={nextUrl} />
      <h1 className="text-3xl font-bold mb-2">Guides for Coding Learners</h1>
      <p className="mb-6 max-w-3xl text-gray-700">
        Beginner-friendly, practical, and useful resources to help you learn clearly.
      </p>
      <div className="mb-4 flex gap-4">
        <Link href="/blog/archive" className="text-blue-700 hover:underline text-sm">
          Browse by date →
        </Link>
        <Link href="/blog/pinned" className="text-blue-700 hover:underline text-sm">
          Featured guides →
        </Link>
        {hasHowToGuides ? (
          <Link href="/blog/how-to" className="text-blue-700 hover:underline text-sm">
            Step-by-step guides →
          </Link>
        ) : null}
        <Link href="/blog/series" className="text-blue-700 hover:underline text-sm">
          Guide series →
        </Link>
        <Link href="/blog/author" className="text-blue-700 hover:underline text-sm">
          Guide authors →
        </Link>
      </div>

      {/* Featured strip (only on default view + if we have featured) */}
      {isDefaultView && featured.length > 0 && (
        <section aria-label="Featured posts" className="mb-8 defer-visibility">
          <div className="mb-2 flex items-center gap-2">
            <h2 className="text-xl font-semibold">Featured guides</h2>
            <span className="text-xs text-gray-500">Editor’s picks</span>
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
                            alt={p.imageAlt || `${p.title} — Doon Coding Academy, Dehradun`}
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
                          {(() => {
                            const ds = fmtDate(p.date);
                            const lm = p.lastModified ? new Date(p.lastModified) : null;
                            const ld = lm && !Number.isNaN(lm.getTime()) ? lm : null;
                            const showUpdated = ld && p.date && ld.getTime() > new Date(p.date).getTime();
                            const updatedStr = showUpdated ? ` • Updated ${fmtDate(ld!.toISOString())}` : "";
                            const dateStr = ds ? ds : "";
                            return `${dateStr}${updatedStr} • ${p.readingTime} min read`;
                          })()}
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
                          {p.category && p.category.trim().length > 0 ? (
                            <Link
                              href={`/blog/category/${encodeURIComponent(p.category)}`}
                              className="rounded-md border px-2 py-1 text-xs text-blue-700 border-blue-700"
                            >
                              {p.category}
                            </Link>
                          ) : null}
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
            placeholder="Search Guides…"
            className="rounded-lg border px-3 py-1.5 text-sm"
            aria-label="Search Guides"
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 defer-visibility">
          {items.map((post) => (
            <article key={post.slug} className="border rounded-lg p-4 shadow-sm flex flex-col">
              {post.image ? (
                <div className="relative mb-3 -mx-4 -mt-4 h-40">
                  <Image
                    src={post.image}
                    alt={post.imageAlt || post.title || post.slug}
                    fill
                    sizes="(max-width: 768px) 100vw, 400px"
                    className="object-cover rounded-t-lg"
                  />
                </div>
              ) : null}
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-semibold">
                  <Link href={`/blog/${post.slug}`} className="hover:underline">
                    {(post.title || post.slug).trim()}
                  </Link>
                </h2>
                {post.featured && (
                  <span className="ml-2 inline-flex items-center rounded-md bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
                    Featured
                  </span>
                )}
              </div>
              <p className="text-gray-600 text-sm">
                {(() => {
                  const ds = fmtDate(post.date);
                  const lm = post.lastModified ? new Date(post.lastModified) : null;
                  const ld = lm && !Number.isNaN(lm.getTime()) ? lm : null;
                  const showUpdated = ld && post.date && ld.getTime() > new Date(post.date).getTime();
                  const updatedStr = showUpdated ? ` • Updated ${fmtDate(ld!.toISOString())}` : "";
                  const dateStr = ds ? ds : "";
                  return `${dateStr}${updatedStr} • ${post.readingTime} min read`;
                })()}
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
              {(() => {
                const desc = (post.description || "").trim() || fallbackDesc(post.title);
                return desc ? (
                  <p className="text-gray-700 mt-2 line-clamp-4">{desc}</p>
                ) : null;
              })()}
              <div className="mt-3 flex flex-wrap gap-2">
                {post.category && post.category.trim().length > 0 ? (
                  <Link
                    href={`/blog/category/${encodeURIComponent(post.category)}`}
                    className="rounded-md border px-2 py-1 text-xs text-blue-700 border-blue-700"
                  >
                    {post.category}
                  </Link>
                ) : null}
              </div>
              <Link
                href={`/blog/${post.slug}`}
                className="text-blue-700 hover:underline mt-4 inline-block"
              >
                Read guide
              </Link>
            </article>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-2 defer-visibility">
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
      <script
        id="blog-breadcrumb"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        id="blog-itemlist"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
    </div>
  );
}
