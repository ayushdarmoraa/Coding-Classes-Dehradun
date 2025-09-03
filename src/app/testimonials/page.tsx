import { testimonials } from "@/lib/testimonials";
import { generateTestimonialSchema } from "@/lib/schema";
import Script from "next/script";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Student Testimonials",
  description:
    "Read what our students have to say about Doon Coding Academy and their learning experience.",
};

// Helpers (server-safe, no extra deps)
function avgRating(list: typeof testimonials) {
  const rated = list.filter(t => typeof t.rating === "number");
  if (rated.length === 0) return { avg: null as number | null, count: 0 };
  const sum = rated.reduce((s, t) => s + (t.rating as number), 0);
  return { avg: +(sum / rated.length).toFixed(1), count: rated.length };
}
function formatMonthYear(iso?: string) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
}

// Map display names in testimonials → your course route slugs
const COURSE_SLUGS: Record<string, string> = {
  "Full-Stack with Gen AI": "full-stack",
  "Full-Stack Development (MERN + Gen AI)": "full-stack",
  "Data Science & AI": "data-science",
  Python: "python",
  "Python Programming": "python",
  Java: "java",
  "Java Programming": "java",
};

function courseHref(name?: string) {
  if (!name) return null;
  const slug = COURSE_SLUGS[name.trim()];
  return slug ? `/courses/${slug}` : null;
}

// Optional: AggregateRating JSON-LD (complements your existing review schema)
function buildAggregateRatingJSONLD() {
  const { avg, count } = avgRating(testimonials);
  if (!avg || !count) return null;
  return {
    "@context": "https://schema.org",
    "@type": "AggregateRating",
    itemReviewed: {
      "@type": "Organization",
      name: "Doon Coding Academy",
    },
    ratingValue: String(avg),
    bestRating: "5",
    ratingCount: String(count),
  };
}

export default function TestimonialsPage() {
  const testimonialSchema = generateTestimonialSchema(testimonials);
  const aggregateSchema = buildAggregateRatingJSONLD();

  // Derive a featured one (first), then the rest
  const [featured, ...rest] = testimonials;

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Hero */}
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          Student Testimonials
        </h1>
        <p className="mt-3 max-w-3xl text-gray-600">
          Real words from learners in our Full-Stack with Gen&nbsp;AI, Data Science,
          Python, and Java programs. No stock photos, just authentic experiences.
        </p>

        {/* Stats / Aggregate line (renders only if ratings exist) */}
        {(() => {
          const { avg, count } = avgRating(testimonials);
          if (!avg || !count) return null;
          return (
            <div className="mt-4 inline-flex items-center gap-3 rounded-full border px-4 py-1.5 text-sm text-gray-700">
              <span className="font-semibold">{avg}/5</span>
              <span aria-hidden="true">•</span>
              <span>Based on {count} student ratings</span>
            </div>
          );
        })()}
      </header>

      {/* Featured card */}
      {featured && (
        <section className="mb-6">
          <article className="rounded-xl border bg-white p-6 shadow-sm">
            <p className="text-lg italic text-gray-800">
              &quot;{featured.text}&quot;
            </p>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <p className="font-semibold">— {featured.author}</p>
              <div className="flex items-center gap-2 text-sm">
                {featured.course && (() => {
                  const href = courseHref(featured.course);
                  const Chip = (
                    <span className="rounded-full bg-blue-50 px-3 py-1 font-medium text-blue-700 hover:bg-blue-100">
                      {featured.course}
                    </span>
                  );
                  return href ? (
                    <Link href={href} className="inline-block" prefetch>
                      {Chip}
                    </Link>
                  ) : (
                    Chip
                  );
                })()}
                {formatMonthYear(featured.datePublished) && (
                  <span className="text-gray-500">
                    {formatMonthYear(featured.datePublished)}
                  </span>
                )}
              </div>
            </div>
          </article>
        </section>
      )}

      {/* Grid of the rest */}
      <section className="space-y-4">
        {rest.map((t, i) => (
          <article
            key={i}
            className="rounded-xl border bg-white p-6 shadow-sm"
          >
            <p className="italic text-gray-800">&quot;{t.text}&quot;</p>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <p className="font-semibold">— {t.author}</p>
              <div className="flex items-center gap-2 text-sm">
                {t.course && (() => {
                  const href = courseHref(t.course);
                  const Chip = (
                    <span className="rounded-full bg-blue-50 px-3 py-1 font-medium text-blue-700 hover:bg-blue-100">
                      {t.course}
                    </span>
                  );
                  return href ? (
                    <Link href={href} className="inline-block" prefetch>
                      {Chip}
                    </Link>
                  ) : (
                    Chip
                  );
                })()}
                {formatMonthYear(t.datePublished) && (
                  <span className="text-gray-500">
                    {formatMonthYear(t.datePublished)}
                  </span>
                )}
              </div>
            </div>
          </article>
        ))}
      </section>

      {/* Simple CTA row */}
      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href="/courses"
          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Explore Courses
        </Link>
        <a
          href="https://wa.me/917037905464"
          className="rounded-lg border border-blue-600 px-4 py-2 text-blue-700 hover:bg-blue-50"
        >
          Chat on WhatsApp
        </a>
        <Link
          href="/contact"
          className="rounded-lg border px-4 py-2 text-gray-700 hover:bg-gray-50"
        >
          Contact Us
        </Link>
      </div>

      {/* JSON-LD: individual reviews */}
      <Script
        id="testimonial-jsonld"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(testimonialSchema),
        }}
      />

      {/* JSON-LD: aggregate rating (if available) */}
      {aggregateSchema && (
        <Script
          id="aggregate-rating-jsonld"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(aggregateSchema),
          }}
        />
      )}
    </div>
  );
}


