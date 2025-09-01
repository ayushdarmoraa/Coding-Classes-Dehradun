import type { Metadata } from "next";

const SITE_DESC =
  process.env.NEXT_PUBLIC_SITE_DESCRIPTION ||
  "Leading coding institute in Dehradun — Full Stack with Gen AI, Data Science, Python, Java.";

export const metadata: Metadata = {
  title: "Doon Coding Academy — Best Coding Courses in Dehradun",
  description: SITE_DESC,
  alternates: { canonical: "/" },
  openGraph: {
    title: "Doon Coding Academy",
    description: SITE_DESC,
    url: "/",
    siteName: "Doon Coding Academy",
    type: "website",
  },
};
export default function HomePage() {
  return (
    <section className="flex flex-col items-center text-center py-10 space-y-6">
      <h1 className="text-4xl md:text-5xl font-extrabold">Unlock Your Coding Potential</h1>
      <p className="text-lg md:text-xl max-w-2xl">
        Join Doon Coding Academy and master Full‑Stack Development with Gen&nbsp;AI, Data Science,
        Python and Java courses in Dehradun. Learn from industry experts and transform your career.
      </p>
      <a
        href="/courses"
        className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md text-lg hover:bg-blue-700 transition"
      >
        Explore Courses
      </a>
    </section>
  )
}
