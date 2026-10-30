import type { Metadata } from "next";
import Button from "@/components/ui/Button";
import LearningProgressionNote from "@/components/features/LearningProgressionNote";
import Link from "next/link";
import { getCourseBySlug } from "@/lib/courses";
import { getCourseJsonLd } from "@/lib/schema";
import { breadcrumbLd } from "@/lib/seo";
import { formatCourseDuration, formatCourseModes, formatCoursePrice } from "@/lib/pricing";
import { SITE } from "@/lib/site-config";

const TITLE = "Data Science & AI Course Details | Doon Coding Academy";
const DESC =
  "Explore the Data Science & AI curriculum, duration, and fees. Contact the academy to confirm delivery availability.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: `${SITE.url}/online-courses/data-science` },
  openGraph: {
    title: TITLE,
    description: DESC,
    url: `${SITE.url}/online-courses/data-science`,
    type: "website",
    siteName: SITE.name,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESC,
  },
};

export default function OnlineDataSciencePage() {
  const course = getCourseBySlug("data-science");
  const jsonLd = course
    ? getCourseJsonLd(course, { variant: "online", pathPrefix: "online-courses" })
    : undefined;

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="bg-navy-grad text-white pt-12 pb-16">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-5 leading-tight">
            Data Science &amp; AI Course Details
            <br />
            <span className="text-blue-200">Curriculum, duration, and fees</span>
          </h1>
          <p className="text-lg md:text-xl text-blue-100 max-w-3xl mx-auto">
            Review the curriculum and canonical details. Contact the academy to confirm delivery availability.{" "}
            <Link href="/courses/data-science" className="underline text-yellow-200 hover:text-white">View the course page</Link>
          </p>
          <LearningProgressionNote className="mt-3 text-blue-100" />
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
            <Button href="/contact" size="lg" className="bg-yellow-400 text-blue-900 font-semibold hover:bg-yellow-500">
              Ask about this course
            </Button>
            <Button
              href="/courses/data-science"
              size="lg"
              className="!bg-transparent border-2 border-white text-white font-semibold hover:bg-white hover:text-blue-600 transition"
            >
              View Course Details
            </Button>
          </div>
        </div>
      </section>

      {/* Key points */}
      <section className="py-12">
        <div className="max-w-5xl mx-auto px-4 grid md:grid-cols-3 gap-6">
          <div className="surface-card p-6">
            <h2 className="text-xl font-semibold mb-2">What you’ll learn</h2>
            <ul className="text-gray-700 space-y-1">
              {course?.curriculum.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="surface-card p-6">
            <h2 className="text-xl font-semibold mb-2">Course details</h2>
            <p className="text-gray-700">
              {course && `Level: ${course.level} · ${formatCourseDuration(course.duration)} · ${formatCourseModes(course)}`}
            </p>
            {course && <p className="mt-2 text-sm text-gray-600">Fees: {formatCoursePrice(course.pricing)}</p>}
          </div>
          <div className="surface-card p-6">
            <h2 className="text-xl font-semibold mb-2">Course outcomes</h2>
            <ul className="text-gray-700 space-y-1">
              {course?.outcomes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>
      <p className="max-w-5xl mx-auto px-4 -mt-6 pb-8 text-sm text-gray-600">
        Ask the team whether online delivery is currently available and, if so, about
        upcoming batches, class timings, and learning support.
      </p>

      {/* Bottom CTA */}
      <section className="pb-12 -mt-4">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-sm text-blue-600 mb-3">Explore locations and current course availability</p>
          <Link href="/locations" className="inline-block underline text-blue-700">See campus & cities</Link>
        </div>
      </section>

      {/* JSON-LD */}
      {jsonLd && (
        <script
          id="course-jsonld-data-science"
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}

      <script
        id="breadcrumbs-online-courses-data-science"
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbLd([
              { name: "Home", url: SITE.url },
              { name: "Online Courses", url: `${SITE.url}/online-courses` },
              { name: "Data Science & AI Course Details", url: `${SITE.url}/online-courses/data-science` },
            ])
          ),
        }}
      />
    </main>
  );
}
