"use client";

import { useState } from "react";
import Link from "next/link";
import type { Course } from "@/lib/courses";
import { formatCourseDuration, formatCourseModes, formatCoursePrice } from "@/lib/pricing";
import { generateFAQPageSchema } from "@/lib/schema";

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className={`h-5 w-5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
    >
      <path
        d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.06l3.71-3.83a.75.75 0 1 1 1.08 1.04l-4.25 4.4a.75.75 0 0 1-1.08 0L5.21 8.27a.75.75 0 0 1 .02-1.06z"
        fill="currentColor"
      />
    </svg>
  );
}

export default function HomeFAQ({ courses }: { courses: Course[] }) {
  const deliveryOptions = courses.map((course) => ({
    course,
    text: `${course.shortTitle}: ${formatCourseModes(course)}`,
  }));
  const courseFees = courses.map((course) => ({
    course,
    text: `${course.shortTitle}: ${formatCoursePrice(course.pricing)}`,
  }));
  const courseDurations = courses.map((course) => ({
    course,
    text: `${course.shortTitle}: ${formatCourseDuration(course.duration)}`,
  }));
  const faqs = [
    {
      q: "What delivery options are available?",
      a: (
        <>
          {deliveryOptions.map(({ course, text }, index) => (
            <span key={course.id}>
              {index > 0 ? "; " : ""}
              {text}
            </span>
          ))}
        </>
      ),
      schemaAnswer: deliveryOptions.map(({ text }) => text).join("; "),
    },
    {
      q: "Are classes live or recorded?",
      a: (
        <>
          Contact us to confirm the current class format for the course you are considering.
        </>
      ),
      schemaAnswer: "Contact us to confirm the current class format for the course you are considering.",
    },
    {
      q: "Where is your Dehradun campus?",
      a: (
        <>
          We’re in Herbertpur (Dehradun district) (near DR School). Explore on-campus courses or online course options. See{" "}
          <Link className="text-brand-dark underline underline-offset-2" href="/locations/dehradun">
            directions &amp; details
          </Link>
          .
        </>
      ),
      schemaAnswer:
        "We’re in Herbertpur (Dehradun district) (near DR School). Explore on-campus courses or online course options. See directions & details.",
    },
    {
      q: "What are the fees for each course?",
      a: (
        <>
          {courseFees.map(({ course }, index) => (
            <span key={course.id}>
              {index > 0 ? "; " : ""}
              <Link className="text-brand-dark underline" href={`/courses/${course.slug}`}>
                {course.shortTitle}
              </Link>
              : {formatCoursePrice(course.pricing)}
            </span>
          ))}
        </>
      ),
      schemaAnswer: courseFees.map(({ text }) => text).join("; "),
    },
    {
      q: "How long are the programs?",
      a: (
        <>
          {courseDurations.map(({ course, text }, index) => (
            <span key={course.id}>
              {index > 0 ? "; " : ""}
              {text}
            </span>
          ))}
        </>
      ),
      schemaAnswer: courseDurations.map(({ text }) => text).join("; "),
    },
  ];
  const faqSchema = generateFAQPageSchema(
    faqs.map(({ q, schemaAnswer }) => ({ question: q, answer: schemaAnswer })),
  );

  // one-open-at-a-time, first item open by default
  const [openIdx, setOpenIdx] = useState<number>(0);

  return (
    <section className="mx-auto max-w-5xl px-4 py-16 md:py-24" aria-labelledby="home-faq-heading">
      <div className="mx-auto mb-8 max-w-2xl text-center">
        <h2 id="home-faq-heading" className="mt-3 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
          Frequently Asked Questions
        </h2>
        <p className="mt-3 text-base text-ink-2">
          Quick answers about on-campus and online cohorts. Still unsure?{" "}
          <Link
            href="/contact"
            className="inline-block rounded-full bg-brand px-3 py-1 text-sm font-medium text-white shadow-sm transition hover:bg-brand-dark"
          >
            Talk to us
          </Link>
        </p>
      </div>

      <ul className="space-y-3">
        {faqs.map((item, i) => {
          const isOpen = openIdx === i;
          return (
            <li key={i} className="surface-card overflow-hidden">
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`faq-panel-${i}`}
                onClick={() => setOpenIdx(isOpen ? -1 : i)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
              >
                <span className="text-lg font-semibold leading-6">{item.q}</span>
                <span className="text-ink-3">
                  <Chevron open={isOpen} />
                </span>
              </button>

              <div
                id={`faq-panel-${i}`}
                role="region"
                className={`grid overflow-hidden px-5 transition-all duration-200 ${
                  isOpen ? "grid-rows-[1fr] py-0 pb-5" : "grid-rows-[0fr]"
                }`}
              >
                <div className="min-h-0 overflow-hidden text-ink-2">
                  <div className="prose prose-sm max-w-none pt-0 leading-relaxed">
                    {item.a}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/faq"
          className="rounded-full border border-brand bg-white px-4 py-2 text-sm font-medium text-brand-dark hover:bg-brand-soft"
        >
          View all FAQs
        </Link>
        <Link
          href="/online-courses"
          className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-dark"
        >
          Explore online courses
        </Link>
        <Link
          href="/courses"
          className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#1d2b45]"
        >
          Explore on-campus courses
        </Link>
      </div>
      <script
        id="home-faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </section>
  );
}
