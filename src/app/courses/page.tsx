/* eslint-disable @next/next/no-html-link-for-pages */
// src/app/courses/page.tsx

import type { Metadata } from "next";
import { getCourses, getCourseBySlug } from "@/lib/courses";
import CourseCard from "@/components/features/CourseCard";
import Badge from "@/components/ui/Badge";
import Script from "next/script";

// ⬇️ TOP-LEVEL (outside any function)
const RAW_BASE = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
const BASE = RAW_BASE.replace(/^http:\/\//, "https://");

export const metadata: Metadata = {
  title: "Courses | Doon Coding Academy",
  description:
    "Explore all coding, data science, Python, and Java courses at Doon Coding Academy, Dehradun. Compare curriculum, fees, and outcomes. Small batches, hands-on projects, and career support.",
  alternates: { canonical: BASE + "/courses" },
  openGraph: {
    title: "Courses | Doon Coding Academy",
    description:
      "Browse all Full Stack, Data Science, Python, and Java courses in Dehradun. See curriculum, fees, and outcomes. Small batches, real projects, and career support.",
    url: BASE + "/courses",
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
  const python = getCourseBySlug("python");
  const java = getCourseBySlug("java");

  // Feature a couple up top
  const featuredSlugs = new Set(["full-stack", "data-science"]);
  const featured = courses.filter((c) => featuredSlugs.has(c.slug));

  // Clientless "filters" via anchor sections: map slugs to levels
  const intermediateSlugs = new Set(["data-science"]);
  const advancedSlugs = new Set(["full-stack"]);

  const intermediate = courses.filter((c) => intermediateSlugs.has(c.slug));
  const advanced = courses.filter((c) => advancedSlugs.has(c.slug));

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${BASE}/courses#breadcrumb`,
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        item: { "@type": "WebPage", "@id": `${BASE}/`, name: "Home" },
      },
      {
        "@type": "ListItem",
        position: 2,
        item: { "@type": "WebPage", "@id": `${BASE}/courses`, name: "Courses" },
      },
    ],
  } as const;

  return (
    <div className="min-h-screen bg-gray-50" id="top">
      {/* Breadcrumb JSON-LD */}
      <Script
        id="courses-breadcrumb"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <p className="mt-2 max-w-2xl text-gray-700">
        Pick a program that fits your goals. Small batches, hands-on projects, and support included.
      </p>

          {/* Filters / Sort (anchor-only) */}
          <div className="mt-6">
            <div className="rounded-2xl bg-gray-50 ring-1 ring-gray-200 p-3 md:p-4">
              <div className="flex flex-wrap items-center gap-2 md:gap-3">
                <span className="text-sm font-semibold text-gray-700">Quick filters:</span>
                <a href="#beginner" className="inline-flex items-center rounded-xl border border-blue-700/30 bg-white px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-700/5">Beginner</a>
                <a href="#intermediate" className="inline-flex items-center rounded-xl border border-blue-700/30 bg-white px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-700/5">Intermediate</a>
                <a href="#advanced" className="inline-flex items-center rounded-xl border border-blue-700/30 bg-white px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-700/5">Advanced</a>

                <span className="mx-2 h-5 w-px bg-gray-300" aria-hidden="true" />

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
{/* Removed unreachable/orphaned JSX tags and comments left outside the main return block */}

      {!!intermediate.length && (
        <section className="py-6" id="intermediate" aria-label="Intermediate courses">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-center gap-2">
              <h3 className="text-xl md:text-2xl font-bold">Intermediate</h3>
              <Badge variant="info">Some fundamentals helpful</Badge>
            </div>
            <p className="mt-1 text-gray-600">Ideal if you’re comfortable with basics and want to specialize.</p>
            <div className="mt-5 grid md:grid-cols-2 gap-8">
              {intermediate.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
            <div className="mt-4">
              <a href="#top" className="text-sm text-blue-700 hover:underline">Back to top</a>
            </div>
          </div>
        </section>
      )}

      {!!advanced.length && (
        <section className="py-6" id="advanced" aria-label="Advanced courses">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-center gap-2">
              <h3 className="text-xl md:text-2xl font-bold">Advanced</h3>
              <Badge variant="success">Career track</Badge>
            </div>
            <p className="mt-1 text-gray-600">Go end-to-end on modern stacks and ship real projects.</p>
            <div className="mt-5 grid md:grid-cols-2 gap-8">
              {advanced.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
            <div className="mt-4">
              <a href="#top" className="text-sm text-blue-700 hover:underline">Back to top</a>
            </div>
          </div>
        </section>
      )}

      {/* Benefits grid */}
      <section className="py-12 bg-white border-t" id="benefits">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold">Why Learn with Doon Coding Academy?</h2>
          <p className="mt-1 text-gray-600">Designed for Dehradun learners—beginner-friendly, outcomes-first.</p>

          <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: "👨‍🏫", title: "Expert Mentors", text: "Instructors with 6+ years of industry experience." },
              { icon: "🧱", title: "Project-First", text: "Portfolio projects in every track—learn by building." },
              { icon: "🎯", title: "Job-Ready Skills", text: "Modern stack + interview prep and guidance." },
              { icon: "🤝", title: "Local Support", text: "Small batches, personalized feedback, community." },
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

      {/* Course Comparison */}
      <section className="py-12 bg-white" id="comparison">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold">Course Comparison</h2>
          <p className="mt-1 text-gray-600">Glance at duration, pricing, and typical outcomes.</p>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full bg-white rounded-lg shadow-sm overflow-hidden">
              <thead className="bg-blue-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left">Course</th>
                  <th className="px-6 py-4 text-center">Duration</th>
                  <th className="px-6 py-4 text-center">Price</th>
                  <th className="px-6 py-4 text-center">Level</th>
                  <th className="px-6 py-4 text-center">Typical Roles</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr className="hover:bg-gray-50" id="advanced-row">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">Full-Stack Development (MERN + Gen AI)</div>
                    <div className="text-sm text-gray-600">Complete web development with AI integration</div>
                  </td>
                  <td className="px-6 py-4 text-center">6 months</td>
                  <td className="px-6 py-4 text-center">₹25,000</td>
                  <td className="px-6 py-4 text-center"><Badge variant="success">Beginner→Advanced</Badge></td>
                  <td className="px-6 py-4 text-center text-sm">Full-Stack / Frontend / Backend Developer</td>
                </tr>
                <tr className="hover:bg-gray-50" id="intermediate-row">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">Data Science & AI</div>
                    <div className="text-sm text-gray-600">Python, ML, statistics, visualization</div>
                  </td>
                  <td className="px-6 py-4 text-center">6 months</td>
                  <td className="px-6 py-4 text-center">₹30,000</td>
                  <td className="px-6 py-4 text-center"><Badge variant="info">Intermediate</Badge></td>
                  <td className="px-6 py-4 text-center text-sm">Data Scientist / Analyst / ML Engineer</td>
                </tr>
                <tr className="hover:bg-gray-50" id="beginner-row-1">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">Python Programming</div>
                    <div className="text-sm text-gray-600">Foundation programming with Python</div>
                  </td>
                  <td className="px-6 py-4 text-center">{python?.duration}</td>
                  <td className="px-6 py-4 text-center">{python?.price}</td>
                  <td className="px-6 py-4 text-center">
                    <Badge variant="primary">{python?.level ?? "Intermediate"}</Badge>
                  </td>
                  <td className="px-6 py-4 text-center text-sm">Python Developer / Automation</td>
                </tr>
                <tr className="hover:bg-gray-50" id="beginner-row-2">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">Java Programming</div>
                    <div className="text-sm text-gray-600">OOP, collections, basic backend</div>
                  </td>
                  <td className="px-6 py-4 text-center">{java?.duration}</td>
                  <td className="px-6 py-4 text-center">{java?.price}</td>
                  <td className="px-6 py-4 text-center">
                    <Badge variant="primary">{java?.level ?? "Intermediate"}</Badge>
                  </td>
                  <td className="px-6 py-4 text-center text-sm">Java Developer / QA Automation</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="mt-3 text-sm text-gray-600">
            Tip: For shortest duration, check the 2–3 month tracks. For lowest fees, compare prices across rows.
          </p>
        </div>
      </section>

      {/* Outcomes strip */}
      <section className="py-8 bg-blue-600/5 border-y border-blue-700/10">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-xl md:text-2xl font-bold">What you’ll walk away with</h2>
          <ul className="mt-3 grid md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm text-gray-800">
            <li className="rounded-xl bg-white p-3 ring-1 ring-gray-200">Portfolio projects on GitHub</li>
            <li className="rounded-xl bg-white p-3 ring-1 ring-gray-200">Solid fundamentals + modern stack</li>
            <li className="rounded-xl bg-white p-3 ring-1 ring-gray-200">Interview prep & guidance</li>
            <li className="rounded-xl bg-white p-3 ring-1 ring-gray-200">Local mentor support in Dehradun</li>
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
                a: "No—beginner-friendly options are available. If you have experience, we help you pace faster.",
              },
              {
                q: "Are payment plans available?",
                a: "Yes, both monthly and one-time plans are available.",
              },
              {
                q: "Will I build real projects?",
                a: "Yes. Our approach is project-first; every course includes portfolio-ready work.",
              },
              {
                q: "How do I decide which course is right for me?",
                a: "Message us on WhatsApp or request a free consultation and we’ll guide you.",
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
                Get a free consultation
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
    </div>
  );
}

