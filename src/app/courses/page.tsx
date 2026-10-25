/* eslint-disable @next/next/no-html-link-for-pages */
// src/app/courses/page.tsx

import type { Metadata } from "next";
import { getCourses } from "@/lib/courses";
import CourseCard from "@/components/features/CourseCard";
import LearningProgressionNote from "@/components/features/LearningProgressionNote";
import Link from "next/link";
import CourseSnapshotMobile from "@/components/features/CourseSnapshotMobile";
import { formatCourseDuration, formatCourseModes, formatCoursePrice } from "@/lib/pricing";
import { SITE } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Courses | Doon Coding Academy",
  description:
    "Explore coding, data science, Python, and Java courses at Doon Coding Academy in Dehradun. Compare curriculum, duration, and fees.",
  alternates: { canonical: `${SITE.url}/courses` },
  openGraph: {
    title: "Courses | Doon Coding Academy",
    description:
      "Browse Full-Stack, Data Science, Python, and Java courses in Dehradun. See curriculum, duration, and fees.",
    url: `${SITE.url}/courses`,
    type: "website",
    siteName: "Doon Coding Academy",
  },
  twitter: {
    card: "summary",
    title: "Courses | Doon Coding Academy",
    description:
      "All coding, data science, and programming courses at Doon Coding Academy, Dehradun. Compare curriculum, fees, and outcomes.",
  },
};



