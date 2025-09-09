import type { MetadataRoute } from 'next'
import { getCourses } from '@/lib/courses'
import { getAllBlogPosts, getPostLastModified } from '@/lib/blog'

const BASE_URL = 'https://dooncodingacademy.in'

// If you keep these elsewhere, import instead
const VS_SLUGS = ['coding-ninjas', 'scaler'] as const
const ONLINE_COURSE_SLUGS = new Set(['full-stack', 'data-science', 'python', 'java'])

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = []

  // --- Static evergreen pages (monthly) ---
  const staticMonthly = [
    '/',
    '/about',
    '/courses',
    '/online-courses',
    '/faq',
    '/contact',
    '/testimonials',
    '/locations/dehradun',
  ]
  for (const path of staticMonthly) {
    entries.push({
      url: `${BASE_URL}${path === '/' ? '/' : path}`,
      changeFrequency: path === '/blog' ? 'weekly' : 'monthly',
      priority:
        path === '/' ? 1.0
        : path === '/courses' || path === '/online-courses' ? 0.9
        : path.startsWith('/locations') ? 0.8
        : 0.7,
      // Optional: omit lastModified for static pages or use a build-time value if you have one
    })
  }

  // --- Blog index (weekly) ---
  entries.push({
    url: `${BASE_URL}/blog`,
    changeFrequency: 'weekly',
    priority: 0.7,
  })

  // --- Blog posts (programmatic + lastModified via fs.stat) ---
  const posts = await getAllBlogPosts() // already excludes drafts per your filter
  for (const post of posts) {
    const slug = post.slug // derived from filename in lib/blog
    const lm =
      (await getPostLastModified(slug)) ||
      post.lastModified ||
      post.date // ISO string from front matter
    entries.push({
      url: `${BASE_URL}/blog/${slug}`,
      lastModified: lm ? new Date(lm) : undefined,
      // Priority per contract
      priority: 0.7,
    })
  }

  // --- Online courses (programmatic; limited to the 4 online slugs) ---
  const courses = await getCourses()
  for (const c of courses) {
    if (!ONLINE_COURSE_SLUGS.has(c.slug)) continue
    entries.push({
      url: `${BASE_URL}/online-courses/${c.slug}`,
      // Fallback lastModified: omit or use new Date() if you prefer freshness signals
      // lastModified: new Date(),
      priority: 0.9,
    })
  }

  // --- VS pages (small inline array) ---
  for (const v of VS_SLUGS) {
    entries.push({
      url: `${BASE_URL}/vs/${v}`,
      // lastModified: new Date(),
      priority: 0.8,
    })
  }

  return entries
}


