import { getAllBlogPosts } from "@/lib/blog";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
  description: "Stay updated with the latest in coding, technology, and our academy news.",
};

export default function BlogPage() {
  const posts = getAllBlogPosts();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Our Blog</h1>
      {posts.length === 0 ? (
        <p className="text-lg text-gray-700">No blog posts yet. Coming soon!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <div key={post.slug} className="border rounded-lg p-4 shadow-sm flex flex-col">
              <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
              <p className="text-gray-600 text-sm mb-3">{new Date(post.date).toLocaleDateString()}</p>
              <p className="text-gray-700 flex-grow">{post.description}</p>
              <Link href={`/blog/${post.slug}`} className="text-blue-600 hover:underline mt-4 inline-block">
                Read More
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