export default function CoursesPage() {
  const courses = getCourses();

  // Feature a couple up top
  const featuredSlugs = new Set(["full-stack", "data-science"]);
  const featured = courses.filter((c) => featuredSlugs.has(c.slug));

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${SITE.url}/courses#breadcrumb`,
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        item: { "@type": "WebPage", "@id": `${SITE.url}/`, name: "Home" },
      },
      {
        "@type": "ListItem",
        position: 2,
        item: { "@type": "WebPage", "@id": `${SITE.url}/courses`, name: "Courses" },
      },
    ],
  } as const;

  return (
    <main className="min-h-screen bg-gray-50" id="top">
      {/* Breadcrumb JSON-LD */}
      <script
        id="courses-breadcrumb"
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <h1 className="mt-8 text-3xl font-bold text-gray-900">Explore Coding Courses</h1>
      <p className="mt-2 max-w-2xl text-gray-700">
        Compare course options, curriculum, duration, and fees to find a program that fits your goals.
      </p>
      <p className="mt-2 text-sm text-gray-600">
        Need city / online context? Visit our{' '}
        <Link href="/locations" className="text-blue-700 hover:underline">Locations</Link> page.
      </p>
      <LearningProgressionNote className="mt-3 max-w-3xl text-gray-600" />

          {/* Filters / Sort (anchor-only) */}
          <div className="mt-6">
            <div className="rounded-2xl bg-gray-50 ring-1 ring-gray-200 p-3 md:p-4">
              <div className="flex flex-wrap items-center gap-2 md:gap-3">
                <span className="text-sm font-semibold text-gray-700">Sort by (scan table):</span>
                <a href="#comparison" className="inline-flex items-center rounded-xl border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100">Shortest duration</a>
                <a href="#comparison" className="inline-flex items-center rounded-xl border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100">Lowest fees</a>

                <span className="mx-2 h-5 w-px bg-gray-300" aria-hidden="true" />

                <a href="#faqs" className="inline-flex items-center rounded-xl bg-blue-700 px-3 py-1.5 text-sm font-semibold text-white hover:opacity-95">FAQs</a>
                <a href="#contact-cta" className="inline-flex items-center rounded-xl border border-blue-700 px-3 py-1.5 text-sm font-semibold text-blue-700 hover:bg-blue-700/5">Talk to us</a>
              </div>
            </div>
          </div>

      {/* Featured */}
      {featured.length > 0 && (
        <section className="py-10 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold">Featured Programs</h2>
            <p className="mt-1 text-gray-600">Popular, career-oriented tracks with strong outcomes.</p>
            <div className="mt-6 grid md:grid-cols-2 gap-8">
              {featured.map((course, idx) => (
                <CourseCard key={course.id} course={course} featured={idx === 0} />
              ))}
            </div>
          </div>
        </section>
      )}
      <section className="py-6" id="all-courses" aria-label="All courses">
          <div className="max-w-6xl mx-auto px-4">
            <h3 className="text-xl md:text-2xl font-bold">All Courses</h3>
            <div className="mt-5 grid md:grid-cols-2 gap-8">
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
            <div className="mt-4">
              <a href="#top" className="text-sm text-blue-700 hover:underline">Back to top</a>
            </div>
          </div>
      </section>

      {/* Benefits grid */}
      <section className="py-12 bg-white border-t" id="benefits">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold">Why Learn with Doon Coding Academy?</h2>
          <p className="mt-1 text-gray-600">Designed for Dehradun learners at different starting points.</p>

          <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
            { icon: "📚", title: "Course Details", text: "Compare program information, duration, and fees on course pages." },
              { icon: "🧱", title: "Project-First", text: "Portfolio projects in every track—learn by building." },
              { icon: "🎯", title: "Job-Ready Skills", text: "Modern stack + interview prep and guidance." },
            { icon: "📍", title: "Campus Location", text: "Find on-campus course information for Herbertpur, Dehradun." },
            ].map((f) => (
              <div key={f.title} className="rounded-2xl bg-gray-50 p-5 ring-1 ring-gray-200">
                <div className="text-3xl">{f.icon}</div>
                <h3 className="mt-3 font-semibold">{f.title}</h3>
                <p className="mt-1 text-sm text-gray-700">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mobile snapshot (stacked cards) */}
      <section className="py-8 bg-white md:hidden" aria-label="Course snapshot (mobile)">
        <div className="max-w-6xl mx-auto px-4">
          <CourseSnapshotMobile
            rows={courses.map((c) => ({
              name: c.shortTitle,
              level: c.level,
              mode: formatCourseModes(c),
              duration: formatCourseDuration(c.duration),
              fees: formatCoursePrice(c.pricing),
              outcome: c.outcomes?.[0],
              ctaHref: `/courses/${c.slug}`,
            }))}
          />
        </div>
      </section>

      {/* Course Comparison */}
      <section className="py-12 bg-white" id="comparison">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold">Course Comparison</h2>
          <p className="mt-1 text-gray-600">Glance at duration, pricing, and typical outcomes.</p>

          <div className="mt-6 overflow-x-auto hidden md:block">
            <table className="w-full bg-white rounded-lg shadow-sm overflow-hidden">
              <thead className="bg-blue-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left">Course</th>
                  <th className="px-6 py-4 text-center">Level</th>
                  <th className="px-6 py-4 text-center">Duration</th>
                  <th className="px-6 py-4 text-center">Price</th>
                  <th className="px-6 py-4 text-center">Mode</th>
                  <th className="px-6 py-4 text-center">Course Focus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {courses.map((course) => (
                  <tr className="hover:bg-gray-50" id={`${course.slug}-row`} key={course.id}>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{course.title}</div>
                      <div className="text-sm text-gray-600">{course.description}</div>
                    </td>
                    <td className="px-6 py-4 text-center">{course.level}</td>
                    <td className="px-6 py-4 text-center">{formatCourseDuration(course.duration)}</td>
                    <td className="px-6 py-4 text-center">{formatCoursePrice(course.pricing)}</td>
                    <td className="px-6 py-4 text-center">{formatCourseModes(course)}</td>
                    <td className="px-6 py-4 text-center text-sm">{course.outcomes[0]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-3 text-sm text-gray-600">
            Compare listed durations and fees to find a course that fits your plans.
          </p>
        </div>
      </section>

      {/* Outcomes strip */}
      <section className="py-8 bg-blue-600/5 border-y border-blue-700/10">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-xl md:text-2xl font-bold">What you’ll walk away with</h2>
          <ul className="mt-3 grid md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm text-gray-800">
            {courses.map((course) => (
              <li key={course.id} className="rounded-xl bg-white p-3 ring-1 ring-gray-200">
                <span className="block font-semibold">{course.shortTitle}</span>
                {course.outcomes[0]}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Course FAQs (mini) */}
      <section className="py-12 bg-white" id="faqs">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold">Course FAQs</h2>
          <p className="mt-1 text-gray-600">Quick answers before you pick a track.</p>

          <div className="mt-6 space-y-4">
            {[
              {
                q: "Do I need prior coding experience?",
                a: "Your starting learning stage depends on your current skills and goals, and progression can follow your pace.",
              },
              {
                q: "Are payment plans available?",
                a: "Course pricing includes monthly rates and package rates. See each course page for its current pricing.",
              },
              {
                q: "Will I build real projects?",
                a: "Review each course curriculum and outcomes for its listed project work.",
              },
              {
                q: "How do I decide which course is right for me?",
                a: "Compare the course curriculum, duration, and fees, or contact us with questions.",
              },
            ].map((item) => (
              <details key={item.q} className="group rounded-2xl bg-gray-50 ring-1 ring-gray-200 open:ring-blue-700/30">
                <summary className="cursor-pointer list-none select-none p-5 font-semibold text-lg">
                  {item.q}
                </summary>
                <div className="px-5 pb-5 pt-0 text-gray-700">{item.a}</div>
              </details>
            ))}
          </div>

          {/* Contact CTA */}
          <div className="mt-8 rounded-2xl border border-blue-700/20 bg-blue-600/5 p-5" id="contact-cta">
            <p className="font-semibold text-blue-700">Need help choosing the right course?</p>
            <div className="mt-3 flex flex-wrap gap-3">
              <a
                href="/contact"
                className="inline-flex items-center rounded-xl bg-blue-700 px-4 py-2 text-white text-sm font-semibold shadow-sm hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-blue-700/30"
              >
                Contact us about choosing a course
              </a>
              <a
                href="https://wa.me/917037905464?text=Hi%2C%20I%20need%20help%20choosing%20a%20course"
                className="inline-flex items-center rounded-xl border border-blue-700 px-4 py-2 text-blue-700 text-sm font-semibold hover:bg-blue-700/5 focus:outline-none focus:ring-2 focus:ring-blue-700/20"
              >
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
