/* eslint-disable @next/next/no-html-link-for-pages */
/* eslint-disable @next/next/no-html-link-for-pages */
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ — Doon Coding Academy (Dehradun)",
  description:
    "Answers to common questions about our Full-Stack with Gen AI, Data Science, Python, and Java courses in Dehradun—admissions, fees, duration, projects, support, and more.",
  alternates: { canonical: "/faq" },
};

export default function FAQPage() {
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What courses do you offer?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "We offer Full-Stack with Gen AI, Data Science, Python, and Java. See the Courses page for details.",
        },
      },
      {
        "@type": "Question",
        name: "Where are you located?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "Near DR School, Herbertpur, Dehradun, PIN 248142. Contact us or WhatsApp for directions and queries.",
        },
      },
      {
        "@type": "Question",
        name: "What are the fees and payment options?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "Affordable with monthly and one-time plans. Full-Stack with Gen AI: 6 months · ₹25,000 (₹5,000/month). Data Science: 6 months · ₹30,000 (₹6,000/month). Full-Stack (4 months): ₹6,000 (₹2,000/month).",
        },
      },
      {
        "@type": "Question",
        name: "Do I need prior coding experience?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "No. Beginner-friendly tracks start with fundamentals and build up to projects. Experienced learners can pace faster.",
        },
      },
      {
        "@type": "Question",
        name: "Will I build real projects and a portfolio?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "Yes. Our approach is project-first and you’ll build portfolio-ready work in every course.",
        },
      },
      {
        "@type": "Question",
        name: "What is the class format and batch size?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "Instructor-led sessions with hands-on practice, doubt-clearing, and reviews. Small batches for personal attention.",
        },
      },
      {
        "@type": "Question",
        name: "What if I miss a class?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "We help you catch up via summaries and extra practice time. Let us know early so we can support you.",
        },
      },
      {
        "@type": "Question",
        name: "Do you help with internships or placements?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "We focus on skills and portfolio first, and share opportunities plus guidance on resumes, GitHub, and interviews.",
        },
      },
      {
        "@type": "Question",
        name: "How can I get counselling or a demo?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "Message us on WhatsApp (+91 7037905464) or use the Contact page to schedule a quick call.",
        },
      },
    ],
  };
  return (
    <main className="pt-8">
      <section className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold">Frequently Asked Questions</h1>

        <div className="mt-6 space-y-4">
          {/* Courses */}
          <details className="group rounded-2xl bg-white ring-1 ring-gray-200 open:ring-blue-700/30 transition">
            <summary className="cursor-pointer list-none select-none p-5 font-semibold text-lg">
              What courses do you offer?
            </summary>
            <div className="px-5 pb-5 pt-0 text-gray-700">
              We offer{" "}
              <a href="/courses/full-stack" className="text-blue-700 font-semibold hover:underline">
                Full-Stack with Gen AI
              </a>
              ,{" "}
              <a href="/courses/data-science" className="text-blue-700 font-semibold hover:underline">
                Data Science
              </a>
              ,{" "}
              <a href="/courses/python" className="text-blue-700 font-semibold hover:underline">
                Python
              </a>{" "}
              and{" "}
              <a href="/courses/java" className="text-blue-700 font-semibold hover:underline">
                Java
              </a>
              . See the{" "}
              <a href="/courses" className="text-blue-700 font-semibold hover:underline">
                Courses
              </a>{" "}
              page for details.
            </div>
          </details>

          {/* Location */}
          <details className="group rounded-2xl bg-white ring-1 ring-gray-200 open:ring-blue-700/30 transition">
            <summary className="cursor-pointer list-none select-none p-5 font-semibold text-lg">
              Where are you located?
            </summary>
            <div className="px-5 pb-5 pt-0 text-gray-700">
              Near DR School, Herbertpur, Dehradun, PIN 248142. For directions or queries,{" "}
              <a href="/contact" className="text-blue-700 font-semibold hover:underline">
                contact us
              </a>{" "}
              or message us on{" "}
              <a href="https://wa.me/917037905464" className="text-blue-700 font-semibold hover:underline">
                WhatsApp
              </a>
              .
            </div>
          </details>

          {/* Fees */}
          <details className="group rounded-2xl bg-white ring-1 ring-gray-200 open:ring-blue-700/30 transition">
            <summary className="cursor-pointer list-none select-none p-5 font-semibold text-lg">
              What are the fees and payment options?
            </summary>
            <div className="px-5 pb-5 pt-0 text-gray-700">
              We keep pricing <span className="font-semibold">affordable with monthly and one-time payment plans</span>.
              <ul className="mt-2 list-disc pl-5 space-y-1">
                <li>Full-Stack with Gen AI: 6 months · ₹25,000 (or ₹5,000/month)</li>
                <li>Data Science: 6 months · ₹30,000 (or ₹6,000/month)</li>
                <li>Full-Stack (4 months): ₹6,000 (or ₹2,000/month)</li>
              </ul>
              For current offers, please{" "}
              <a href="/contact" className="text-blue-700 font-semibold hover:underline">
                contact us
              </a>
              .
            </div>
          </details>

          {/* Experience */}
          <details className="group rounded-2xl bg-white ring-1 ring-gray-200 open:ring-blue-700/30 transition">
            <summary className="cursor-pointer list-none select-none p-5 font-semibold text-lg">
              Do I need prior coding experience?
            </summary>
            <div className="px-5 pb-5 pt-0 text-gray-700">
              No. Our beginner-friendly tracks start with fundamentals and gradually build up to projects.
              If you already have experience, we’ll help you pace faster.
            </div>
          </details>

          {/* Projects */}
          <details className="group rounded-2xl bg-white ring-1 ring-gray-200 open:ring-blue-700/30 transition">
            <summary className="cursor-pointer list-none select-none p-5 font-semibold text-lg">
              Will I build real projects and a portfolio?
            </summary>
            <div className="px-5 pb-5 pt-0 text-gray-700">
              Yes—our approach is <span className="font-semibold">project-first</span>. You’ll build{" "}
              <span className="font-semibold">portfolio-ready work</span> in every course to showcase to colleges or employers.
            </div>
          </details>

          {/* Format */}
          <details className="group rounded-2xl bg-white ring-1 ring-gray-200 open:ring-blue-700/30 transition">
            <summary className="cursor-pointer list-none select-none p-5 font-semibold text-lg">
              What is the class format and batch size?
            </summary>
            <div className="px-5 pb-5 pt-0 text-gray-700">
              Instructor-led sessions with hands-on practice, doubt-clearing, and reviews. Batch sizes are kept small for{" "}
              <span className="font-semibold">personal attention</span>.
            </div>
          </details>

          {/* Missed class */}
          <details className="group rounded-2xl bg-white ring-1 ring-gray-200 open:ring-blue-700/30 transition">
            <summary className="cursor-pointer list-none select-none p-5 font-semibold text-lg">
              What if I miss a class?
            </summary>
            <div className="px-5 pb-5 pt-0 text-gray-700">
              We provide guidance to catch up via summaries and extra practice time. Reach out early so we can help you stay on track.
            </div>
          </details>

          {/* Placement */}
          <details className="group rounded-2xl bg-white ring-1 ring-gray-200 open:ring-blue-700/30 transition">
            <summary className="cursor-pointer list-none select-none p-5 font-semibold text-lg">
              Do you help with internships or placements?
            </summary>
            <div className="px-5 pb-5 pt-0 text-gray-700">
              We focus on <span className="font-semibold">skills and portfolio</span> first. We share opportunities and guidance on resumes, GitHub, and interviews.
            </div>
          </details>

          {/* Counselling */}
          <details className="group rounded-2xl bg-white ring-1 ring-gray-200 open:ring-blue-700/30 transition">
            <summary className="cursor-pointer list-none select-none p-5 font-semibold text-lg">
              How can I get counselling or a demo?
            </summary>
            <div className="px-5 pb-5 pt-0 text-gray-700">
              Message us on{" "}
              <a href="https://wa.me/917037905464" className="text-blue-700 font-semibold hover:underline">
                WhatsApp
              </a>{" "}
              or use the{" "}
              <a href="/contact" className="text-blue-700 font-semibold hover:underline">
                Contact
              </a>{" "}
              page to schedule a quick call.
            </div>
          </details>
        </div>

        {/* Contact CTA */}
        <div className="mt-10 rounded-2xl border border-blue-700/20 bg-blue-600/5 p-5">
          <p className="font-semibold text-blue-700">
            Still have questions? We’re happy to help.
          </p>
          <div className="mt-3 flex flex-wrap gap-3">
            <a
              href="https://wa.me/917037905464"
              className="inline-flex items-center rounded-xl border border-blue-700 px-4 py-2 text-blue-700 text-sm font-semibold hover:bg-blue-700/5 focus:outline-none focus:ring-2 focus:ring-blue-700/20"
            >
              Chat on WhatsApp
            </a>
            <a
              href="/contact"
              className="inline-flex items-center rounded-xl bg-blue-700 px-4 py-2 text-white text-sm font-semibold shadow-sm hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-blue-700/30"
            >
              Contact Us
            </a>
          </div>

          <div className="mt-4 text-sm text-gray-700">
            Address: Near DR School, Herbertpur, Dehradun, PIN 248142 · Phone:{" "}
            <a href="tel:+917037905464" className="text-blue-700 font-semibold hover:underline">
              +91 7037905464
            </a>{" "}
            · Email:{" "}
            <a
              href="mailto:dooncodingacademy@gmail.com"
              className="text-blue-700 font-semibold hover:underline"
            >
              dooncodingacademy@gmail.com
            </a>
          </div>
        </div>
      </section>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />
    </main>
  );
}


