import { z } from "zod";
import {
  MISSION_HINTS,
  MISSION_ID,
  MISSION_STARTER_CODE,
  MISSION_TESTS,
} from "./mission";
import {
  CHALLENGE_DIFFICULTIES,
  CHALLENGE_RUNNERS,
  CHALLENGE_STATUSES,
  type LabChallenge,
} from "./types";
import { isValidChallengeRouteSegment } from "./challenge-utils";

const routeSegmentSchema = z.string().refine(isValidChallengeRouteSegment);
const functionNameSchema = z.string().regex(/^[A-Za-z_$][A-Za-z0-9_$]{0,63}$/);

const missionTestSchema = z.object({
  id: routeSegmentSchema,
  price: z.number().finite().nonnegative(),
  discountPercent: z.number().finite().min(0).max(100),
  expected: z.number().finite(),
});

const skillEvidenceSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("tests"),
    testIds: z.array(routeSegmentSchema).min(1),
  }),
  z.object({
    type: z.literal("completed-with-hints"),
    maximumHints: z.number().int().nonnegative(),
  }),
]);

export const labChallengeSchema = z.object({
  id: routeSegmentSchema,
  track: routeSegmentSchema,
  slug: routeSegmentSchema,
  title: z.string().trim().min(1).max(120),
  shortDescription: z.string().trim().min(1).max(240),
  difficulty: z.enum(CHALLENGE_DIFFICULTIES),
  estimatedMinutes: z
    .object({
      minimum: z.number().int().positive().max(240),
      maximum: z.number().int().positive().max(240),
    })
    .refine(({ minimum, maximum }) => maximum >= minimum),
  language: z.literal("javascript"),
  tags: z.array(z.string().trim().min(1).max(32)).min(1),
  mission: z.object({
    scenario: z.array(z.string().trim().min(1).max(500)).min(1),
    objective: z.string().trim().min(1).max(500),
    expectedBehavior: z.array(z.string().trim().min(1).max(300)).min(1),
    example: z
      .object({
        testId: routeSegmentSchema,
        starterOutput: z.number().finite(),
      })
      .optional(),
  }),
  starterCode: z.string().min(1).max(5000),
  entryFunction: functionNameSchema,
  tests: z.array(missionTestSchema).min(1),
  hints: z.array(z.string().trim().min(1).max(500)).max(5),
  skills: z
    .array(
      z.object({
        id: routeSegmentSchema,
        label: z.string().trim().min(1).max(100),
        evidence: skillEvidenceSchema,
      }),
    )
    .min(1),
  runner: z.enum(CHALLENGE_RUNNERS),
  relatedCourseSlug: routeSegmentSchema.optional(),
  seo: z.object({
    title: z.string().trim().min(1).max(160),
    description: z.string().trim().min(1).max(320),
  }),
  status: z.enum(CHALLENGE_STATUSES),
});

const challengeRegistrySchema = z
  .array(labChallengeSchema)
  .superRefine((challenges, context) => {
    const ids = new Set<string>();
    const routes = new Set<string>();

    challenges.forEach((challenge, index) => {
      if (ids.has(challenge.id)) {
        context.addIssue({
          code: "custom",
          message: `Duplicate challenge id: ${challenge.id}`,
          path: [index, "id"],
        });
      }
      ids.add(challenge.id);

      const route = `${challenge.track}/${challenge.slug}`;
      if (routes.has(route)) {
        context.addIssue({
          code: "custom",
          message: `Duplicate challenge route: ${route}`,
          path: [index, "slug"],
        });
      }
      routes.add(route);

      const testIds = new Set<string>();
      challenge.tests.forEach((testCase, testIndex) => {
        if (testIds.has(testCase.id)) {
          context.addIssue({
            code: "custom",
            message: `Duplicate test id: ${testCase.id}`,
            path: [index, "tests", testIndex, "id"],
          });
        }
        testIds.add(testCase.id);
      });
      if (
        challenge.mission.example &&
        !testIds.has(challenge.mission.example.testId)
      ) {
        context.addIssue({
          code: "custom",
          message: "Mission example references a missing test",
          path: [index, "mission", "example", "testId"],
        });
      }

      const skillIds = new Set<string>();
      challenge.skills.forEach((skill, skillIndex) => {
        if (skillIds.has(skill.id)) {
          context.addIssue({
            code: "custom",
            message: `Duplicate skill id: ${skill.id}`,
            path: [index, "skills", skillIndex, "id"],
          });
        }
        skillIds.add(skill.id);

        if (
          skill.evidence.type === "tests" &&
          skill.evidence.testIds.some((testId) => !testIds.has(testId))
        ) {
          context.addIssue({
            code: "custom",
            message: `Skill ${skill.id} references a missing test`,
            path: [index, "skills", skillIndex, "evidence", "testIds"],
          });
        }
      });
    });
  });

