import type { Metadata } from "next";
import Link from "next/link";
import { Fragment } from "react";
import { notFound } from "next/navigation";
import ChallengeWorkspace from "@/components/lab/ChallengeWorkspace";
import { LabChallengeImpression } from "@/components/lab/LabTrackedLink";
import MissionBrief from "@/components/lab/MissionBrief";
import { breadcrumbLd } from "@/lib/seo";
import { getChallengePath } from "@/lib/lab/challenge-utils";
import {
  getChallenge,
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
  const challengePath = getChallengePath(challenge);
  const analyticsContext = {
    challengeSlug: challenge.slug,
    track: challenge.track,
    difficulty: challenge.difficulty,
  };
  const breadcrumbItems: Array<{ name: string; href: string; current?: boolean }> = [
    { name: "Home", href: "/" },
    { name: "DCA Lab", href: "/lab" },
    { name: challenge.title, href: challengePath, current: true },
  ];
  const breadcrumbJsonLd = breadcrumbLd(
    breadcrumbItems.map(({ name, href }) => ({
      name,
      url: `${SITE.url}${href}`,
    })),
  );

  return (
    <main className="container mx-auto max-w-7xl px-4 py-12 sm:py-16">
      <LabChallengeImpression context={analyticsContext} />
      <nav aria-label="Breadcrumb" className="mb-3">
        <ol className="flex flex-wrap items-center gap-2 text-sm text-gray-700">
          {breadcrumbItems.map(({ name, href, current }, index) => (
            <Fragment key={name}>
              {index > 0 && <li aria-hidden="true">/</li>}
              <li>
                {current ? (
                  <span aria-current="page" className="font-semibold text-gray-950">
                    {name}
                  </span>
                ) : (
                  <Link
                    href={href}
                    className="rounded-sm hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700"
                  >
                    {name}
                  </Link>
                )}
              </li>
            </Fragment>
          ))}
        </ol>
      </nav>
      <h1 className="text-3xl font-bold text-gray-950 sm:text-4xl">
        {challenge.title}
      </h1>
      <p className="mt-3 max-w-3xl leading-7 text-gray-700">
        {challenge.shortDescription}
      </p>
      {challenge.runner === "discount-calculation-v1" ? (
        <ChallengeWorkspace
          analyticsContext={analyticsContext}
        >
          <MissionBrief
            challenge={challenge}
            analyticsContext={analyticsContext}
          />
        </ChallengeWorkspace>
      ) : (
        <>
          <MissionBrief
            challenge={challenge}
            analyticsContext={analyticsContext}
          />
          <p className="mt-8 rounded-lg border border-amber-300 bg-amber-50 p-4 text-amber-950">
            This challenge is not available to run yet.
          </p>
        </>
      )}
      <script
        id="lab-challenge-breadcrumb-jsonld"
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
    </main>
  );
}
