import type { Metadata } from "next";
import Script from "next/script";
import Button from "@/components/ui/Button";
import Link from "next/link";

// Build apex base URL (https, no trailing slash, no www)
const RAW = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
const SITE = RAW.replace(/^http:\/\//, "https://");
const APEX = SITE.replace(/^https:\/\/www\./, "https://");

const TITLE = "Online Data Science Course in India (Live + Projects)";
const DESC =
  "Live online Data Science & AI for learners across India. Small batches, hands-on projects, recordings, mentor hours, and career support.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: `${APEX}/online-courses/data-science` },
  openGraph: {
    title: TITLE,
    description: DESC,
    url: `${APEX}/online-courses/data-science`,
    type: "website",
    siteName: "Doon Coding Academy",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESC,
  },
};

export default function OnlineDataSciencePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: "Online Data Science & AI (Live)",
    description:
      "Live online Data Science program with projects, mentor hours, recordings, and placement support for India-wide learners.",
    provider: {
      "@type": "Organization",
      name: "Doon Coding Academy",
      url: APEX,
    },
    offers: {
      "@type": "Offer",
      price: "30000",
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
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white pt-10 pb-16">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-5 leading-tight">
            Online Data Science &amp; AI
            <br />
            <span className="text-blue-200">Live + Projects</span>
          </h1>
          <p className="text-lg md:text-xl text-blue-100 max-w-3xl mx-auto">
            Learn Python, data wrangling, visualization, ML fundamentals, and project workflows.
            Includes live classes, recordings, mentor hours, and structured career support. {" "}
            <Link href="/courses/data-science" className="underline text-yellow-200 hover:text-white">Prefer on-campus? See Dehradun Data Science</Link>
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
            <Button href="/contact" size="lg" className="bg-yellow-400 text-blue-900 font-semibold hover:bg-yellow-500">
              Talk to a Mentor
            </Button>
            <Button
              href="/courses/data-science"
              size="lg"
              className="!bg-transparent border-2 border-white text-white font-semibold hover:bg-white hover:text-blue-600 transition"
            >
              View Offline/Hybrid Syllabus
            </Button>
          </div>
        </div>
      </section>

      {/* Key points */}
      <section className="py-12">
        <div className="max-w-5xl mx-auto px-4 grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
            <h2 className="text-xl font-semibold mb-2">Who it’s for</h2>
            <p className="text-gray-700">
              Beginners or upskillers aiming for analyst/ML roles who prefer structured, live cohorts with feedback.
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
            <h2 className="text-xl font-semibold mb-2">What you’ll learn</h2>
            <p className="text-gray-700">
              Python, NumPy, Pandas, cleaning, Viz, basic stats, simple ML, and a capstone portfolio project.
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
            <h2 className="text-xl font-semibold mb-2">Cohort format</h2>
            <p className="text-gray-700">
              6 months · small batches · live + recordings · weekly mentor hours · project reviews · placement help.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="pb-12 -mt-4">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-sm text-blue-600 mb-3">Explore offline + other cities</p>
          <Link href="/locations" className="inline-block underline text-blue-700">See campus & cities</Link>
        </div>
      </section>

      {/* JSON-LD */}
      <Script id="course-jsonld-data-science" type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify(jsonLd)}
      </Script>

      <script
        id="breadcrumbs-online-courses-data-science"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://dooncodingacademy.in" },
              { "@type": "ListItem", position: 2, name: "Online Courses", item: "https://dooncodingacademy.in/online-courses" },
              { "@type": "ListItem", position: 3, name: "Online Data Science & AI Live + Projects", item: "https://dooncodingacademy.in/online-courses/data-science" }
            ]
          })
        }}
      />
    </div>
  );
}
