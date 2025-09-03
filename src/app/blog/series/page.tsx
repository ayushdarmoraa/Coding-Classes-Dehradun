import type { Metadata } from "next";
import Link from "next/link";
import FeedLinks from "@/components/seo/FeedLinks";
import { listSeries, getSeriesPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog Series | Doon Coding Academy",
  description: "Explore our multi-part series: MERN, Data Science, Python, Java, and more.",
  alternates: { canonical: "/blog/series" },
  openGraph: {
    title: "Blog Series | Doon Coding Academy",
    description: "Browse our multi-part tutorials.",
    url: "/blog/series",
    type: "website",
  },
};

export default function SeriesIndexPage() {
  const series = listSeries();
  return (
    <div className="container mx-auto p-4">
  <FeedLinks />
      <nav className="mb-3 text-sm">
        <Link href="/blog" className="text-blue-700 hover:underline">Blog</Link>
        <span> / </span>
        <span className="text-gray-700 font-semibold">Series</span>
      </nav>

      <h1 className="text-3xl font-bold mb-2">Blog Series</h1>
      <p className="text-gray-700 mb-6">Deep-dive, multi-part tutorials to level up faster.</p>

      {series.length === 0 ? (
        <p className="text-gray-700">No series yet.</p>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {series.map((name) => {
            const posts = getSeriesPosts(name);
            return (
              <li key={name} className="border rounded-lg p-4 shadow-sm">
                <h2 className="text-xl font-semibold">
                  <Link href={`/blog/series/${encodeURIComponent(name)}`} className="hover:underline">
                    {name}
                  </Link>
                </h2>
                <p className="text-gray-600 text-sm mt-1">{posts.length} part{posts.length > 1 ? "s" : ""}</p>
                <ol className="mt-3 list-decimal ml-5 space-y-1 text-sm">
                  {posts.slice(0, 4).map((p) => (
                    <li key={p.slug}>
                      <Link href={`/blog/${p.slug}`} className="text-blue-700 hover:underline">
                        {p.title}
                      </Link>
                    </li>
                  ))}
                </ol>
                {posts.length > 4 ? (
                  <Link href={`/blog/series/${encodeURIComponent(name)}`} className="text-blue-700 hover:underline text-sm mt-2 inline-block">
                    View all →
                  </Link>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
