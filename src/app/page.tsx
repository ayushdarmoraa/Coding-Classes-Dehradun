import type { Metadata } from "next";
import Link from "next/link";
import { getCourses } from "@/lib/courses";
import CourseCard from "@/components/features/CourseCard";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import HomeFAQ from "@/components/faq/HomeFAQ";
import CourseSnapshotMobile from "@/components/features/CourseSnapshotMobile";
import LearningProgressionNote from "@/components/features/LearningProgressionNote";
import { testimonials } from "@/lib/testimonials";
import { formatCourseDuration, formatCourseModes, formatCoursePrice } from "@/lib/pricing";
import { SITE } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Coding Courses in Dehradun & Online in India",
  description:
    "Explore Full-Stack, Data Science, Python, and Java courses in Dehradun and online across India.",
  // ✅ Canonical to apex (trailing slash)
  alternates: { canonical: SITE.url + "/" },
  openGraph: {
    title: "Coding Courses in Dehradun & Online in India",
    description:
      "Explore Full-Stack, Data Science, Python, and Java courses in Dehradun and online across India.",
    // ✅ OG url to apex + add image
    url: SITE.url + "/",
    type: "website",
    siteName: "Doon Coding Academy",
  },
  twitter: {
    // ✅ Large image card + image fallback
    card: "summary_large_image",
    title: "Coding Courses in Dehradun & Online in India",
    description:
      "Explore Full-Stack, Data Science, Python, and Java courses in Dehradun and online across India.",
  },
};

