import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "DCA Lab | Doon Coding Academy",
  description: "Try beginner-friendly hands-on coding challenges in the DCA Lab.",
  robots: { index: false, follow: true },
};

export default function LabPage() {
  return (
    <main className="container mx-auto max-w-4xl px-4 py-16 sm:py-24">
      <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-blue-700">
        Doon Coding Academy
      </p>
      <h1 className="mb-4 text-4xl font-bold text-gray-900">DCA Lab</h1>
      <p className="mb-8 max-w-2xl text-lg text-gray-700">
        Build debugging skills with practical coding challenges. Start with a
        beginner JavaScript mission, or explore the available courses.
      </p>
      <div className="flex flex-wrap gap-4">
        <Link
          href="/lab/javascript/discount-calculation-bug"
          className="rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2"
        >
          Try the discount calculation challenge
        </Link>
        <Link
          href="/courses"
          className="rounded-lg border border-blue-700 px-5 py-3 font-semibold text-blue-700 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2"
        >
          Explore courses
        </Link>
        <Link
          href="/contact"
          className="rounded-lg border border-blue-700 px-5 py-3 font-semibold text-blue-700 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2"
        >
          Contact DCA
        </Link>
      </div>
    </main>
  );
}
