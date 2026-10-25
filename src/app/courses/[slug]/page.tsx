import type { Metadata } from "next";
import Link from "next/link";
import TrackedLink from "@/components/analytics/TrackedLink";
import { notFound } from "next/navigation";

import { getCourseBySlug, isCourseModeAvailable } from "@/lib/courses";
import { getAllBlogPosts } from "@/lib/blog";
import Breadcrumbs from "@/components/Breadcrumbs";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import LearningProgressionNote from "@/components/features/LearningProgressionNote";
import { getCourseJsonLd } from "@/lib/schema";
import { formatCourseDuration, formatCourseModes, formatCoursePrice } from "@/lib/pricing";
import { SITE } from "@/lib/site-config";

type Props = { params: { slug: string } };

// Map course slugs → featured blog slugs (always show these first in Further reading)
const featuredPostsByCourse: Record<string, string[]> = {
  "full-stack": ["best-full-stack-course-dehradun-2025"],
  "data-science": ["data-science-course-dehradun-2025"],
  python: ["python-course-dehradun-fees-syllabus-jobs-2025"],
  java: ["java-course-dehradun-2025"],
};

/* --------------------------- METADATA (per course) -------------------------- */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const course = getCourseBySlug(params.slug);
  if (!course) return { title: "Course Not Found | Doon Coding Academy" };

  const url = `${SITE.url}/courses/${course.slug}`;

  if (course.slug === "full-stack") {
    return {
      title: "Full-Stack Development Course | Doon Coding Academy",
      description:
        "Explore the Full-Stack Development curriculum, duration, fees, and course details at Doon Coding Academy.",
      alternates: { canonical: url },
      openGraph: {
        title: "Full Stack Development Course in Dehradun (2025)",
        description:
          "Review the MERN, React, Node.js, and Gen AI topics in the Full-Stack Development curriculum.",
        url,
        type: "article",
        siteName: "Doon Coding Academy",
      },
      twitter: {
        card: "summary",
        title: "Full Stack Course in Dehradun (MERN + Gen AI)",
        description:
          "Explore the Full-Stack Development curriculum and course details.",
      },
    };
  }

  if (course.slug === "data-science") {
    return {
      title: "Data Science & AI Course Details | Doon Coding Academy",
      description:
        "Review the Data Science & AI curriculum and course details at Doon Coding Academy.",
      alternates: { canonical: url },
      openGraph: {
        title: "Data Science & AI Course Details",
        description:
          "Review the Data Science & AI curriculum and course details.",
        url,
        type: "article",
        siteName: "Doon Coding Academy",
      },
      twitter: {
        card: "summary",
        title: "Data Science & AI Course Details",
        description:
          "Review the Data Science & AI curriculum and course details.",
      },
    };
  }

  if (course.slug === "python") {
    return {
      title: "Python Course in Dehradun | Doon Coding Academy",
      description:
        "Explore the Python Programming curriculum, duration, fees, and course details at Doon Coding Academy.",
      alternates: { canonical: url },
      openGraph: {
        title: "Python Programming Classes in Dehradun",
        description:
          "Review the Python Programming curriculum and course details.",
        url,
        type: "article",
        siteName: "Doon Coding Academy",
      },
      twitter: {
        card: "summary",
        title: "Python Course in Dehradun",
        description:
          "Explore the Python course curriculum and program details.",
      },
    };
  }

  return {
    title: `${course.title} | Doon Coding Academy`,
    description: course.description,
    alternates: { canonical: url },
  };
}

