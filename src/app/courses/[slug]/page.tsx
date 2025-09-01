import type { Metadata } from "next";
import Script from "next/script";
import { getCourseBySlug } from "@/lib/courses";
import Breadcrumbs from "@/components/Breadcrumbs";

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const course = getCourseBySlug(params.slug);
  if (!course) {
    return { title: "Course Not Found | Doon Coding Academy" };
  }

  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const url = `${base}/courses/${course.slug}`;

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

  const SITE_NAME =
    process.env.NEXT_PUBLIC_SITE_NAME || "Doon Coding Academy";
  const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

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
    url: `${SITE_URL}/courses/${course.slug}`,
  };

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Courses", href: "/courses" },
    { label: course.title, href: `/courses/${course.slug}` },
  ];

  return (
    <main className="container mx-auto py-8">
      <Breadcrumbs items={breadcrumbs} />
      <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
      <p className="mb-3">{course.description}</p>

      <p className="mb-1">
        <strong>Duration:</strong> {course.duration}
      </p>
      <p className="mb-4">
        <strong>Price:</strong> {course.price}
      </p>

      <section className="mt-6">
        <h2 className="text-2xl font-semibold mb-2">Curriculum</h2>
        <ul className="list-disc ml-6 space-y-1">
          {course.curriculum.map((topic, idx) => (
            <li key={idx}>{topic}</li>
          ))}
        </ul>
      </section>

      <section className="mt-6">
        <h2 className="text-2xl font-semibold mb-2">Prerequisites</h2>
        <ul className="list-disc ml-6 space-y-1">
          {course.prerequisites.map((pre, idx) => (
            <li key={idx}>{pre}</li>
          ))}
        </ul>
      </section>

      <section className="mt-6">
        <h2 className="text-2xl font-semibold mb-2">Outcomes</h2>
        <ul className="list-disc ml-6 space-y-1">
          {course.outcomes.map((outcome, idx) => (
            <li key={idx}>{outcome}</li>
          ))}
        </ul>
      </section>

      <Script
        id="course-jsonld"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseJsonLd) }}
      />
    </main>
  );
}


