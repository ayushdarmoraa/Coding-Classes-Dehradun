import type { Metadata } from "next";
import Script from "next/script";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getCourseBySlug } from "@/lib/courses";
import { getAllBlogPosts } from "@/lib/blog";
import Breadcrumbs from "@/components/Breadcrumbs";
import Badge from "@/components/ui/Badge";

type Props = { params: { slug: string } };

/* --------------------------- METADATA (per course) -------------------------- */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const course = getCourseBySlug(params.slug);
  if (!course) return { title: "Course Not Found | Doon Coding Academy" };

  const rawBase = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  const base = rawBase.replace(/^http:\/\//, "https://");
  const url = `${base}/courses/${course.slug}`;

  if (course.slug === "full-stack") {
    return {
      title: "Best Full Stack Development Course in Dehradun (2025) | Doon Coding Academy",
      description:
        "Join Dehradun’s top Full Stack (MERN + Gen AI) course. Affordable fees, 6-month duration, job-ready projects, career guidance & placement support.",
      alternates: { canonical: url },
      openGraph: {
        title: "Full Stack Development Course in Dehradun (2025)",
        description:
          "Hands-on MERN + Gen AI training: MongoDB, Express, React, Node.js, AI tools, real projects, interview prep.",
        url,
        type: "article",
        siteName: "Doon Coding Academy",
      },
      twitter: {
        card: "summary",
        title: "Full Stack Course in Dehradun (MERN + Gen AI)",
        description:
          "Project-first MERN + Gen AI course with affordable fees & placement support.",
      },
    };
  }

  if (course.slug === "data-science") {
    return {
      title: "Data Science Course in Dehradun (2025) | Python, ML, AI | Doon Coding Academy",
      description:
        "Practical Data Science course in Dehradun: Python, Pandas, ML, SQL, Visualization & Gen AI. Real datasets, capstone projects, placement support.",
      alternates: { canonical: url },
      openGraph: {
        title: "Data Science Training in Dehradun (Python • ML • AI)",
        description:
          "Learn Python, Pandas, Scikit-learn, SQL, dashboards & Gen AI. Work on real datasets and career-oriented projects.",
        url,
        type: "article",
        siteName: "Doon Coding Academy",
      },
      twitter: {
        card: "summary",
        title: "Data Science Course in Dehradun (Python • ML • AI)",
        description:
          "Hands-on projects, affordable fees & placement support.",
      },
    };
  }

  if (course.slug === "python") {
    return {
      title: "Python Course in Dehradun (2025) | Beginner to Advanced | Doon Coding Academy",
      description:
        "Best Python course in Dehradun: fundamentals to OOP, libraries, mini-projects & career guidance. Small batches (max 15), affordable fees.",
      alternates: { canonical: url },
      openGraph: {
        title: "Python Programming Classes in Dehradun",
        description:
          "Learn Python step-by-step with projects and mentorship. Ideal for beginners switching to tech.",
        url,
        type: "article",
        siteName: "Doon Coding Academy",
      },
      twitter: {
        card: "summary",
        title: "Python Course in Dehradun (Beginner → Advanced)",
        description:
          "Project-based learning, small batches & mentoring.",
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

  const rawBase = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.dooncodingacademy.in").replace(/\/$/, "");
  const base = rawBase.replace(/^http:\/\//, "https://");
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




  // Helpers used in JSON-LD & FAQs
  const normalize = (v?: string | number) => (v == null ? "" : String(v));
  const priceText = normalize(course.price);
  const durationText = normalize(course.duration);

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
      q: "Do you provide placement assistance?",
      a: "Yes. We offer interview prep, resume reviews, and referrals/assistance through our local network.",
    },
    {
      q: "Is prior programming experience required?",
      a: "No prior experience is required for beginner tracks. We start from fundamentals and progress to projects.",
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

  // Price → number (for Offer)
  const priceNumber = (() => {
    if (!course.price) return undefined;
    const cleaned = String(course.price).replace(/[^\d.]/g, "");
    return cleaned ? Number(cleaned) : undefined;
  })();

  // Human duration → ISO 8601
  const timeRequired = (() => {
    if (!course.duration) return undefined;
    const txt = String(course.duration).toLowerCase();
    const range = txt.match(/(\d+)\s*[–-]\s*(\d+)\s*month/);
    if (range) {
      const upper = parseInt(range[2], 10);
      return `P${isNaN(upper) ? 1 : upper}M`;
    }
    const mm = txt.match(/(\d+)\s*month/);
    if (mm) return `P${parseInt(mm[1], 10)}M`;
    const ww = txt.match(/(\d+)\s*week/);
    if (ww) return `P${parseInt(ww[1], 10) * 7}D`;
    return undefined;
  })();

  // Schedule for CourseInstance (GSC-friendly)
  const schedule = {
    "@type": "Schedule",
    repeatFrequency: "P1W",
    repeatCount: 52,
    byDay: [
      "https://schema.org/Wednesday",
      "https://schema.org/Thursday",
      "https://schema.org/Friday",
      "https://schema.org/Saturday",
      "https://schema.org/Sunday",
    ],
    startTime: "10:00",
    endTime: "19:00",
    scheduleTimezone: "Asia/Kolkata",
    name: "Wed–Sun 10:00–19:00 IST",
  };

  const courseSchema = {
    "@context": "https://schema.org",
    "@type": "Course",
    "@id": `${pageUrl}#course`,
    name: course.title,
    description: course.description,
    url: pageUrl,
    courseCode: course.slug,
    ...(timeRequired ? { timeRequired } : {}),
    provider: {
      "@type": "LocalBusiness",
      "@id": `${base}/#localbusiness`,
      name: "Doon Coding Academy",
      url: base,
    },
    hasCourseInstance: {
      "@type": "CourseInstance",
      name: course.title,
      url: pageUrl,
      // omit courseMode to avoid enum warnings
      courseSchedule: schedule,
    },
    offers: {
      "@type": "Offer",
      url: pageUrl,
      priceCurrency: "INR",
      ...(typeof priceNumber === "number" ? { price: priceNumber } : {}),
      availability: "https://schema.org/InStock",
      eligibleRegion: { "@type": "Country", name: "India" },
      category: "Education",
    },
  };



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

  return (
    <main className="container mx-auto py-8">
      {uiBreadcrumbs}

      {/* JSON-LD (Breadcrumbs, Course, FAQ) */}
      <Script id="course-breadcrumb" type="application/ld+json" strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <Script id="course-schema" type="application/ld+json" strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchema) }} />
      <Script id="course-faq-schema" type="application/ld+json" strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

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

      {/* Local SEO: areas served */}
      <section id="service-areas" className="mt-12 border-t pt-8">
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
      </section>

      {/* Course-specific syllabus blocks */}
      {course.slug === "full-stack" && (
        <section id="curriculum" className="mt-8">
          <h2 className="text-2xl font-semibold mb-2">Detailed Syllabus (MERN + Gen&nbsp;AI)</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="rounded-2xl border p-4">
              <h3 className="font-semibold mb-1">Module 1 — Web Foundations</h3>
              <ul className="list-disc ml-5 text-gray-700 space-y-1">
                <li>HTML5, CSS3, responsive layouts</li>
                <li>Tailwind CSS essentials & utility-first patterns</li>
                <li>Git & GitHub workflow (branches, PRs, releases)</li>
              </ul>
            </div>
            <div className="rounded-2xl border p-4">
              <h3 className="font-semibold mb-1">Module 2 — JavaScript & TS</h3>
              <ul className="list-disc ml-5 text-gray-700 space-y-1">
                <li>Modern JS (ES6+), async patterns, fetch</li>
                <li>TypeScript basics for safer React/Node</li>
                <li>Testing fundamentals (unit & integration)</li>
              </ul>
            </div>
            <div className="rounded-2xl border p-4">
              <h3 className="font-semibold mb-1">Module 3 — React & Next.js</h3>
              <ul className="list-disc ml-5 text-gray-700 space-y-1">
                <li>React hooks, context, forms, routing</li>
                <li>Next.js App Router, data fetching, metadata</li>
                <li>State management patterns & performance</li>
              </ul>
            </div>
            <div className="rounded-2xl border p-4">
              <h3 className="font-semibold mb-1">Module 4 — Backend (Node.js & Express)</h3>
              <ul className="list-disc ml-5 text-gray-700 space-y-1">
                <li>REST APIs, auth (JWT), validation</li>
                <li>MongoDB & Mongoose (schemas, indexes)</li>
                <li>File uploads, email/notifications</li>
              </ul>
            </div>
            <div className="rounded-2xl border p-4">
              <h3 className="font-semibold mb-1">Module 5 — Gen&nbsp;AI Integration</h3>
              <ul className="list-disc ml-5 text-gray-700 space-y-1">
                <li>Prompt design & API usage</li>
                <li>Simple RAG patterns (vector search basics)</li>
                <li>Adding AI features into MERN apps</li>
              </ul>
            </div>
            <div className="rounded-2xl border p-4">
              <h3 className="font-semibold mb-1">Module 6 — Deploy & DevOps</h3>
              <ul className="list-disc ml-5 text-gray-700 space-y-1">
                <li>Vercel & Node deployments, env management</li>
                <li>CI basics, monitoring & logging</li>
                <li>Performance, SEO & accessibility checks</li>
              </ul>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-2">Projects you’ll build</h3>
            <ul className="list-disc ml-6 text-gray-700 space-y-1">
              <li><span className="font-medium">Auth-ready MERN Starter</span> — protected routes, forms, API layer</li>
              <li><span className="font-medium">E-commerce Mini</span> — product CRUD, cart, checkout flow</li>
              <li><span className="font-medium">AI Notes / Q&A</span> — ingest notes, ask questions via Gen&nbsp;AI (simple RAG)</li>
              <li><span className="font-medium">Portfolio App</span> — deploy & optimize for lighthouse/SEO</li>
            </ul>
          </div>

          <div className="mt-6 rounded-xl bg-blue-50 border border-blue-100 p-4">
            <p className="text-sm text-blue-900">
              <span className="font-semibold">Outcome:</span> Ship 3–4 portfolio projects, understand MERN + Gen&nbsp;AI integration,
              and practice interview-focused problem-solving with code reviews.
            </p>
          </div>
        </section>
      )}

      {course.slug === "data-science" && (
        <section id="curriculum" className="mt-8">
          <h2 className="text-2xl font-semibold mb-2">Detailed Syllabus (Python • ML • AI)</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="rounded-2xl border p-4">
              <h3 className="font-semibold mb-1">Module 1 — Python Foundations</h3>
              <ul className="list-disc ml-5 text-gray-700 space-y-1">
                <li>Python syntax, IDEs, virtual envs</li>
                <li>Data types, control flow, functions</li>
                <li>Files, JSON, modules & packaging</li>
              </ul>
            </div>
            <div className="rounded-2xl border p-4">
              <h3 className="font-semibold mb-1">Module 2 — Data Analysis</h3>
              <ul className="list-disc ml-5 text-gray-700 space-y-1">
                <li>NumPy arrays & vectorization</li>
                <li>Pandas: series, dataframes, joins, groupby</li>
                <li>Cleaning, EDA, feature engineering</li>
              </ul>
            </div>
            <div className="rounded-2xl border p-4">
              <h3 className="font-semibold mb-1">Module 3 — Visualization</h3>
              <ul className="list-disc ml-5 text-gray-700 space-y-1">
                <li>Matplotlib & Plotly basics</li>
                <li>Dashboards & storytelling</li>
                <li>Exporting charts for the web</li>
              </ul>
            </div>
            <div className="rounded-2xl border p-4">
              <h3 className="font-semibold mb-1">Module 4 — Machine Learning</h3>
              <ul className="list-disc ml-5 text-gray-700 space-y-1">
                <li>ML workflow, train/val/test splits</li>
                <li>scikit-learn: regression, classification, metrics</li>
                <li>Model tuning & cross-validation</li>
              </ul>
            </div>
            <div className="rounded-2xl border p-4">
              <h3 className="font-semibold mb-1">Module 5 — SQL & Data Ops</h3>
              <ul className="list-disc ml-5 text-gray-700 space-y-1">
                <li>SQL querying & joins</li>
                <li>Connecting Python ↔ DB</li>
                <li>Basics of pipelines & scheduling</li>
              </ul>
            </div>
            <div className="rounded-2xl border p-4">
              <h3 className="font-semibold mb-1">Module 6 — Gen&nbsp;AI Intro</h3>
              <ul className="list-disc ml-5 text-gray-700 space-y-1">
                <li>Prompting & API usage</li>
                <li>Lightweight embeddings & retrieval</li>
                <li>Using AI to augment analysis</li>
              </ul>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-2">Projects you’ll build</h3>
            <ul className="list-disc ml-6 text-gray-700 space-y-1">
              <li><span className="font-medium">Exploratory Data Analysis</span> — real dataset cleaning & insights report</li>
              <li><span className="font-medium">Predictive Model</span> — scikit-learn pipeline with evaluation</li>
              <li><span className="font-medium">Analytics Dashboard</span> — interactive charts for stakeholders</li>
              <li><span className="font-medium">AI-Aided Notebook</span> — prompt-assisted feature ideas & summaries</li>
            </ul>
          </div>

          <div className="mt-6 rounded-xl bg-blue-50 border border-blue-100 p-4">
            <p className="text-sm text-blue-900">
              <span className="font-semibold">Outcome:</span> Build solid Python + ML foundations, ship 3 portfolio artifacts
              (EDA, model, dashboard), and learn to use Gen&nbsp;AI to accelerate analysis.
            </p>
          </div>
        </section>
      )}

      {course.slug === "java" && (
        <section id="curriculum" className="mt-8">
          <h2 className="text-2xl font-semibold mb-2">Detailed Syllabus (Core Java + Spring Boot)</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="rounded-2xl border p-4">
              <h3 className="font-semibold mb-1">Module 1 — Core Java Foundations</h3>
              <ul className="list-disc ml-5 text-gray-700 space-y-1">
                <li>JDK/JRE, IDE setup (IntelliJ/Eclipse)</li>
                <li>Syntax, data types, control flow</li>
                <li>Methods, packages, access modifiers</li>
              </ul>
            </div>
            <div className="rounded-2xl border p-4">
              <h3 className="font-semibold mb-1">Module 2 — OOP Essentials</h3>
              <ul className="list-disc ml-5 text-gray-700 space-y-1">
                <li>Classes, objects, inheritance, polymorphism</li>
                <li>Interfaces, abstract classes</li>
                <li>Encapsulation & immutability</li>
              </ul>
            </div>
            <div className="rounded-2xl border p-4">
              <h3 className="font-semibold mb-1">Module 3 — Collections & Generics</h3>
              <ul className="list-disc ml-5 text-gray-700 space-y-1">
                <li>List, Set, Map, Queue</li>
                <li>Iterators, streams (intro)</li>
                <li>Generics & common patterns</li>
              </ul>
            </div>
            <div className="rounded-2xl border p-4">
              <h3 className="font-semibold mb-1">Module 4 — Exceptions & I/O</h3>
              <ul className="list-disc ml-5 text-gray-700 space-y-1">
                <li>Checked vs unchecked exceptions</li>
                <li>Try-with-resources</li>
                <li>File I/O, serialization basics</li>
              </ul>
            </div>
            <div className="rounded-2xl border p-4">
              <h3 className="font-semibold mb-1">Module 5 — JDBC & SQL</h3>
              <ul className="list-disc ml-5 text-gray-700 space-y-1">
                <li>JDBC drivers & connections</li>
                <li>CRUD with PreparedStatement</li>
                <li>Basic schema design & indexing</li>
              </ul>
            </div>
            <div className="rounded-2xl border p-4">
              <h3 className="font-semibold mb-1">Module 6 — Spring Boot (Intro)</h3>
              <ul className="list-disc ml-5 text-gray-700 space-y-1">
                <li>Boot project structure & starters</li>
                <li>REST controllers, DTOs, validation</li>
                <li>Data JPA with MySQL/Postgres</li>
              </ul>
            </div>
            <div className="rounded-2xl border p-4">
              <h3 className="font-semibold mb-1">Module 7 — Build & Testing</h3>
              <ul className="list-disc ml-5 text-gray-700 space-y-1">
                <li>Maven/Gradle basics</li>
                <li>JUnit & Mockito (unit tests)</li>
                <li>Configuration & profiles</li>
              </ul>
            </div>
            <div className="rounded-2xl border p-4">
              <h3 className="font-semibold mb-1">Module 8 — Deploy & Ops</h3>
              <ul className="list-disc ml-5 text-gray-700 space-y-1">
                <li>Packaging JARs, env variables</li>
                <li>Deploying a Boot app</li>
                <li>Logging & simple monitoring</li>
              </ul>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-2">Projects you’ll build</h3>
            <ul className="list-disc ml-6 text-gray-700 space-y-1">
              <li><span className="font-medium">Console Banking App</span> — OOP, exceptions, file I/O</li>
              <li><span className="font-medium">Library Manager (JDBC)</span> — CRUD, queries, pagination</li>
              <li><span className="font-medium">Spring Boot REST API</span> — validation, JPA, Postman tests</li>
              <li><span className="font-medium">Mini MVC Web</span> — simple UI consuming the Boot API</li>
            </ul>
          </div>

          <div className="mt-6 rounded-xl bg-blue-50 border border-blue-100 p-4">
            <p className="text-sm text-blue-900">
              <span className="font-semibold">Outcome:</span> Strong Core Java skills, a working REST API with Spring Boot,
              and 3–4 portfolio projects to showcase.
            </p>
          </div>
        </section>
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
          .filter(p => p._score > 0)
          .sort((a, b) => b._score - a._score)
          .slice(0, 5);

        return scored.length > 0 ? (
          <section className="mt-12 border-t pt-8">
            <h2 className="text-2xl font-semibold">Further reading</h2>
            <ul className="mt-4 grid gap-4 sm:grid-cols-2">
              {scored.map(post => (
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
      <script
        id="course-schema"
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: JSON.stringify((() => {
            const base = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.dooncodingacademy.in").replace(/\/$/, "");
            const url = `${base}/courses/${course.slug}`;

            // Parse price to a number if possible
            const priceNumber = (() => {
              if (!course.price) return undefined;
              const cleaned = String(course.price).replace(/[^\d.]/g, "");
              return cleaned ? Number(cleaned) : undefined;
            })();

            // Optional: convert "6 months" to ISO duration
            const timeRequired = (() => {
              if (!course.duration) return undefined;
              const txt = String(course.duration).toLowerCase();
              const m = txt.match(/(\d+)\s*month/);
              if (m) return `P${parseInt(m[1], 10)}M`;
              const w = txt.match(/(\d+)\s*week/);
              if (w) return `P${parseInt(w[1], 10) * 7}D`;
              return undefined;
            })();

            return {
              "@context": "https://schema.org",
              "@type": "Course",
              "@id": `${url}#course`,
              name: course.title,
              description: course.description,
              url,
              courseCode: course.slug,
              ...(timeRequired ? { timeRequired } : {}),
              provider: {
                "@type": "LocalBusiness",
                "@id": `${base}/#localbusiness`,
                name: "Doon Coding Academy",
                url: base
              },
              offers: {
                "@type": "Offer",
                url,
                priceCurrency: "INR",
                ...(typeof priceNumber === "number" ? { price: priceNumber } : {}),
                availability: "https://schema.org/InStock",
                eligibleRegion: { "@type": "Country", name: "India" },
                category: "Paid"
              },
              hasCourseInstance: {
                "@type": "CourseInstance",
                name: course.title,
                url,
                // ✅ Use Google-accepted enum
                courseMode: "InPerson",
                // ✅ Use workload (plain text) instead of Schedule
                courseWorkload: "Wed–Sun 10:00–19:00 IST"
              }
            };
          })())
        }}
      />
    </main>
  );
}