/* ------------------------------ PAGE COMPONENT ------------------------------ */
export default async function CoursePage({ params }: Props) {
  const course = getCourseBySlug(params.slug);
  if (!course) notFound();

  const base = SITE.url;
  const pageUrl = `${base}/courses/${course.slug}`;

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${base}/` },
      { "@type": "ListItem", position: 2, name: "Courses", item: `${base}/courses` },
      { "@type": "ListItem", position: 3, name: course.title, item: pageUrl },
    ],
  };

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Courses", href: "/courses" },
    { label: course.title, href: `/courses/${course.slug}` },
  ];

  // Mapping for offline → online cross-links
  const { slug } = params;
  const ONLINE_TARGETS: Record<string, string> = {
    "full-stack": "/online-courses/full-stack",
    "data-science": "/online-courses/data-science",
    python: "/online-courses/python",
    java: "/online-courses/java",
  };
  const onlineTarget = isCourseModeAvailable(course, "Online")
    ? ONLINE_TARGETS[slug]
    : undefined;

  const priceText = formatCoursePrice(course.pricing);
  const durationText = formatCourseDuration(course.duration);

  // FAQs (immutable)
  const baseFaqs: Array<{ q: string; a: string }> = [
    {
      q: `What is the duration of the ${course.title}?`,
      a: durationText
        ? `The typical duration is ${durationText}.`
        : `The course duration varies by batch schedule. Contact us for the current plan.`,
    },
    {
      q: `What are the fees for the ${course.title}?`,
      a: priceText
        ? `The fee is ${priceText}. Flexible monthly options are available.`
        : `Fees depend on the current batch and offers. Please contact us for the latest fee structure.`,
    },
    {
      q: "How can I confirm current learner support?",
      a: "Contact the academy directly for details about currently available support.",
    },
    {
      q: "Is prior programming experience required?",
      a: "Your starting learning stage depends on your current skills and goals, and you can progress at your own pace.",
    },
  ];

  const extraFaqs: Array<{ q: string; a: string }> =
    course.slug === "full-stack"
      ? [
          {
            q: "Which stack is covered?",
            a: "MERN (MongoDB, Express, React, Node.js) with Generative AI integrations and deployment basics.",
          },
        ]
      : course.slug === "data-science"
      ? [
          {
            q: "Which tools/libraries are covered?",
            a: "Python, NumPy, Pandas, Matplotlib, scikit-learn, and intro to AI/ML workflows with real datasets.",
          },
        ]
      : course.slug === "python"
      ? [
          {
            q: "What will I be able to build?",
            a: "CLI utilities, data processing scripts, and small apps using files/JSON and OOP concepts.",
          },
        ]
      : course.slug === "java"
      ? [
          {
            q: "Does it include Spring Boot?",
            a: "Yes. We cover Core Java foundations and an introduction to Spring Boot with real-world practices.",
          },
        ]
      : [];

  const faqs = [...baseFaqs, ...extraFaqs];
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${pageUrl}#faq`,
    mainEntity: faqs.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };

  const uiBreadcrumbs = <Breadcrumbs items={breadcrumbs} />;
  const courseJsonLd = getCourseJsonLd(course, {
    variant: "offline",
    city: "Dehradun",
    pathPrefix: "courses",
  });

  return (
    <main className="container mx-auto py-8">
      {uiBreadcrumbs}

      {/* JSON-LD (Breadcrumbs, Course, FAQ) */}
      <script id="course-breadcrumb" type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      {courseJsonLd && (
        <script
          id="course-structured-data"
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(courseJsonLd) }}
        />
      )}
      <script id="course-faq-schema" type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      {/* Hero */}
      <header className="mb-6">
        <h1 className="text-3xl md:text-4xl font-extrabold mb-3">{course.title}</h1>
        {course.level && (
          <p className="mb-3 text-sm font-medium text-gray-700">
            Learning stage: {course.level}
          </p>
        )}
        <p className="text-gray-700 max-w-3xl">
          {course.description}{" "}
          {onlineTarget && (
            <TrackedLink
              href={onlineTarget}
              event="cta_enroll_click"
              eventParams={{ page_type: 'offline_course', course_slug: course.slug, city: 'dehradun', variant: 'inline_online_crosslink' }}
              className="underline text-blue-700 hover:text-blue-800"
            >
              View online course details
            </TrackedLink>
          )}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Badge variant="success" className="bg-green-500 text-white">Duration: {durationText}</Badge>
          <Badge variant="primary">Fees: {priceText}</Badge>
          <Badge variant="info">Delivery: {formatCourseModes(course)}</Badge>
        </div>
        <LearningProgressionNote className="mt-3 text-gray-600" />

        <div className="mt-4 flex flex-wrap gap-3">
          <Button
            href="/contact"
            event="cta_enroll_click"
            eventParams={{ page_type: 'offline_course', course_slug: course.slug, city: 'dehradun', variant: 'hero_consultation' }}
            className="inline-flex items-center rounded-xl bg-blue-700 px-4 py-2 text-white text-sm font-semibold shadow-sm hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-blue-700/30"
          >
            Contact us about this course
          </Button>
          <Button
            href="https://wa.me/917037905464?text=Hi%2C%20I%27m%20interested%20in%20the%20${course.slug}%20course"
            event="lead_contact_click"
            eventParams={{ channel: 'whatsapp', page_type: 'offline_course', course_slug: course.slug, city: 'dehradun', variant: 'hero_whatsapp' }}
            className="inline-flex items-center rounded-xl border border-blue-700 px-4 py-2 text-blue-700 text-sm font-semibold hover:bg-blue-700/5 focus:outline-none focus:ring-2 focus:ring-blue-700/20"
          >
            Chat on WhatsApp
          </Button>
        </div>

        {/* Offline → Online cross-link (per SEO plan) */}
        {onlineTarget ? (
          <div className="mt-3">
            <Button
              href={onlineTarget}
              variant="secondary"
              size="lg"
              event="cta_enroll_click"
              eventParams={{ page_type: 'offline_course', course_slug: course.slug, city: 'dehradun', variant: 'hero_online_crosslink_button' }}
            >
              Not in Dehradun? View online course details
            </Button>
          </div>
        ) : null}

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
          {course.description}
        </p>
      </section>

      {/* Local SEO: areas served */}
      {isCourseModeAvailable(course, "On-Campus") && <section id="service-areas" className="mt-12 border-t pt-8">
        <h2 className="text-2xl font-semibold mb-2">Serving Dehradun & Nearby</h2>
        <p className="text-gray-700 mb-3">
          Our Herbertpur campus serves students across Dehradun and nearby areas. See{" "}
          <Link href="/locations/dehradun" className="text-blue-700 hover:underline">our Dehradun location</Link>{" "}
          for directions.
        </p>
        <ul className="flex flex-wrap gap-2 text-sm text-gray-700">
          {[
            "Dakpathar","Herbertpur","Paonta-Sahib","Vikasnagar","Sehespur",
            "Selaqui","Suddhowala","Premnagar","Dehradun",
          ].map((place) => (
            <li key={place} className="rounded-full bg-gray-50 px-3 py-1 ring-1 ring-gray-200">{place}</li>
          ))}
        </ul>
        <div className="mt-4">
          <a href="tel:+917037905464" className="text-blue-700 hover:underline">Call +91 7037905464</a>
        </div>
      </section>}

      <section id="curriculum" className="mt-8">
        <h2 className="text-2xl font-semibold mb-2">Course curriculum</h2>
        <ul className="list-disc ml-6 text-gray-700 space-y-1">
          {course.curriculum.map((item, index) => (
            <li key={`${course.id}-curriculum-${index}`}>{item}</li>
          ))}
        </ul>
      </section>

      {onlineTarget && (
        <div className="mt-6">
          <TrackedLink
            href={onlineTarget}
            className="text-blue-700 hover:underline font-medium"
            event="cta_enroll_click"
            eventParams={{ location: "course_detail", course_slug: course.slug, variant: "online_course_details" }}
          >
            View online course details →
          </TrackedLink>
        </div>
      )}

      {course.slug === "full-stack" && (
        <div className="mt-8 space-y-2 text-sm">
          <p className="font-semibold">Compare with other institutes:</p>
          <ul className="list-disc list-inside">
            <li><Link href="/vs/coding-ninjas" className="text-blue-700 hover:underline">DCA vs Coding Ninjas</Link></li>
            <li><Link href="/vs/scaler" className="text-blue-700 hover:underline">DCA vs Scaler</Link></li>
          </ul>
        </div>
      )}
      {/* Prerequisites */}
      <section id="prereq" className="mt-8">
        <h2 className="text-2xl font-semibold mb-2">Prerequisites</h2>
        <ul className="list-disc ml-6 space-y-1">
          {course.prerequisites.map((pre, idx) => <li key={idx}>{pre}</li>)}
        </ul>
      </section>

      {/* Outcomes */}
      <section id="outcomes" className="mt-8">
        <h2 className="text-2xl font-semibold mb-2">Outcomes</h2>
        <ul className="list-disc ml-6 space-y-1">
          {course.outcomes.map((outcome, idx) => <li key={idx}>{outcome}</li>)}
        </ul>
      </section>

      {/* Outcomes CTA augmentation */}
      {isCourseModeAvailable(course, "On-Campus") && <section className="mt-6">
        <p className="text-sm text-gray-600">
          Find directions on the <Link href="/locations/dehradun" className="underline text-blue-700">Dehradun location page</Link>.
        </p>
      </section>}

      {/* FAQs (UI mirrors JSON-LD) */}
      <section id="faqs" className="mt-10">
        <h2 className="text-2xl font-semibold mb-3">Frequently asked questions</h2>
        <dl className="divide-y divide-gray-200 rounded-2xl border">
          {faqs.map((f, i) => (
            <div key={i} className="p-4">
              <dt className="font-medium">{f.q}</dt>
              <dd className="mt-1 text-gray-700">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Further reading */}
      {(() => {
        const allPosts = getAllBlogPosts();
        // Featured first (optional, per-course override); silently skip missing slugs
        const featuredSlugs = featuredPostsByCourse[course.slug] || [];
        const featured = featuredSlugs
          .map((s) => allPosts.find((p) => p.slug === s))
          .filter(Boolean) as ReturnType<typeof getAllBlogPosts>;

        // Dynamic related posts (de-duped against featured)
        const scored = allPosts
          .map(p => {
            const hay = [
              p.title,
              p.description,
              Array.isArray(p.keywords) ? p.keywords.join(" ") : "",
              typeof p.category === "string" ? p.category : ""
            ].join(" ").toLowerCase();
            const score =
              (hay.includes("full") && hay.includes("stack") && course.slug === "full-stack" ? 3 : 0) +
              (hay.includes("data") && hay.includes("science") && course.slug === "data-science" ? 3 : 0) +
              (hay.includes("python") && course.slug === "python" ? 3 : 0) +
              (hay.includes("java") && course.slug === "java" ? 3 : 0) +
              (hay.includes(course.slug) ? 2 : 0) +
              (hay.includes(course.title.toLowerCase()) ? 2 : 0) +
              (hay.includes("fees") ? 1 : 0) +
              (hay.includes("syllabus") ? 1 : 0) +
              (hay.includes("career") || hay.includes("outcomes") ? 1 : 0) +
              (hay.includes("dehradun") ? 1 : 0);
            return { ...p, _score: score };
          })
          .filter(p => p._score > 0 && !featuredSlugs.includes(p.slug))
          .sort((a, b) => b._score - a._score)
          .slice(0, 5);

        const combined = [...featured, ...scored];

        return combined.length > 0 ? (
          <section className="mt-12 border-t pt-8">
            <h2 className="text-2xl font-semibold">Further reading</h2>
            <ul className="mt-4 grid gap-4 sm:grid-cols-2">
              {combined.map(post => (
                <li key={post.slug} className="rounded-2xl border p-4 hover:shadow-md transition-shadow">
                  <h3 className="text-lg font-medium">
                    <Link href={`/blog/${post.slug}`} className="hover:underline">{post.title}</Link>
                  </h3>
                  {post.description && (
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{post.description}</p>
                  )}
                  <div className="mt-3">
                    <Link href={`/blog/${post.slug}`} className="text-primary hover:underline">
                      Read more →
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ) : null;
      })()}

    </main>
  );
}