import type { Metadata } from "next";
import Link from "next/link";
import FeedLinks from "@/components/seo/FeedLinks";
import { listAuthors, getAuthorPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Authors | Doon Coding Academy",
  description: "Browse blog authors and their contributions.",
  alternates: { canonical: "/blog/author" },
  openGraph: { title: "Authors | Doon Coding Academy", description: "Our blog authors.", url: "/blog/author", type: "website" },
};

export default function AuthorsIndexPage() {
  const authors = listAuthors();
  return (
    <div className="container mx-auto p-4">
      <FeedLinks />
      <nav className="mb-3 text-sm">
        <Link href="/blog" className="text-blue-700 hover:underline">Blog</Link>
        <span> / </span>
        <span className="text-gray-700 font-semibold">Authors</span>
      </nav>

      <h1 className="text-3xl font-bold mb-2">Authors</h1>
      <p className="text-gray-700 mb-6">Meet the people who write our tutorials and guides.</p>

      {authors.length === 0 ? (
        <p className="text-gray-700">No authors yet.</p>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {authors.map((name) => {
            const posts = getAuthorPosts(name);
            return (
              <li key={name} className="border rounded-lg p-4 shadow-sm">
                <h2 className="text-lg font-semibold">
                  <Link href={`/blog/author/${encodeURIComponent(name)}`} className="hover:underline">{name}</Link>
                </h2>
                <p className="text-gray-600 text-sm mt-1">{posts.length} post{posts.length > 1 ? "s" : ""}</p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