export default function HomePage() {
  const courses = getCourses();
  const featuredCourses = courses.filter(course => 
    ['full-stack', 'data-science', 'python'].includes(course.slug)
  );

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
  <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white pt-10 pb-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <Badge variant="success" className="mb-6 bg-green-500 text-white">
            🚀 Now with Gen AI Integration
          </Badge>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            Coding Courses in Dehradun &amp; Online in India
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed text-blue-100">
            Transform your career with industry-focused coding courses in Dehradun. 
            Learn Full-Stack Development, Data Science, and AI from experienced professionals.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              href="/courses" 
              variant="primary"
              size="lg"
              className="bg-yellow-400 text-blue-900 font-semibold hover:bg-yellow-500"
              event="cta_home_explore_courses"
              eventParams={{ location: "home_hero" }}
            >
              Explore Courses
            </Button>
            <Button 
              href={`${SITE.whatsappUrl}?text=${encodeURIComponent("Hi, I want to know more about your courses")}`}
              size="lg"
              className="bg-transparent border-2 border-white text-white font-semibold hover:bg-white hover:text-blue-600 transition"
            >
              Chat on WhatsApp
            </Button>
          </div>

          {/* subtle internal link to Locations per SEO plan */}
          <p className="mt-3 text-sm text-gray-600">
            Prefer city context? Visit our{" "}
            <a href="/locations" className="text-blue-700 hover:underline">
              Locations
            </a>{" "}
            page.
          </p>
          
          <div className="grid gap-3 sm:grid-cols-2 max-w-3xl mx-auto mt-8 text-left">
            <Link
              href="/courses"
              className="rounded-xl border border-white/25 bg-white/10 p-4 transition hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <span className="font-semibold text-white">Structured course pathways</span>
              <span className="mt-1 block text-sm text-blue-100">
                Full-Stack, Data Science, Python, and Java
              </span>
            </Link>
            <Link
              href="/blog"
              className="rounded-xl border border-white/25 bg-white/10 p-4 transition hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <span className="font-semibold text-white">Guides for learners</span>
              <span className="mt-1 block text-sm text-blue-100">
                Browse coding guides and learning roadmaps
              </span>
            </Link>
          </div>
        </div>
      </section>


  {/* FAQ (Home) — compact accordion, one-open-at-a-time */}
  <div className="defer-visibility">
    <HomeFAQ courses={courses} />
  </div>

      {/* Trust Signals */}
  <section className="py-16 bg-gray-50 defer-visibility">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Doon Coding Academy?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We focus on practical skills, real projects, and career outcomes that matter.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Industry-Focused</h3>
              <p className="text-gray-600">
                Curriculum designed with industry professionals. Learn skills that employers actually need.
              </p>
            </Card>
            
            <Card className="p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">👥</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Course Details</h3>
              <p className="text-gray-600">
                Review each course’s curriculum, prerequisites, and project work before choosing a program.
              </p>
            </Card>
            
            <Card className="p-8 text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">AI Integration</h3>
              <p className="text-gray-600">
                Stay ahead with Gen AI tools and techniques integrated into our Full-Stack program.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Why Online with DCA (Home) */}
  <section className="py-16 defer-visibility">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Online with DCA (Live + Projects)
            </h2>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto">
              Learn from anywhere in India without losing the structure and accountability of a classroom.
              Our live sessions run on a fixed cohort schedule and every class is recorded the same day,
              so you can revise at your pace. Dedicated mentor hours keep your doubts unblocked, while a
              tight-knit peer community helps you stay consistent and ship work that employers notice.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6 h-full">
              <h3 className="text-xl font-semibold mb-2">Live classes + recordings</h3>
              <p className="text-gray-600">
                Attend interactive lectures with Q&amp;A and get full recordings with timestamps and
                resources so you never fall behind—even if you miss a session.
              </p>
            </Card>

            <Card className="p-6 h-full">
              <h3 className="text-xl font-semibold mb-2">Mentor hours &amp; code reviews</h3>
              <p className="text-gray-600">
                Book evening IST office hours for 1:1 help. Get actionable feedback on assignments,
                pull-requests, and project architecture to level up quickly.
              </p>
            </Card>

            <Card className="p-6 h-full">
              <h3 className="text-xl font-semibold mb-2">Structured cohort flow</h3>
              <p className="text-gray-600">
                Weekly goals, sprints, and demo-days keep momentum high. Clear rubrics define what
                “good” looks like for every module.
              </p>
            </Card>

            <Card className="p-6 h-full">
              <h3 className="text-xl font-semibold mb-2">Hands-on, portfolio projects</h3>
              <p className="text-gray-600">
                Build real apps and data notebooks from scratch. Repo-first learning with GitHub issues,
                PRs, and reviews—exactly how modern teams work.
              </p>
            </Card>

            <Card className="p-6 h-full">
              <h3 className="text-xl font-semibold mb-2">Learning Guides</h3>
              <p className="text-gray-600">
                Browse published coding guides and learning roadmaps in the Guides section.
              </p>
            </Card>

            <Card className="p-6 h-full">
              <h3 className="text-xl font-semibold mb-2">Tools &amp; support</h3>
              <p className="text-gray-600">
                GitHub Classroom, Notion roadmaps, Kaggle/CodeSandbox, Zoom. Seamless onboarding and
                quick tech support so the focus stays on learning.
              </p>
            </Card>
          </div>

          <p className="text-lg text-gray-700 max-w-4xl mx-auto mt-8 text-center">
            Explore on-campus courses in Dehradun or online course options for learners across India.
          </p>

          <div className="text-center mt-10">
            <Button
              href="/courses"
              size="lg"
              variant="primary"
              className="mr-3"
              event="cta_home_explore_courses"
              eventParams={{ location: "home_mid" }}
            >
              Explore Courses
            </Button>
            <Button href="/contact" size="lg" variant="ghost">
              Talk to a Mentor
            </Button>
          </div>
        </div>
      </section>

      {/* Snapshot: canonical course facts */}
  <section className="py-12 defer-visibility">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
            Course Snapshot
          </h2>
          <p className="text-gray-600 mb-6">
            Compare course duration, fees, and confirmed On-Campus, Online, and Hybrid options.
          </p>
          <LearningProgressionNote className="mb-6 text-gray-600" />

          {/* Mobile cards */}
          <CourseSnapshotMobile
            rows={courses.map((course) => ({
              name: course.shortTitle,
              level: course.level,
              mode: formatCourseModes(course),
              duration: formatCourseDuration(course.duration),
              fees: formatCoursePrice(course.pricing),
              ctaHref: `/courses/${course.slug}`,
            }))}
          />

          {/* Desktop table (existing) */}
          <div className="hidden md:block">
            <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-700">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Course</th>
                    <th className="px-4 py-3 font-semibold">Level</th>
                    <th className="px-4 py-3 font-semibold">Mode</th>
                    <th className="px-4 py-3 font-semibold">Duration</th>
                    <th className="px-4 py-3 font-semibold">Fees</th>
                    <th className="px-4 py-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {courses.map((course) => (
                    <tr key={course.id}>
                      <td className="px-4 py-3">{course.shortTitle}</td>
                      <td className="px-4 py-3">{course.level}</td>
                      <td className="px-4 py-3">{formatCourseModes(course)}</td>
                      <td className="px-4 py-3">{formatCourseDuration(course.duration)}</td>
                      <td className="px-4 py-3">{formatCoursePrice(course.pricing)}</td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          href={`/courses/${course.slug}`}
                          size="sm"
                          event="cta_home_table_view_course"
                          eventParams={{ location: "home_table", course_slug: course.slug }}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
  <section className="py-16 defer-visibility">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Popular Courses
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose from our carefully crafted programs designed to get you job-ready.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {featuredCourses.map((course, index) => (
              <CourseCard 
                key={course.id} 
                course={course} 
                featured={index === 0}
              />
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Button
              href="/courses"
              variant="secondary"
              size="lg"
              event="cta_home_view_all_courses"
              eventParams={{ location: "home_mid" }}
            >
              View All Courses
            </Button>
          </div>
        </div>
      </section>

      {testimonials.length > 0 && (
        <section className="py-16 bg-gray-50 defer-visibility">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Students Say
            </h2>
            <p className="text-xl text-gray-600">
              Verified learner experiences shared with permission
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.author} className="p-6 h-full">
                <blockquote className="text-gray-700 leading-relaxed italic">
                  “{testimonial.text}”
                </blockquote>
                <p className="mt-4 font-semibold text-gray-900">{testimonial.author}</p>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Button href="/testimonials" variant="ghost">
              Read More Success Stories
            </Button>
          </div>
        </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Start Your Tech Journey?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Explore the course programs and contact us for current enrollment details.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              href="/courses"
              size="lg"
              className="bg-yellow-400 text-blue-900 font-semibold hover:bg-yellow-500 transition"
            >
              Explore Courses
            </Button>
            <Button
              href={`${SITE.whatsappUrl}?text=${encodeURIComponent("Hi, I want to know more about your courses")}`}
              size="lg"
              className="!bg-transparent border-2 border-white text-white font-semibold hover:bg-white hover:text-blue-600 transition"
            >
              Chat on WhatsApp
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
