import type { Metadata } from "next";
import ChallengeWorkspace from "@/components/lab/ChallengeWorkspace";

export const metadata: Metadata = {
  title: "Fix the Discount Calculation Bug | DCA Lab",
  description: "A beginner JavaScript debugging mission about calculating a discounted product total.",
  alternates: { canonical: "/lab/javascript/discount-calculation-bug" },
};

export default function DiscountCalculationBugPage() {
  return (
    <main className="container mx-auto max-w-4xl px-4 py-12 sm:py-16">
      <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-blue-700">DCA Lab · JavaScript</p>
      <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">Fix the Discount Calculation Bug</h1>
      <div className="mt-4 flex flex-wrap gap-3 text-sm text-gray-700">
        <span className="rounded-full bg-gray-100 px-3 py-1">Beginner</span>
        <span className="rounded-full bg-gray-100 px-3 py-1">5–10 minutes</span>
      </div>

      <section aria-labelledby="mission-scenario" className="mt-8 rounded-xl border border-gray-200 bg-white p-5 sm:p-6">
        <h2 id="mission-scenario" className="text-xl font-semibold text-gray-900">Mission scenario</h2>
        <p className="mt-3 text-gray-700">An online store has a discount calculator.</p>
        <p className="mt-3 text-gray-700">A product costs ₹800. The discount is 10%.</p>
        <dl className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <dt className="text-gray-700">Expected total</dt><dd className="font-semibold text-gray-900">₹720</dd>
          <dt className="text-gray-700">Current output</dt><dd className="font-semibold text-gray-900">₹800</dd>
        </dl>
        <p className="mt-4 text-gray-700">
          Fix <code className="rounded bg-gray-100 px-1 py-0.5">calculateTotal</code> so the correct discounted price is returned.
        </p>
        <p className="mt-3 text-sm text-gray-600">
          Learning objective: use the product price and discount percentage to calculate the amount the customer pays.
        </p>
        <p className="mt-2 text-sm text-gray-600">Language: JavaScript · Difficulty: Beginner · Estimated duration: 5–10 minutes</p>
      </section>

      <ChallengeWorkspace />
    </main>
  );
}
