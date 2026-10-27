import type { Metadata } from "next";
import Button from "@/components/ui/Button";
import Link from "next/link";
import Card from "@/components/ui/Card";
import LearningProgressionNote from "@/components/features/LearningProgressionNote";
import { getCourseBySlug } from "@/lib/courses";
import { getCourseJsonLd } from "@/lib/schema";
import { breadcrumbLd } from "@/lib/seo";
import { formatCourseDuration, formatCoursePrice } from "@/lib/pricing";
import { SITE } from "@/lib/site-config";

const PAGE_URL = `${SITE.url}/online-courses/java`;

export const metadata: Metadata = {
  title: "Online Java Course in India",
  description:
    "Explore the online Java curriculum, duration, and fees.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "Online Java Course in India",
    description:
      "Explore the online Java curriculum, duration, and fees.",
    url: PAGE_URL,
    type: "website",
    siteName: "Doon Coding Academy",
  },
  twitter: {
    card: "summary_large_image",
    title: "Online Java Course in India",
    description:
      "Explore the online Java curriculum, duration, and fees.",
  },
};

export default function JavaOnlinePage() {
  const course = getCourseBySlug("java");
  const jsonLd = course
    ? getCourseJsonLd(course, { variant: "online", pathPrefix: "online-courses" })
    : undefined;

  return (
    <main className="min-h-screen">
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Online Java Course in India
          </h1>
          <p className="mt-4 text-lg text-gray-700">
            Review the canonical Java course curriculum and details for the confirmed online offering.{" "}
            <Link href="/courses/java" className="underline text-blue-700">Prefer on-campus? See Java in Dehradun</Link>
          </p>
          <p className="mt-2 text-sm text-gray-600">
            Contact DCA to confirm current online delivery details.
          </p>
          <LearningProgressionNote className="mt-3 text-gray-600" />

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900">At a glance</h2>
              <ul className="mt-3 space-y-2 text-gray-700 text-sm">
                <li>✅ Mode: <strong>Online</strong></li>
                {course && <li>✅ Level: <strong>{course.level}</strong></li>}
                {course && <li>✅ Duration: <strong>{formatCourseDuration(course.duration)}</strong></li>}
                {course && <li>✅ Fees: <strong>{formatCoursePrice(course.pricing)}</strong></li>}
                {course?.curriculum.map((item) => <li key={item}>• {item}</li>)}
              </ul>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900">What you’ll learn</h2>
              <ul className="mt-3 space-y-2 text-gray-700 text-sm">
                {course?.outcomes.map((item) => <li key={item}>• {item}</li>)}
              </ul>
            </Card>
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900">Prerequisites</h2>
              <ul className="mt-3 space-y-2 text-gray-700 text-sm">
                {course?.prerequisites.map((item) => <li key={item}>• {item}</li>)}
              </ul>
            </Card>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Button href="/contact" size="lg" className="bg-blue-600 text-white hover:bg-blue-700">
              Talk to a Mentor
            </Button>
            <Button href="/courses/java" size="lg" variant="secondary">
              See On-Campus Java (Dehradun)
            </Button>
          </div>
        </div>
      </section>

      {jsonLd && (
        <script
          id="jsonld-course-java-online"
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}

      <script
        id="breadcrumbs-online-courses-java"
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbLd([
              { name: "Home", url: SITE.url },
              { name: "Online Courses", url: `${SITE.url}/online-courses` },
              { name: "Online Java Course in India", url: PAGE_URL },
            ])
          ),
        }}
      />
      <div className="mt-8 text-center pb-12">
        <Link href="/locations" className="underline text-blue-700 text-sm">See campus & cities</Link>
      </div>
    </main>
  );
}
