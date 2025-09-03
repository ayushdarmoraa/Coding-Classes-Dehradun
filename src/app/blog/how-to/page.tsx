/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { listHowToPosts, paginate } from "@/lib/blog";
import PrevNextLinks from "@/components/seo/PrevNextLinks";
import FeedLinks from "@/components/seo/FeedLinks";

// dynamic metadata handled via generateMetadata below

export async function generateMetadata({
  searchParams,
}: {
  searchParams?: { q?: string; page?: string };
}): Promise<Metadata> {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  const q = searchParams?.q?.trim();
  const page = Number(searchParams?.page || "1");
  const self = page > 1 ? `${base}/blog/how-to?page=${page}` : `${base}/blog/how-to`;
  const robots = q ? { index: false, follow: true } : undefined;
  return {
    title: "How-To Tutorials | Doon Coding Academy",
    description: "Step-by-step tutorials on Full-Stack, Data Science, Python, and Java.",
    robots,
    alternates: { canonical: self },
    openGraph: { title: "How-To Tutorials | Doon Coding Academy", description: "Hands-on guides.", url: self, type: "website" },
  };
}

export default function HowToIndex({
  searchParams,
}: {
  searchParams?: { q?: string; page?: string };
}) {
  const q = (searchParams?.q || "").trim().toLowerCase();
  const page = Number(searchParams?.page || "1");

  let posts = listHowToPosts();
  if (q) {
    posts = posts.filter((p) => {
      const hay = `${p.title} ${p.description} ${(p.keywords || []).join(" ")} ${(p.howtoTools || []).join(" ")} ${(p.howtoSupplies || []).join(" ")}`.toLowerCase();
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
    return qs ? `/blog/how-to?${qs}` : `/blog/how-to`;
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
      <nav className="mb-3 text-sm">
        <Link href="/blog" className="text-blue-700 hover:underline">Blog</Link>
        <span> / </span>
        <span className="text-gray-700 font-semibold">How-To</span>
      </nav>

      <h1 className="text-3xl font-bold mb-2">How-To Tutorials</h1>
      <p className="text-gray-700 mb-6">
        Step-by-step guides with tools, supplies, time and cost—perfect for beginners and practitioners.
      </p>

      <form className="mb-6 flex gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search How-To…"
          className="rounded-lg border px-3 py-1.5 text-sm flex-1"
          aria-label="Search How-To tutorials"
        />
        <button
          type="submit"
          className="rounded-lg bg-blue-700 px-3 py-1.5 text-sm font-semibold text-white"
        >
          Search
        </button>
        {q && (
          <Link
            href="/blog/how-to"
            className="rounded-lg border border-blue-700 px-3 py-1.5 text-sm font-semibold text-blue-700"
          >
            Reset
          </Link>
        )}
      </form>

      {items.length === 0 ? (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-900">
          No How-To posts found{q ? " for that search." : "."} Add
          <code className="mx-1 rounded bg-gray-100 px-1.5 py-0.5">howtoSteps</code>
          (2+ steps) in frontmatter to include a post here.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((p) => {
            const img = p.image
              ? (p.image.startsWith("http") ? p.image : `${base}${p.image.startsWith("/") ? "" : "/"}${p.image}`)
              : null;
            const stepsCount = (p.howtoSteps || []).length;
            return (
              <article key={p.slug} className="border rounded-lg p-4 shadow-sm flex flex-col">
                <h2 className="text-xl font-semibold mb-1">
                  <Link href={`/blog/${p.slug}`} className="hover:underline">
                    {p.title}
                  </Link>
                </h2>

                <p className="text-gray-600 text-sm">
                  {new Date(p.date).toLocaleDateString()} • {p.readingTime} min read
                  {p.authorName ? (
                    <> • By{" "}
                      {p.authorUrl ? (
                        <a className="text-blue-700 hover:underline" href={p.authorUrl}>{p.authorName}</a>
                      ) : (
                        <span className="text-gray-800">{p.authorName}</span>
                      )}
                    </>
                  ) : null}
                </p>

                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  {stepsCount ? (
                    <span className="rounded-md border px-2 py-1 bg-white">📋 {stepsCount} steps</span>
                  ) : null}
                  {p.howtoTotalTime ? (
                    <span className="rounded-md border px-2 py-1 bg-white">⏱ {p.howtoTotalTime}</span>
                  ) : null}
                  {p.howtoEstimatedCost ? (
                    <span className="rounded-md border px-2 py-1 bg-white">
                      💰 {p.howtoEstimatedCost.value} {p.howtoEstimatedCost.currency}
                    </span>
                  ) : null}
                </div>

                <p className="text-gray-700 mt-2 line-clamp-4">{p.description}</p>

                {img ? (
                  <img
                    src={img}
                    alt={p.imageAlt || p.title}
                    loading="lazy"
                    decoding="async"
                    className="mt-3 w-full h-auto rounded-lg border border-gray-200"
                  />
                ) : null}

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
                  className="text-blue-700 hover:underline mt-4 inline-block"
                >
                  Read Tutorial
                </Link>
              </article>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <Link
              key={n}
              href={`/blog/how-to?page=${n}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
              className={`rounded-md px-3 py-1.5 text-sm border ${
                n === page ? "bg-blue-700 text-white border-blue-700" : "text-blue-700 border-blue-700"
              }`}
            >
              {n}
            </Link>
          ))}
        </div>
      )}

      <Script
        id="howto-itemlist"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
    </div>
  );
}
