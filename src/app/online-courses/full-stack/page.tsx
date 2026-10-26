import type { Metadata } from "next";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import LearningProgressionNote from "@/components/features/LearningProgressionNote";
import { getCourseBySlug } from "@/lib/courses";
import { getCourseJsonLd } from "@/lib/schema";
import { breadcrumbLd } from "@/lib/seo";
import { formatCourseDuration, formatCoursePrice } from "@/lib/pricing";
import { SITE } from "@/lib/site-config";

const CANON = `${SITE.url}/online-courses/full-stack`;

// ---- Page Metadata ----
export const metadata: Metadata = {
  title: "Online Full-Stack Development (MERN) in India",
  description:
    "Explore the online Full-Stack curriculum, duration, and fees.",
  alternates: { canonical: CANON },
  openGraph: {
    title: "Online Full-Stack Development (MERN) in India",
    description:
      "Explore the online Full-Stack curriculum, duration, and fees.",
    url: CANON,
    type: "website",
    siteName: "Doon Coding Academy",
  },
  twitter: {
    card: "summary_large_image",
    title: "Online Full-Stack Development (MERN) in India",
    description:
      "Explore the online Full-Stack curriculum, duration, and fees.",
  },
};

export default function OnlineFullStackPage() {
  // JSON-LD via centralized helper
  const course = getCourseBySlug("full-stack");
  const courseJsonLd = course
    ? getCourseJsonLd(course, { variant: "online", pathPrefix: "online-courses" })
    : undefined;

  // breadcrumbs injected via inline <script> at the bottom

  return (
    <div className="min-h-screen">
      {/* H1 — required: Online + India + value proposition */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white pt-10 pb-16">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            Online Full-Stack Development (MERN) in India
          </h1>
          <p className="text-lg md:text-xl text-blue-100 max-w-3xl mx-auto">
            Review the canonical Full-Stack curriculum and details for the confirmed online offering.{" "}
            <Link href="/courses/full-stack" className="underline text-yellow-200 hover:text-white">
              Prefer on-campus? See Dehradun Full-Stack
            </Link>
          </p>
          <p className="mt-3 text-sm text-blue-100">
            Contact DCA to confirm current online delivery details.
          </p>
          <LearningProgressionNote className="mt-3 text-blue-100" />
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              href="/contact"
              size="lg"
              className="bg-yellow-400 text-blue-900 font-semibold hover:bg-yellow-500"
              event="cta_enroll_click"
              eventParams={{ page_type: 'online_course', course_slug: 'full-stack', city: 'india', variant: 'hero_primary' }}
            >
              Talk to a Mentor
            </Button>
            <Button
              href="/courses/full-stack"
              size="lg"
              variant="secondary"
              event="cta_enroll_click"
              eventParams={{ page_type: 'online_course', course_slug: 'full-stack', city: 'india', variant: 'hero_secondary_oncampus' }}
            >
              Prefer On-Campus (Dehradun)?
            </Button>
          </div>
          {course && (
            <div className="mt-6 text-sm text-blue-200">
              <span className="inline-block px-3 py-1 rounded-full bg-white/10 mr-2">
                Level: {course.level}
              </span>
              <span className="inline-block px-3 py-1 rounded-full bg-white/10 mr-2">
                Duration: {formatCourseDuration(course.duration)}
              </span>
              <span className="inline-block px-3 py-1 rounded-full bg-white/10 mr-2">
                Fees: {formatCoursePrice(course.pricing)}
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Course outline */}
      <section className="py-6">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-2">Course curriculum</h3>
            <ol className="list-decimal ml-5 text-gray-700 space-y-1">
              {course?.curriculum.map((item) => <li key={item}>{item}</li>)}
            </ol>
          </Card>
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-2">Course outcomes</h3>
            <ul className="list-disc ml-5 text-gray-700 space-y-1">
              {course?.outcomes.map((item) => <li key={item}>{item}</li>)}
            </ul>
            <div className="mt-4 flex gap-3">
              <Button
                href="/contact"
                event="cta_enroll_click"
                eventParams={{ page_type: 'online_course', course_slug: 'full-stack', city: 'india', variant: 'cohort_card_primary' }}
              >
                Enroll / Ask Questions
              </Button>
              <Button
                href="/faq"
                variant="ghost"
                event="cta_enroll_click"
                eventParams={{ page_type: 'online_course', course_slug: 'full-stack', city: 'india', variant: 'cohort_card_faq' }}
              >
                See FAQs
              </Button>
            </div>
          </Card>
        </div>
      </section>

      {/* Cross-links */}
      <section className="py-8">
        <div className="max-w-6xl mx-auto px-4 text-gray-700">
          <p>
            Near Dehradun and prefer in-person?{" "}
            <Link href="/courses/full-stack" className="text-blue-700 hover:underline">
              See the on-campus Full-Stack program
            </Link>
            .
          </p>
          <p className="mt-3 text-sm">
            Want city options? <Link href="/locations" className="text-blue-700 underline">Browse locations</Link>.
          </p>
        </div>
      </section>

      {/* JSON-LD (Course) */}
      {courseJsonLd && (
        <script
          id="jsonld-course-online-fullstack"
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(courseJsonLd) }}
        />
      )}

      <script
        id="breadcrumbs-online-courses-full-stack"
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbLd([
              { name: "Home", url: SITE.url },
              { name: "Online Courses", url: `${SITE.url}/online-courses` },
              { name: "Online Full-Stack Development (MERN) in India", url: CANON },
            ])
          ),
        }}
      />
    </div>
  );
}
