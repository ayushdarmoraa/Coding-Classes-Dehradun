import type { Metadata } from "next";
import { getCourses, isCourseModeAvailable } from "@/lib/courses";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { formatCourseDuration, formatCourseModes, formatCoursePrice } from "@/lib/pricing";
import { SITE } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Online Coding Courses in India",
  description:
    "Explore coding courses with currently confirmed online delivery from Doon Coding Academy.",
  openGraph: {
    title: "Online Coding Courses in India",
    description:
      "Explore coding courses with currently confirmed online delivery from Doon Coding Academy.",
    url: `${SITE.url}/online-courses`,
    type: "website",
    siteName: "Doon Coding Academy",
  },
  twitter: {
    card: "summary_large_image",
    title: "Online Coding Courses in India",
    description:
      "Explore coding courses with currently confirmed online delivery from Doon Coding Academy.",
  },
  alternates: { canonical: `${SITE.url}/online-courses` },
};

export default function OnlineCoursesPage() {
  const courses = getCourses();
  const onlineCourses = courses.filter((course) => isCourseModeAvailable(course, "Online"));

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white pt-10 pb-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            Online Coding Courses in India
          </h1>
          <p className="text-lg md:text-xl max-w-3xl mx-auto text-blue-100">
            Explore courses with confirmed online delivery. Review each course page for curriculum,
            duration, and package or monthly pricing.
          </p>
          <p className="mt-3 text-sm text-blue-100">
            Contact DCA to confirm current online delivery details.
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
                      Level: {course.level} ·{" "}
                      Duration: {formatCourseDuration(course.duration)} · Fees: {formatCoursePrice(course.pricing)}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Delivery: {formatCourseModes(course)}
                    </p>
                  </div>
                  <div className="shrink-0 self-start sm:self-center">
                    <Button href={`/online-courses/${course.slug}`} size="md">View</Button>
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
              { "@type": "ListItem", position: 2, name: "Online Coding Courses in India", item: "https://dooncodingacademy.in/online-courses" }
            ]
          })
        }}
      />
    </div>
  );
}
