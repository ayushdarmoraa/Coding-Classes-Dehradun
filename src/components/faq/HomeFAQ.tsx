"use client";

import { useState } from "react";
import Link from "next/link";

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

export default function HomeFAQ() {
  const faqs = [
    {
      q: "Do you offer online coding classes across India?",
      a: (
        <>
          Yes. We run live online cohorts with recordings for{" "}
          <Link className="text-blue-600 underline underline-offset-2" href="/online-courses/full-stack">
            Full-Stack
          </Link>
          ,{" "}
          <Link className="text-blue-600 underline underline-offset-2" href="/online-courses/data-science">
            Data Science &amp; AI
          </Link>
          ,{" "}
          <Link className="text-blue-600 underline underline-offset-2" href="/online-courses/python">
            Python
          </Link>
          , and{" "}
          <Link className="text-blue-600 underline underline-offset-2" href="/online-courses/java">
            Java
          </Link>
          . Join from anywhere in India.
        </>
      ),
    },
    {
      q: "Are classes live or recorded?",
      a: (
        <>
          Sessions are live with mentors, and every class is recorded so you can revise in your own time. We also run
          weekly doubt-clearing and project review slots.
        </>
      ),
    },
    {
      q: "Where is your Dehradun campus?",
      a: (
        <>
          We’re in Herbertpur, Dehradun (near DR School). Local students can choose on-campus or hybrid; others can
          attend the same cohorts online. See{" "}
          <Link className="text-blue-600 underline underline-offset-2" href="/locations/dehradun">
            directions &amp; details
          </Link>
          .
        </>
      ),
    },
    {
      q: "What are the fees for each course?",
      a: (
        <>
          Typical ranges: Full-Stack ₹25,000; Data Science ₹30,000; Python ₹12,000; Java ₹12,000. See each syllabus for
          the latest pricing:{" "}
          <Link className="text-blue-600 underline underline-offset-2" href="/courses/full-stack">
            Full-Stack (On-Campus)
          </Link>
          ,{" "}
          <Link className="text-blue-600 underline underline-offset-2" href="/courses/data-science">
            Data Science (On-Campus)
          </Link>
          ,{" "}
          <Link className="text-blue-600 underline underline-offset-2" href="/courses/python">
            Python (On-Campus)
          </Link>
          ,{" "}
          <Link className="text-blue-600 underline underline-offset-2" href="/courses/java">
            Java (On-Campus)
          </Link>
          .
        </>
      ),
    },
    {
      q: "How long are the programs?",
      a: (
        <>
          Full-Stack &amp; Data Science ~6 months; Python &amp; Java ~4 months. All tracks include hands-on projects and
          assessments.
        </>
      ),
    },
  ];

  // one-open-at-a-time, first item open by default
  const [openIdx, setOpenIdx] = useState<number>(0);

  return (
    <section className="mx-auto max-w-5xl px-4 py-12" aria-labelledby="home-faq-heading">
      <div className="mx-auto mb-8 max-w-2xl text-center">
        <h2 id="home-faq-heading" className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          Frequently Asked Questions
        </h2>
        <p className="mt-3 text-base text-gray-600">
          Quick answers about on-campus and online cohorts. Still unsure?{" "}
          <Link href="/contact" className="text-blue-600 underline underline-offset-2">
            Talk to us
          </Link>
          .
        </p>
      </div>

      <ul className="space-y-3">
        {faqs.map((item, i) => {
          const isOpen = openIdx === i;
          return (
            <li key={i} className="rounded-2xl border border-gray-200 bg-white shadow-sm">
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`faq-panel-${i}`}
                onClick={() => setOpenIdx(isOpen ? -1 : i)}
                className="flex w-full items-center justify-between gap-4 rounded-2xl px-5 py-4 text-left"
              >
                <span className="text-lg font-semibold leading-6">{item.q}</span>
                <span className="text-gray-500">
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
                <div className="min-h-0 overflow-hidden text-gray-700">
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
          className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium shadow-sm hover:bg-gray-50"
        >
          View all FAQs
        </Link>
        <Link
          href="/online-courses"
          className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
        >
          Explore online courses
        </Link>
        <Link
          href="/courses"
          className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-black"
        >
          Explore on-campus courses
        </Link>
      </div>
    </section>
  );
}
