import type { Metadata } from "next";
import Button from "@/components/ui/Button";
import LearningProgressionNote from "@/components/features/LearningProgressionNote";
import Link from "next/link";
import { getCourseBySlug } from "@/lib/courses";
import { getCourseJsonLd } from "@/lib/schema";
import { breadcrumbLd } from "@/lib/seo";
import {
  formatCourseDuration,
  formatCourseModes,
  formatCoursePrice,
} from "@/lib/pricing";
import { SITE } from "@/lib/site-config";

const CANONICAL = `${SITE.url}/online-courses/python`;

export const metadata: Metadata = {
  title: "Online Python Course in India",
  description:
    "Explore the online Python curriculum, duration, and fees.",
  alternates: { canonical: CANONICAL },
  openGraph: {
    title: "Online Python Course in India",
    description:
      "Explore the online Python curriculum, duration, and fees.",
    url: CANONICAL,
    type: "website",
    siteName: "Doon Coding Academy",
  },
  twitter: {
    card: "summary_large_image",
    title: "Online Python Course in India",
    description:
      "Explore the online Python curriculum, duration, and fees.",
  },
};

export default function OnlinePythonPage() {
  const course = getCourseBySlug("python");
  const ld = course
    ? getCourseJsonLd(course, { variant: "online", pathPrefix: "online-courses" })
    : undefined;

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <header className="cd-hero mb-8 rounded-dca-lg p-6 sm:p-9">
      <h1 className="mt-3 text-3xl md:text-4xl font-bold text-ink mb-4">
        Online Python Course in India
      </h1>
      <p className="text-lg text-gray-700 mb-6">
        Learn about the online Python course and review its program details. {" "}
        <Link href="/courses/python" className="underline text-blue-700">Prefer on-campus? See Dehradun Python</Link>
      </p>
      <LearningProgressionNote className="mb-6" />
      {course && (
        <>
          <p className="text-sm text-gray-600 mb-2">
            Level: {course.level} · Duration: {formatCourseDuration(course.duration)} · Fees: {formatCoursePrice(course.pricing)}
          </p>
          <p className="text-sm text-gray-600 mb-6">
            Confirmed delivery modes: {formatCourseModes(course)}. Ask the team about
            upcoming batches, class timings, learning support, and other current online arrangements.
          </p>
        </>
      )}

      <div className="flex flex-wrap gap-3 mb-10">
        <Button href="/contact" size="lg" variant="primary">Ask about this course</Button>
        <Button href="/courses/python" size="lg" variant="secondary">On-Campus (Dehradun)</Button>
      </div>
      </header>

      <section className="mb-8 grid gap-6 sm:grid-cols-2">
        <div className="surface-card p-6">
          <h2 className="text-xl font-semibold mb-2">Course curriculum</h2>
          <ul className="list-disc ml-5 text-gray-700 space-y-1">
            {course?.curriculum.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
        <div className="surface-card p-6">
          <h2 className="text-xl font-semibold mb-2">Prerequisites</h2>
          <ul className="list-disc ml-5 text-gray-700 space-y-1">
            {course?.prerequisites.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
        <div className="surface-card p-6">
          <h2 className="text-xl font-semibold mb-2">Course outcomes</h2>
          <ul className="list-disc ml-5 text-gray-700 space-y-1">
            {course?.outcomes.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
      </section>

      {ld && (
        <script
          id="ld-course-python"
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
        />
      )}

      <script
        id="breadcrumbs-online-courses-python"
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbLd([
              { name: "Home", url: SITE.url },
              { name: "Online Courses", url: `${SITE.url}/online-courses` },
              { name: "Online Python Course in India", url: `${SITE.url}/online-courses/python` },
            ])
          ),
        }}
      />
      <div className="mt-10 text-center">
        <Link href="/locations" className="underline text-blue-700 text-sm">See campus & cities</Link>
      </div>
    </main>
  );
}
