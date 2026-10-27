import type { MissionTestCase } from "./mission";

export const CHALLENGE_DIFFICULTIES = [
  "Beginner",
  "Intermediate",
  "Advanced",
] as const;

export const CHALLENGE_STATUSES = ["draft", "published"] as const;

export const CHALLENGE_RUNNERS = ["discount-calculation-v1"] as const;

export type ChallengeDifficulty = (typeof CHALLENGE_DIFFICULTIES)[number];
export type ChallengeStatus = (typeof CHALLENGE_STATUSES)[number];
export type ChallengeRunner = (typeof CHALLENGE_RUNNERS)[number];

export type ChallengeSkill = {
  id: string;
  label: string;
  evidence:
    | { type: "tests"; testIds: string[] }
    | { type: "completed-with-hints"; maximumHints: number };
};

export type LabChallenge = {
  id: string;
  track: string;
  slug: string;
  title: string;
  shortDescription: string;
  difficulty: ChallengeDifficulty;
  estimatedMinutes: { minimum: number; maximum: number };
  language: "javascript";
  tags: string[];
  mission: {
    scenario: string[];
    objective: string;
    expectedBehavior: string[];
    example?: {
      testId: string;
      starterOutput: number;
    };
  };
  starterCode: string;
  entryFunction: string;
  tests: readonly MissionTestCase[];
  hints: string[];
  skills: ChallengeSkill[];
  runner: ChallengeRunner;
  relatedCourseSlug?: string;
  seo: {
    title: string;
    description: string;
  };
  status: ChallengeStatus;
};
