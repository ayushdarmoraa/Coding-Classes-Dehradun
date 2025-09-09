import type { Metadata } from "next";
import { getCourses } from "@/lib/courses";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

const RAW_BASE = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
const BASE = RAW_BASE.replace(/^http:\/\//, "https://");
const APEX = BASE.replace(/^https:\/\/www\./, "https://");

export const metadata: Metadata = {
  title: "Online Coding Courses in India (Live + Projects)",
  description:
    "Live online Full-Stack, Data Science, Python & Java for India-wide learners. Small batches, projects, recordings & mentor support.",
  openGraph: {
    title: "Online Coding Courses in India (Live + Projects)",
    description:
      "Live online Full-Stack, Data Science, Python & Java for India-wide learners. Small batches, projects, recordings & mentor support.",
    url: APEX + "/online-courses",
    type: "website",
    siteName: "Doon Coding Academy",
  },
  twitter: {
    card: "summary_large_image",
    title: "Online Coding Courses in India (Live + Projects)",
    description:
      "Live online Full-Stack, Data Science, Python & Java for India-wide learners. Small batches, projects, recordings & mentor support.",
  },
  alternates: { canonical: APEX + "/online-courses" },
};

export default function OnlineCoursesPage() {
  const courses = getCourses();
  const onlineSlugs = new Set(["full-stack", "data-science", "python", "java"]);
  const onlineCourses = courses.filter(c => onlineSlugs.has(c.slug));

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white pt-10 pb-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            Online Coding Courses in India (Live + Projects)
          </h1>
          <p className="text-lg md:text-xl max-w-3xl mx-auto text-blue-100">
            Learn from anywhere in India with live cohorts, recordings, mentor hours, and hands-on projects.
            Stay accountable with a structured cohort flow and community support.
          </p>
        </div>
  </section>

      {/* Courses list */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-6">
            {onlineCourses.map((course) => (
              <Card key={course.id} className="p-6" hover>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{course.title}</h2>
                    <p className="text-gray-700 mt-1">{course.description}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Duration: {course.duration}
                    </p>
                  </div>
                  <div className="shrink-0 self-start sm:self-center">
                    {course.slug === "full-stack" && (
                      <Button href="/online-courses/full-stack" size="md">View</Button>
                    )}
                    {course.slug === "data-science" && (
                      <Button href="/online-courses/data-science" size="md">View</Button>
                    )}
                    {course.slug === "python" && (
                      <Button href="/online-courses/python" size="md">View</Button>
                    )}
                    {course.slug === "java" && (
                      <Button href="/online-courses/java" size="md">View</Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="text-center mt-10">
            <Button href="/faq" variant="secondary" className="mr-3">See FAQs</Button>
            <Button href="/contact" variant="ghost">Talk to a Mentor</Button>
          </div>
        </div>
      </section>

      {/* BreadcrumbList JSON-LD */}
      <script
        id="breadcrumbs-online-courses"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://dooncodingacademy.in" },
              { "@type": "ListItem", position: 2, name: "Online Coding Courses in India (Live + Projects)", item: "https://dooncodingacademy.in/online-courses" }
            ]
          })
        }}
      />
    </div>
  );
}
