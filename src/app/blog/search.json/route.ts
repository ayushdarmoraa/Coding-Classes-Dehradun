import { NextResponse } from "next/server";
import { getAllBlogPosts } from "@/lib/blog";

export const revalidate = 300; // 5 min
export const dynamic = "force-static";

function pick<T extends object>(o: T, keys: (keyof T)[]) {
  const out: Partial<T> = {};
  keys.forEach((k) => (out[k] = o[k]));
  return out;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") || "").toLowerCase().trim();
  const category = (url.searchParams.get("category") || "").toLowerCase().trim();
  const tag = (url.searchParams.get("tag") || "").toLowerCase().trim();

  let posts = getAllBlogPosts();

  if (category) {
    posts = posts.filter((p) => p.category?.toLowerCase() === category);
  }

  if (tag) {
    posts = posts.filter((p) => (p.keywords || []).some((k) => k.toLowerCase() === tag));
  }

  if (q) {
    posts = posts.filter((p) => {
      const hay = `${p.title} ${p.description} ${(p.keywords || []).join(" ")}`.toLowerCase();
      return hay.includes(q);
    });
  }

  // Sort newest first
  posts.sort((a, b) => +new Date(b.date) - +new Date(a.date));

  const base = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  const body = posts.slice(0, 25).map((p) => ({
    ...pick(p, ["slug", "title", "description", "date", "category", "keywords", "readingTime"]),
    url: `${base}/blog/${p.slug}`,
  }));

  return NextResponse.json(
    { results: body, count: body.length },
  { headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=600", "X-Robots-Tag": "noindex, nofollow" } }
  );
}
