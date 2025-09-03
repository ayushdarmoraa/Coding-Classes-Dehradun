import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import FeedLinks from "@/components/seo/FeedLinks";
import { getAuthorPosts, listAuthors } from "@/lib/blog";

type Params = { name: string };

export function generateStaticParams() {
  return listAuthors().map((n) => ({ name: encodeURIComponent(n) }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const name = decodeURIComponent(params.name);
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  const url = `${base}/blog/author/${encodeURIComponent(name)}`;
  return {
    title: `${name} (Author) | Doon Coding Academy`,
    description: `Posts written by ${name}.`,
    alternates: { canonical: url },
    openGraph: { title: `${name} (Author) | Doon Coding Academy`, description: `Articles by ${name}.`, url, type: "website" },
  };
}

export default function AuthorPage({ params }: { params: Params }) {
  const name = decodeURIComponent(params.name);
  const posts = getAuthorPosts(name);
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
        <Link href="/blog/author" className="text-blue-700 hover:underline">Authors</Link>
        <span> / </span>
        <span className="text-gray-700 font-semibold">{name}</span>
      </nav>

      <h1 className="text-3xl font-bold mb-2">{name}</h1>
      <p className="text-gray-700 mb-6">Articles by {name}.</p>

      {posts.length === 0 ? (
        <p className="text-gray-700">No posts yet.</p>
      ) : (
        <ul className="space-y-3">
          {posts.map((p) => (
            <li key={p.slug} className="border rounded-lg p-4">
              <h2 className="text-lg font-semibold">
                <Link href={`/blog/${p.slug}`} className="hover:underline">{p.title}</Link>
              </h2>
              <p className="text-gray-600 text-sm mt-1">{new Date(p.date).toLocaleDateString()} • {p.readingTime} min read</p>
              <p className="text-gray-700 mt-1 line-clamp-3">{p.description}</p>
            </li>
          ))}
        </ul>
      )}

      <Script
        id="author-itemlist"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
    </div>
  );
}