const challengeRecords: unknown[] = [
  {
    id: MISSION_ID,
    track: "javascript",
    slug: MISSION_ID,
    title: "Fix the Discount Calculation Bug",
    shortDescription:
      "Repair a JavaScript function so it returns the correct discounted product price.",
    difficulty: "Beginner",
    estimatedMinutes: { minimum: 5, maximum: 10 },
    language: "javascript",
    tags: ["JavaScript", "Debugging"],
    mission: {
      scenario: [
        "An online store has a discount calculator.",
        "A product costs ₹800 and the discount is 10%.",
      ],
      objective:
        "Fix calculateTotal so the correct discounted price is returned.",
      expectedBehavior: [
        "Return ₹720 for a price of ₹800 with a 10% discount.",
        "Return the expected total for the other supplied test cases.",
      ],
      example: { testId: "discount-10", starterOutput: 800 },
    },
    starterCode: MISSION_STARTER_CODE,
    entryFunction: "calculateTotal",
    tests: MISSION_TESTS,
    hints: MISSION_HINTS,
    skills: [
      {
        id: "javascript-expressions",
        label: "JavaScript expressions",
        evidence: { type: "tests", testIds: MISSION_TESTS.map(({ id }) => id) },
      },
      {
        id: "requirements-to-logic",
        label: "Requirements → logic",
        evidence: { type: "tests", testIds: MISSION_TESTS.map(({ id }) => id) },
      },
      {
        id: "debugging-with-tests",
        label: "Debugging with tests",
        evidence: { type: "tests", testIds: MISSION_TESTS.map(({ id }) => id) },
      },
      {
        id: "edge-case-handling",
        label: "Edge-case handling",
        evidence: {
          type: "tests",
          testIds: MISSION_TESTS.filter(
            ({ discountPercent }) =>
              discountPercent === 0 || discountPercent === 100,
          ).map(({ id }) => id),
        },
      },
      {
        id: "independent-completion",
        label: "Independent completion",
        evidence: { type: "completed-with-hints", maximumHints: 1 },
      },
    ],
    runner: "discount-calculation-v1",
    relatedCourseSlug: "full-stack",
    seo: {
      title: "Fix the Discount Calculation Bug | DCA Lab",
      description:
        "A beginner JavaScript debugging challenge: repair a discount calculation and check your solution against objective tests.",
    },
    status: "published",
  },
];

export function validateChallenges(records: unknown): LabChallenge[] {
  return challengeRegistrySchema.parse(records);
}

export const challenges = validateChallenges(challengeRecords);
export const DEFAULT_CHALLENGE = challenges.find(
  ({ id }) => id === MISSION_ID,
);

export type ChallengeLookupStatus = "published" | "draft" | "not-found";

function getValidatedRegistry(records: unknown): LabChallenge[] {
  return records === challenges ? challenges : validateChallenges(records);
}

function findChallenge(
  track: string,
  slug: string,
  registry: readonly LabChallenge[],
): LabChallenge | undefined {
  if (!routeSegmentSchema.safeParse(track).success) return undefined;
  if (!routeSegmentSchema.safeParse(slug).success) return undefined;
  return registry.find((item) => item.track === track && item.slug === slug);
}

export function getChallengeStatus(
  track: string,
  slug: string,
  records: unknown = challenges,
): ChallengeLookupStatus {
  const challenge = findChallenge(track, slug, getValidatedRegistry(records));
  if (!challenge) return "not-found";
  return challenge.status;
}

export function getPublishedChallenges(
  records: unknown = challenges,
): LabChallenge[] {
  return getValidatedRegistry(records).filter(
    ({ status }) => status === "published",
  );
}

export function getChallenge(
  track: string,
  slug: string,
  records: unknown = challenges,
): LabChallenge | undefined {
  const challenge = findChallenge(track, slug, getValidatedRegistry(records));
  return challenge?.status === "published" ? challenge : undefined;
}

export function getChallengesByTrack(
  track: string,
  records: unknown = challenges,
): LabChallenge[] {
  if (!routeSegmentSchema.safeParse(track).success) return [];
  return getPublishedChallenges(records).filter(
    (challenge) => challenge.track === track,
  );
}
