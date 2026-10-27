import type { ChallengeDifficulty, ChallengeStatus } from "./types";

export type LabAnalyticsMetadata = Readonly<{
  id: string;
  track: string;
  slug: string;
  difficulty: ChallengeDifficulty;
  relatedCourseSlug: string;
  status: ChallengeStatus;
}>;

export const LAB_ANALYTICS_METADATA: readonly LabAnalyticsMetadata[] = [
  {
    id: "discount-calculation-bug",
    track: "javascript",
    slug: "discount-calculation-bug",
    difficulty: "Beginner",
    relatedCourseSlug: "full-stack",
    status: "published",
  },
];

export const PUBLISHED_LAB_ANALYTICS_METADATA =
  LAB_ANALYTICS_METADATA.filter(({ status }) => status === "published");
