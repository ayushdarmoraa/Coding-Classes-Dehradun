import type { MetadataRoute } from 'next'
import { getCourses, isCourseModeAvailable } from '@/lib/courses'
import { getAllBlogPosts, getPostLastModified } from '@/lib/blog'
import { getPublishedChallenges } from '@/lib/lab/challenges'
import { getChallengePath } from '@/lib/lab/challenge-utils'
import { getPublishedProjects, getProjectPath } from '@/lib/projects'
import { hasPublishedOutcomeContent } from '@/lib/outcomes'
import { SITE } from '@/lib/site-config'

const BASE_URL = SITE.url

// If you keep these elsewhere, import instead
const VS_SLUGS = ['coding-ninjas', 'scaler'] as const

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = []
  const now = new Date()

  // --- Static evergreen pages (monthly) ---
  const staticMonthly = [
    '/',
    '/about',
    '/courses',
    '/online-courses',
    '/lab',
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

  if (hasPublishedOutcomeContent()) {
    entries.push({
      url: `${BASE_URL}/outcomes`,
      changeFrequency: 'monthly',
      priority: 0.7,
    })
  }

  const projects = getPublishedProjects()
  if (projects.length > 0) {
    entries.push({
      url: `${BASE_URL}/projects`,
      changeFrequency: 'monthly',
      priority: 0.7,
    })
  }

  // --- Blog index (weekly) ---

  // --- Locations index + city landers (online-only cities) ---
  entries.push({
    url: `${BASE_URL}/locations`,
    changeFrequency: 'monthly',
    priority: 0.7,
    lastModified: now,
  })
  for (const slug of ['noida', 'bangalore', 'mumbai']) {
    entries.push({
      url: `${BASE_URL}/locations/${slug}`,
      changeFrequency: 'monthly',
      priority: 0.7,
      lastModified: now,
    })
  }

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

  // --- Online courses (only when the canonical record confirms online delivery) ---
  const courses = await getCourses()
  for (const c of courses) {
    if (!isCourseModeAvailable(c, 'Online')) continue
    entries.push({
      url: `${BASE_URL}/online-courses/${c.slug}`,
      // Fallback lastModified: omit or use new Date() if you prefer freshness signals
      // lastModified: new Date(),
      priority: 0.9,
    })
  }

  for (const challenge of getPublishedChallenges()) {
    entries.push({
      url: `${BASE_URL}${getChallengePath(challenge)}`,
      changeFrequency: 'monthly',
      priority: 0.7,
    })
  }

  for (const project of projects) {
    entries.push({
      url: `${BASE_URL}${getProjectPath(project)}`,
      changeFrequency: 'monthly',
      priority: 0.7,
    })
  }

  // --- Offline (on-campus) course detail pages /courses/[slug] ---
  for (const c of courses) {
    if (!isCourseModeAvailable(c, 'On-Campus')) continue
    entries.push({
      url: `${BASE_URL}/courses/${c.slug}`,
      lastModified: now,
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
