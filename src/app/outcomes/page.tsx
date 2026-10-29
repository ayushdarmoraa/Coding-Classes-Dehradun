import type { Metadata } from "next";
import { notFound } from "next/navigation";
import OutcomesContent from "@/components/outcomes/OutcomesContent";
import {
  getPublishedOutcomeContent,
  hasPublishedOutcomeContent,
} from "@/lib/outcomes";
import { SITE } from "@/lib/site-config";

const title = "Learner Outcomes and Measurement Methodology";
const description =
  "Explore verified learner outcomes from Doon Coding Academy with cohort definitions, measurement methods, source checks, permissions, and limitations.";

export function generateMetadata(): Metadata {
  if (!hasPublishedOutcomeContent()) {
    return {
      title,
      robots: { index: false, follow: false },
    };
  }

  return {
    title,
    description,
    alternates: { canonical: `${SITE.url}/outcomes` },
    openGraph: {
      title,
      description,
      url: `${SITE.url}/outcomes`,
      type: "website",
    },
  };
}

export default function OutcomesPage() {
  const content = getPublishedOutcomeContent();
  if (content.metrics.length === 0 && content.stories.length === 0) notFound();

  return <OutcomesContent {...content} />;
}
