import type { Metadata } from "next";
import Script from "next/script";
import Button from "@/components/ui/Button";

const RAW = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
const SITE = RAW.replace(/^http:\/\//, "https://").replace(/^https:\/\/www\./, "https://");
const CANONICAL = `${SITE}/online-courses/python`;

export const metadata: Metadata = {
  title: "Online Python Course in India (Live + Projects)",
  description:
    "Live online Python for India-wide learners. Small batches, hands-on projects, recordings, mentor hours, and career support.",
  alternates: { canonical: CANONICAL },
  openGraph: {
    title: "Online Python Course in India (Live + Projects)",
    description:
      "Live online Python for India-wide learners. Small batches, hands-on projects, recordings, mentor hours, and career support.",
    url: CANONICAL,
    type: "website",
    siteName: "Doon Coding Academy",
  },
  twitter: {
    card: "summary_large_image",
    title: "Online Python Course in India (Live + Projects)",
    description:
      "Live online Python for India-wide learners. Small batches, hands-on projects, recordings, mentor hours, and career support.",
  },
};

export default function OnlinePythonPage() {
  const ld = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: "Online Python Programming (Live)",
    description:
      "Live online Python program with projects, mentor hours, recordings, and placement support for India-wide learners.",
    provider: { "@type": "Organization", name: "Doon Coding Academy", url: SITE },
    offers: { "@type": "Offer", price: "12000", priceCurrency: "INR" },
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "Online",
      instructor: { "@type": "Person", name: "Ayush Darmora" },
    },
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl md:text-4xl font-bold mb-4">
        Online Python Course in India (Live + Projects)
      </h1>
      <p className="text-lg text-gray-700 mb-6">
        Learn Python live online from anywhere in India. Small batches, weekly projects,
        mentor hours, and recordings so you never fall behind.
      </p>

      <div className="flex gap-3 mb-10">
        <Button href="/contact" size="lg" variant="primary">Talk to a Mentor</Button>
        <Button href="/courses/python" size="lg" variant="secondary">On-Campus (Dehradun)</Button>
      </div>

      <Script
        id="ld-course-python"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
      />
    </div>
  );
}
