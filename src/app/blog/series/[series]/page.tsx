import type { Metadata } from "next";
import Link from "next/link";
import FeedLinks from "@/components/seo/FeedLinks";
import Script from "next/script";
import { getSeriesPosts, listSeries } from "@/lib/blog";

type Params = { series: string };

export function generateStaticParams() {
  return listSeries().map((s) => ({ series: encodeURIComponent(s) }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const series = decodeURIComponent(params.series);
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  const url = `${base}/blog/series/${encodeURIComponent(series)}`;
  return {
    title: `${series} (Series) | Doon Coding Academy`,
    description: `All parts in the "${series}" blog series.`,
    alternates: { canonical: url },
    openGraph: { title: `${series} (Series) | Doon Coding Academy`, description: `Read the "${series}" series.`, url, type: "website" },
  };
}

export default function SeriesPage({ params }: { params: Params }) {
  const series = decodeURIComponent(params.series);
  const posts = getSeriesPosts(series);
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: posts.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${base}/blog/${p.slug}`,
      name: p.title,
    })),
  };

  return (
    <div className="container mx-auto p-4">
  <FeedLinks />
      <nav className="mb-3 text-sm">
        <Link href="/blog" className="text-blue-700 hover:underline">Blog</Link>
        <span> / </span>
        <Link href="/blog/series" className="text-blue-700 hover:underline">Series</Link>
        <span> / </span>
        <span className="text-gray-700 font-semibold">{series}</span>
      </nav>

      <h1 className="text-3xl font-bold mb-2">{series}</h1>
      <p className="text-gray-700 mb-6">All parts in order.</p>

      {posts.length === 0 ? (
        <p className="text-gray-700">No posts yet.</p>
      ) : (
        <ol className="space-y-3 list-decimal ml-5">
          {posts.map((p, i) => (
            <li key={p.slug} className="rounded-2xl bg-gray-50 ring-1 ring-gray-200 p-4">
              <h2 className="text-lg font-semibold">
                <Link href={`/blog/${p.slug}`} className="hover:underline">
                  {p.title}
                </Link>
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                Part {i + 1} • {new Date(p.date).toLocaleDateString()} • {p.readingTime} min read
              </p>
              <p className="text-gray-700 mt-1 line-clamp-3">{p.description}</p>
            </li>
          ))}
        </ol>
      )}

      <Script
        id="series-itemlist"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
    </div>
  );
}
