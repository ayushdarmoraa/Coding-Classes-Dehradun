
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

const RAW_BASE = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
const BASE = RAW_BASE.replace(/^http:\/\//, "https://");

export const metadata: Metadata = {
  title: "About Doon Coding Academy | Learn Full-Stack, Data Science, Python, Java in Dehradun",
  description:
    "Doon Coding Academy is a modern, SEO-first coding institute in Dehradun offering Full-Stack with Gen AI, Data Science, Python, and Java. Practical projects, local support, flexible plans.",
  alternates: { canonical: BASE + "/about" },
  openGraph: {
    url: BASE + "/about",
  },
};

export default function AboutPage() {
  return (
    <main className="pt-8">
      {/* Hero */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2 items-center">
          <div>
            <p className="inline-block rounded-full bg-blue-600/10 text-blue-700 dark:text-blue-600 px-3 py-1 text-xs font-medium ring-1 ring-blue-600/20">
              Herbertpur · Dehradun
            </p>
            <h1 className="mt-4 text-3xl/tight sm:text-4xl/tight font-extrabold">
              About <span className="text-blue-700">Doon Coding Academy</span>
            </h1>
            <p className="mt-4 text-gray-700">
              We’re building Dehradun’s most practical, industry-aligned coding institute—focused on
              <span className="font-semibold"> outcomes, portfolios,</span> and{" "}
              <span className="font-semibold">local career growth</span>. Our curriculum blends solid
              fundamentals with the latest tools (including Gen AI) so beginners and upskillers can
              move confidently from <em>learning</em> to <em>doing</em>.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/courses"
                className="inline-flex items-center rounded-xl bg-blue-700 px-4 py-2 text-white text-sm font-semibold shadow-sm hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-blue-700/30"
              >
                Explore Courses
              </Link>
              <a
                href="https://wa.me/917037905464"
                className="inline-flex items-center rounded-xl border border-blue-700 px-4 py-2 text-blue-700 text-sm font-semibold hover:bg-blue-700/5 focus:outline-none focus:ring-2 focus:ring-blue-700/20"
              >
                Chat on WhatsApp
              </a>
            </div>

            <p className="mt-3 text-sm text-gray-600">
              Looking for city or online options?{' '}
              <Link href="/locations" className="text-blue-700 hover:underline">See Locations</Link>.
            </p>

            <ul className="mt-6 grid gap-3 sm:grid-cols-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-yellow-400"></span>
                Outcome-based, project-first learning
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-yellow-400"></span>
                Flexible pricing & local support
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-yellow-400"></span>
                Modern stack incl. Gen AI & Data
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-yellow-400"></span>
                SEO-first site for transparency
              </li>
            </ul>
          </div>

          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl ring-1 ring-gray-200">
            <Image
              src="/images/about-hero.jpg"
              alt="Branded illustration of Doon Coding Academy"
              fill
              className="object-cover"
              priority
              fetchPriority="high"
            />
          </div>
        </div>
      </section>

      {/* Mission & Approach */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 mt-14">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <h2 className="text-2xl font-bold">Our Mission</h2>
            <p className="mt-3 text-gray-700">
              To make high-quality tech education <span className="font-semibold">accessible and
              affordable</span> in Dehradun—so students, parents, and working professionals can
              upskill without leaving home.
            </p>
          </div>
          <div className="lg:col-span-2">
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="rounded-2xl p-5 ring-1 ring-gray-200">
                <h3 className="font-semibold">Project-First Curriculum</h3>
                <p className="mt-2 text-gray-700">
                  Build real projects from week one. You’ll practice fundamentals and ship small
                  features that add up to a strong portfolio.
                </p>
              </div>
              <div className="rounded-2xl p-5 ring-1 ring-gray-200">
                <h3 className="font-semibold">Local & Personal</h3>
                <p className="mt-2 text-gray-700">
                  In-person doubt resolution and mentorship at our Herbertpur campus—plus
                  accountability, reviews, and guidance tailored to your pace.
                </p>
              </div>
              <div className="rounded-2xl p-5 ring-1 ring-gray-200">
                <h3 className="font-semibold">Modern Stack</h3>
                <p className="mt-2 text-gray-700">
                  Full-Stack with Gen AI, Data Science, Python, and Java—kept current with industry
                  practices so you learn what matters now.
                </p>
              </div>
              <div className="rounded-2xl p-5 ring-1 ring-gray-200">
                <h3 className="font-semibold">Transparent & SEO-First</h3>
                <p className="mt-2 text-gray-700">
                  Clear pricing, outcomes, and curriculum. Our site is optimized so you can easily
                  find everything you need before enrolling.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Courses Overview */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 mt-14">
        <h2 className="text-2xl font-bold">What You Can Learn Here</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <CourseCard
            title="Full-Stack with Gen AI"
            href="/courses/full-stack"
            points={[
              "Frontend + Backend fundamentals",
              "AI-assisted dev workflows",
              "Deployments & best practices",
            ]}
          />
          <CourseCard
            title="Data Science"
            href="/courses/data-science"
            points={["Python for Data", "Pandas, NumPy, ML basics", "Projects & EDA"]}
          />
          <CourseCard
            title="Python"
            href="/courses/python"
            points={["Beginner-friendly", "Problem-solving focus", "Automation & scripts"]}
          />
          <CourseCard
            title="Java"
            href="/courses/java"
            points={["OOP strong base", "DSA practice", "Backend foundations"]}
          />
        </div>

        <div className="mt-6">
          <Link
            href="/courses"
            className="inline-flex items-center rounded-xl bg-blue-700 px-4 py-2 text-white text-sm font-semibold shadow-sm hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-blue-700/30"
          >
            View all courses
          </Link>
        </div>
      </section>

      {/* Outcomes & Stats (simple, no external deps) */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 mt-14">
        <div className="rounded-2xl ring-1 ring-gray-200 p-6">
          <h2 className="text-2xl font-bold">What to Expect</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Hands-on Projects" value="10+" />
            <Stat label="Curriculum Hours" value="100–150" />
            <Stat label="Doubt-Clear Sessions" value="Weekly" />
            <Stat label="Flexible Plans" value="Monthly/One-time" />
          </div>
          <p className="mt-6 text-gray-700">
            You’ll finish with <span className="font-semibold">portfolio-ready work</span>, clarity
            on fundamentals, and the confidence to keep building.
          </p>
        </div>
      </section>

      {/* Location & Contact */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 mt-14 mb-16">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-2xl ring-1 ring-gray-200 p-6">
            <h2 className="text-2xl font-bold">Visit Us</h2>
            <p className="mt-3 text-gray-700">
              Near DR School, Herbertpur, Dehradun, PIN 248142
            </p>
            <div className="mt-4 grid gap-2 text-sm">
              <a
                href="tel:+917037905464"
                className="text-blue-700 hover:underline font-semibold"
              >
                +91 7037905464
              </a>
              <a
                href="mailto:dooncodingacademy@gmail.com"
                className="text-blue-700 hover:underline font-semibold"
              >
                dooncodingacademy@gmail.com
              </a>
              <a
                href="https://wa.me/917037905464"
                className="text-blue-700 hover:underline font-semibold"
              >
                WhatsApp us
              </a>
            </div>
          </div>

          <div className="rounded-2xl ring-1 ring-gray-200 p-6">
            <h2 className="text-2xl font-bold">Who We’re For</h2>
            <ul className="mt-3 grid gap-2 text-gray-700">
              <li>• College & school students starting their tech journey</li>
              <li>• Parents seeking a reliable, local coding institute</li>
              <li>• Working professionals upskilling for career growth</li>
            </ul>

            <details className="mt-4 rounded-xl bg-blue-600/5 p-4 ring-1 ring-blue-600/10">
              <summary className="cursor-pointer font-semibold text-blue-700">
                Pricing & Duration (quick glance)
              </summary>
              <div className="mt-3 text-sm text-gray-700">
                <p>Full-Stack with Gen AI: 6 months · ₹25,000 (or ₹5,000/month)</p>
                <p>Data Science: 6 months · ₹30,000 (or ₹6,000/month)</p>
                <p>Full-Stack: 4 months · ₹6,000 (or ₹2,000/month)</p>
              </div>
            </details>
          </div>
        </div>
      </section>
    </main>
  );
}

/* --- Local UI bits (no external deps) --- */

function CourseCard({
  title,
  href,
  points,
}: {
  title: string;
  href: string;
  points: string[];
}) {
  return (
    <Link
      href={href}
      className="block rounded-2xl p-5 ring-1 ring-gray-200 hover:ring-blue-700/40 transition"
    >
      <h3 className="font-semibold">{title}</h3>
      <ul className="mt-3 space-y-1 text-sm text-gray-700">
        {points.map((p) => (
          <li key={p} className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-yellow-400"></span>
            {p}
          </li>
        ))}
      </ul>
      <span className="mt-4 inline-flex text-sm font-semibold text-blue-700">
        Learn more →
      </span>
    </Link>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white p-4 ring-1 ring-gray-200">
      <div className="text-2xl font-extrabold">{value}</div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  );
}
