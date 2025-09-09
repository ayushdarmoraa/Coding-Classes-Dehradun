import type { Metadata } from "next";
import Script from "next/script";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

// Build apex base URL: https + no trailing slash + drop www
const RAW_BASE = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
const BASE = RAW_BASE.replace(/^http:\/\//, "https://");
const APEX = BASE.replace(/^https:\/\/www\./, "https://");

const PAGE_URL = `${APEX}/online-courses/java`;

export const metadata: Metadata = {
  title: "Online Java Course in India (Live + Projects)",
  description:
    "Live online Java for India-wide learners. Small batches, hands-on projects, recordings, mentor hours, and career support.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "Online Java Course in India (Live + Projects)",
    description:
      "Live online Java for India-wide learners. Small batches, hands-on projects, recordings, mentor hours, and career support.",
    url: PAGE_URL,
    type: "website",
    siteName: "Doon Coding Academy",
  },
  twitter: {
    card: "summary_large_image",
    title: "Online Java Course in India (Live + Projects)",
    description:
      "Live online Java for India-wide learners. Small batches, hands-on projects, recordings, mentor hours, and career support.",
  },
};

export default function JavaOnlinePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: "Online Java Course (Live + Projects)",
    description:
      "Live online Java for India-wide learners. Small batches, hands-on projects, recordings, mentor hours, and career support.",
    provider: {
      "@type": "Organization",
      name: "Doon Coding Academy",
      url: "https://dooncodingacademy.in",
    },
    offers: {
      "@type": "Offer",
      price: "12000",
      priceCurrency: "INR",
    },
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "Online",
      instructor: { "@type": "Person", name: "Ayush Darmora" },
    },
  };

  return (
    <div className="min-h-screen">
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Online Java Course in India <span className="text-blue-600">(Live + Projects)</span>
          </h1>
          <p className="mt-4 text-lg text-gray-700">
            Learn core Java, OOP, collections, JDBC, and hands-on project work in a live online cohort.
            Every session includes recordings, mentor hours, and weekly feedback so you keep progressing.
          </p>

          <div className="mt-8 grid md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900">At a glance</h2>
              <ul className="mt-3 space-y-2 text-gray-700 text-sm">
                <li>✅ Mode: <strong>Online (Live)</strong> + recordings</li>
                <li>✅ Duration: <strong>4 months</strong></li>
                <li>✅ Fees: <strong>₹12,000</strong></li>
                <li>✅ Support: mentor hours, project reviews, interview prep</li>
              </ul>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900">What you’ll learn</h2>
              <ul className="mt-3 space-y-2 text-gray-700 text-sm">
                <li>• Java syntax, OOP, exceptions, generics</li>
                <li>• Collections, streams, I/O</li>
                <li>• JDBC & basic persistence concepts</li>
                <li>• Build-and-run projects with modern tooling</li>
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

      <Script
        id="jsonld-course-java-online"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <script
        id="breadcrumbs-online-courses-java"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://dooncodingacademy.in" },
              { "@type": "ListItem", position: 2, name: "Online Courses", item: "https://dooncodingacademy.in/online-courses" },
              { "@type": "ListItem", position: 3, name: "Online Java Course in India (Live + Projects)", item: "https://dooncodingacademy.in/online-courses/java" }
            ]
          })
        }}
      />
    </div>
  );
}
