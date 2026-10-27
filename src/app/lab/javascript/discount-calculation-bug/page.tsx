import type { Metadata } from "next";
import ChallengeWorkspace from "@/components/lab/ChallengeWorkspace";
import { LabChallengeImpression } from "@/components/lab/LabTrackedLink";
import MissionBrief from "@/components/lab/MissionBrief";
import { getChallenge } from "@/lib/lab/challenges";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Fix the Discount Calculation Bug | DCA Lab",
  description: "A beginner JavaScript debugging mission about calculating a discounted product total.",
  alternates: { canonical: "/lab/javascript/discount-calculation-bug" },
};

export default function DiscountCalculationBugPage() {
  const challenge = getChallenge("javascript", "discount-calculation-bug");
  if (!challenge) notFound();
  const analyticsContext = {
    challengeSlug: challenge.slug,
    track: challenge.track,
    difficulty: challenge.difficulty,
  };

  return (
    <main className="container mx-auto max-w-4xl px-4 py-12 sm:py-16">
      <LabChallengeImpression context={analyticsContext} />
      <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">Fix the Discount Calculation Bug</h1>
      <ChallengeWorkspace analyticsContext={analyticsContext}>
        <MissionBrief challenge={challenge} analyticsContext={analyticsContext} />
      </ChallengeWorkspace>
    </main>
  );
}
