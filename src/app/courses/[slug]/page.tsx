import type { Metadata } from "next";
import Script from "next/script";
import { getCourseBySlug, getCourses } from "@/lib/courses";
import Breadcrumbs from "@/components/Breadcrumbs";
import Badge from "@/components/ui/Badge";
import CourseCard from "@/components/features/CourseCard";

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const course = getCourseBySlug(params.slug);
  if (!course) return { title: "Course Not Found | Doon Coding Academy" };

  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const url = `${base.replace(/\/$/, "")}/courses/${course.slug}`;

  return {
    title: `${course.title} | Doon Coding Academy`,
    description: course.description,
    alternates: { canonical: url },
    openGraph: {
      title: course.title,
      description: course.description,
      url,
      type: "article",
      siteName: "Doon Coding Academy",
    },
  };
}

export default function CoursePage({ params }: Props) {
  const course = getCourseBySlug(params.slug);

  if (!course) {
    return (
      <main className="container mx-auto py-8">
        <h1 className="text-2xl font-bold">Course not found</h1>
      </main>
    );
  }

  const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "Doon Coding Academy";
  const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  const courseUrl = `${SITE_URL}/courses/${course.slug}`;

  // JSON-LD: Course
  const courseJsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.title,
    description: course.description,
    provider: {
      "@type": "Organization",
      name: SITE_NAME,
      sameAs: SITE_URL,
    },
    url: courseUrl,
  };

  // JSON-LD: BreadcrumbList
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Courses", item: `${SITE_URL}/courses` },
      { "@type": "ListItem", position: 3, name: course.title, item: courseUrl },
    ],
  };

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Courses", href: "/courses" },
    { label: course.title, href: `/courses/${course.slug}` },
  ];

  // Related courses using existing data/components
  const all = getCourses();
  const related = all.filter((c) => c.slug !== course.slug).slice(0, 3);

  return (
    <main className="container mx-auto py-8">
      <Breadcrumbs items={breadcrumbs} />

      {/* Hero */}
      <header className="mb-6">
        <h1 className="text-3xl md:text-4xl font-extrabold mb-3">{course.title}</h1>
        <p className="text-gray-700 max-w-3xl">{course.description}</p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Badge variant="success" className="bg-green-500 text-white">Duration: {course.duration}</Badge>
          <Badge variant="primary">Fees: {course.price}</Badge>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <a
            href="/contact"
            className="inline-flex items-center rounded-xl bg-blue-700 px-4 py-2 text-white text-sm font-semibold shadow-sm hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-blue-700/30"
          >
            Get a free consultation
          </a>
          <a
            href="https://wa.me/917037905464?text=Hi%2C%20I%27m%20interested%20in%20the%20{{course}}%20course"
            className="inline-flex items-center rounded-xl border border-blue-700 px-4 py-2 text-blue-700 text-sm font-semibold hover:bg-blue-700/5 focus:outline-none focus:ring-2 focus:ring-blue-700/20"
          >
            Chat on WhatsApp
          </a>
        </div>

        {/* In-page nav */}
        <nav className="mt-6">
          <div className="rounded-2xl bg-gray-50 ring-1 ring-gray-200 p-3">
            <div className="flex flex-wrap gap-2">
              <a href="#overview" className="text-sm font-medium text-blue-700 hover:underline">Overview</a>
              <span aria-hidden="true" className="text-gray-300">•</span>
              <a href="#curriculum" className="text-sm font-medium text-blue-700 hover:underline">Curriculum</a>
              <span aria-hidden="true" className="text-gray-300">•</span>
              <a href="#prereq" className="text-sm font-medium text-blue-700 hover:underline">Prerequisites</a>
              <span aria-hidden="true" className="text-gray-300">•</span>
              <a href="#outcomes" className="text-sm font-medium text-blue-700 hover:underline">Outcomes</a>
              <span aria-hidden="true" className="text-gray-300">•</span>
              <a href="#faqs" className="text-sm font-medium text-blue-700 hover:underline">FAQs</a>
            </div>
          </div>
        </nav>
      </header>

      {/* Overview */}
      <section id="overview" className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">Overview</h2>
        <p className="text-gray-700">
          This program is designed to be hands-on and outcome-focused. You’ll build portfolio-ready work,
          get mentor feedback, and prepare for real roles.
        </p>
      </section>

      {/* Curriculum */}
      <section id="curriculum" className="mt-8">
        <h2 className="text-2xl font-semibold mb-2">Curriculum</h2>
        <ul className="list-disc ml-6 space-y-1">
          {course.curriculum.map((topic, idx) => (
            <li key={idx}>{topic}</li>
          ))}
        </ul>
      </section>

      {/* Prerequisites */}
      <section id="prereq" className="mt-8">
        <h2 className="text-2xl font-semibold mb-2">Prerequisites</h2>
        <ul className="list-disc ml-6 space-y-1">
          {course.prerequisites.map((pre, idx) => (
            <li key={idx}>{pre}</li>
          ))}
        </ul>
      </section>

      {/* Outcomes */}
      <section id="outcomes" className="mt-8">
        <h2 className="text-2xl font-semibold mb-2">Outcomes</h2>
        <ul className="list-disc ml-6 space-y-1">
          {course.outcomes.map((outcome, idx) => (
            <li key={idx}>{outcome}</li>
          ))}
        </ul>
      </section>

      {/* Mini FAQs (generic, safe defaults) */}
      <section id="faqs" className="mt-10">
        <h2 className="text-2xl font-semibold mb-2">FAQs</h2>
        <div className="space-y-3">
          <details className="group rounded-2xl bg-gray-50 ring-1 ring-gray-200 open:ring-blue-700/30">
            <summary className="cursor-pointer list-none select-none p-4 font-semibold">
              Do I need prior experience?
            </summary>
            <div className="px-4 pb-4 text-gray-700">
              {course.slug === "full-stack" ? "No. We start from fundamentals and move to advanced topics." :
               course.slug === "data-science" ? "Some comfort with basics is helpful, but we cover Python quickly." :
               "No—this track is beginner-friendly."}
            </div>
          </details>
          <details className="group rounded-2xl bg-gray-50 ring-1 ring-gray-200">
            <summary className="cursor-pointer list-none select-none p-4 font-semibold">
              Are payment plans available?
            </summary>
            <div className="px-4 pb-4 text-gray-700">
              Yes, monthly and one-time options are available. Contact us and we’ll guide you.
            </div>
          </details>
          <details className="group rounded-2xl bg-gray-50 ring-1 ring-gray-200">
            <summary className="cursor-pointer list-none select-none p-4 font-semibold">
              Will I build real projects?
            </summary>
            <div className="px-4 pb-4 text-gray-700">
              Absolutely. Our approach is project-first so you leave with portfolio work.
            </div>
          </details>
        </div>
      </section>

      {/* Related Courses */}
      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="text-2xl font-semibold mb-3">Related courses</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {related.map((c, idx) => (
              <CourseCard key={c.id} course={c} featured={idx === 0} />
            ))}
          </div>
        </section>
      )}

      {/* JSON-LD */}
      <Script
        id="course-jsonld"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseJsonLd) }}
      />
      <Script
        id="breadcrumb-jsonld"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
    </main>
  );
}


