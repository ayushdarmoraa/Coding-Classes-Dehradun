import type { MetadataRoute } from "next";
import { getCourses } from "@/lib/courses";

export default function sitemap(): MetadataRoute.Sitemap {
  const base =
    (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${base}/`,           lastModified: new Date(), changeFrequency: "weekly",  priority: 1 },
    { url: `${base}/about`,      lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/courses`,    lastModified: new Date(), changeFrequency: "weekly",  priority: 0.9 },
    { url: `${base}/contact`,    lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/testimonials`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ];

  const coursePages: MetadataRoute.Sitemap = getCourses().map((c) => ({
    url: `${base}/courses/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticPages, ...coursePages];
}
