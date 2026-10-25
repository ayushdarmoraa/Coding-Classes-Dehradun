import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ChallengeWorkspace from "@/components/lab/ChallengeWorkspace";
import MissionBrief from "@/components/lab/MissionBrief";
import {
  getChallenge,
  getChallengePath,
  getChallengeStatus,
  getPublishedChallenges,
} from "@/lib/lab/challenges";
import { SITE } from "@/lib/site-config";

type ChallengePageProps = {
  params: { track: string; slug: string };
};

export function generateStaticParams() {
  return getPublishedChallenges().map(({ track, slug }) => ({ track, slug }));
}

export async function generateMetadata({
  params,
}: ChallengePageProps): Promise<Metadata> {
  const challenge = getChallenge(params.track, params.slug);
  if (!challenge) {
    if (getChallengeStatus(params.track, params.slug) === "draft") {
      return {
        title: "Challenge unavailable | DCA Lab",
        robots: { index: false, follow: false },
      };
    }
    notFound();
  }

  const canonical = `${SITE.url}${getChallengePath(challenge)}`;
  return {
    title: challenge.seo.title,
    description: challenge.seo.description,
    alternates: { canonical },
    openGraph: {
      title: challenge.seo.title,
      description: challenge.seo.description,
      url: canonical,
      type: "article",
      siteName: SITE.name,
    },
    twitter: {
      card: "summary",
      title: challenge.seo.title,
      description: challenge.seo.description,
    },
  };
}

export default function ChallengePage({ params }: ChallengePageProps) {
  const challenge = getChallenge(params.track, params.slug);
  if (!challenge) notFound();

  return (
    <main className="container mx-auto max-w-4xl px-4 py-12 sm:py-16">
      <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-blue-700">
        <Link
          href="/lab"
          className="rounded-sm hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700"
        >
          DCA Lab
        </Link>{" "}
        · {challenge.tags[0]}
      </p>
      <h1 className="text-3xl font-bold text-gray-950 sm:text-4xl">
        {challenge.title}
      </h1>
      <p className="mt-3 max-w-3xl leading-7 text-gray-700">
        {challenge.shortDescription}
      </p>
      <MissionBrief challenge={challenge} />
      {challenge.runner === "discount-calculation-v1" ? (
        <ChallengeWorkspace />
      ) : (
        <p className="mt-8 rounded-lg border border-amber-300 bg-amber-50 p-4 text-amber-950">
          This challenge is not available to run yet.
        </p>
      )}
    </main>
  );
}
