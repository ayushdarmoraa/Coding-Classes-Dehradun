import type { MetadataRoute } from "next";
import { getCourses } from "@/lib/courses";
import { getAllBlogPosts, getPostLastModified, listCategories, listTags, listSeries, listAuthors } from "@/lib/blog";

export default function sitemap(): MetadataRoute.Sitemap {
  const raw = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  const base = raw.replace(/^http:\/\//, "https://"); // normalize to https

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${base}/`,           lastModified: new Date(), changeFrequency: "weekly",  priority: 1 },
    { url: `${base}/about`,      lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/courses`,    lastModified: new Date(), changeFrequency: "weekly",  priority: 0.9 },
  { url: `${base}/online-courses`, lastModified: new Date(), changeFrequency: "weekly",  priority: 0.85 },
  { url: `${base}/online-courses/data-science`, lastModified: new Date(), changeFrequency: "weekly",  priority: 0.85 },
  { url: `${base}/online-courses/python`, lastModified: new Date(), changeFrequency: "weekly",  priority: 0.85 },
  { url: `${base}/online-courses/java`, lastModified: new Date(), changeFrequency: "weekly",  priority: 0.85 },
  { url: `${base}/online-courses/full-stack`, lastModified: new Date(), changeFrequency: "weekly",  priority: 0.85 },
    { url: `${base}/contact`,    lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
  { url: `${base}/locations/dehradun`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/testimonials`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  { url: `${base}/blog`, lastModified: new Date(), changeFrequency: "daily", priority: 0.7 },
  { url: `${base}/blog/pinned`, lastModified: new Date(), changeFrequency: "daily", priority: 0.6 },
    { url: `${base}/blog/how-to`, lastModified: new Date(), changeFrequency: "daily", priority: 0.6 },
    { url: `${base}/blog/series`, lastModified: new Date(), changeFrequency: "daily", priority: 0.6 },
    { url: `${base}/blog/archive`, lastModified: new Date(), changeFrequency: "daily", priority: 0.6 },
    { url: `${base}/faq`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/vs/coding-ninjas`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/vs/scaler`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
  ];

  const coursePages: MetadataRoute.Sitemap = getCourses().map((c) => ({
    url: `${base}/courses/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const blogPages: MetadataRoute.Sitemap = getAllBlogPosts()
    .filter(post => !post.slug.startsWith(".") && !post.noindex)
    .map((post) => {
      const lm = getPostLastModified(post.slug);
      return {
        url: `${base}/blog/${post.slug}`,
        lastModified: lm ? new Date(lm) : new Date(post.date),
        changeFrequency: "monthly",
        priority: 0.6,
      };
    });

  const categoryPages: MetadataRoute.Sitemap = listCategories().map((c) => ({
    url: `${base}/blog/category/${encodeURIComponent(c)}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const tagPages: MetadataRoute.Sitemap = listTags().map((t) => ({
    url: `${base}/blog/tag/${encodeURIComponent(t)}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.5,
  }));

  const seriesPages: MetadataRoute.Sitemap = listSeries().map((s) => ({
    url: `${base}/blog/series/${encodeURIComponent(s)}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.55,
  }));

  const authorPages: MetadataRoute.Sitemap = listAuthors().map((a) => ({
    url: `${base}/blog/author/${encodeURIComponent(a)}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.5,
  }));

  return [...staticPages, ...coursePages, ...blogPages, ...categoryPages, ...tagPages, ...seriesPages, ...authorPages];
}


