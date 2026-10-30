import { DEFAULT_CHALLENGE } from "./challenges";
import type { MissionTestResult } from "./mission";
import type { LabChallenge } from "./types";

export type SkillStatus = "Demonstrated" | "Developing" | "Not demonstrated yet";

export type SkillMapItem = {
  id: string;
  label: string;
  status: SkillStatus;
};

function statusFromEvidence(passed: number, total: number): SkillStatus {
  if (passed === total) return "Demonstrated";
  return passed > 0 ? "Developing" : "Not demonstrated yet";
}

export function createSkillMap(
  results: readonly MissionTestResult[] | null,
  highestHintViewed: number,
  completed: boolean,
  challenge: LabChallenge | undefined = DEFAULT_CHALLENGE,
): SkillMapItem[] {
  if (!challenge) return [];
  const passedTestIds = new Set(
    completed
      ? challenge.tests.map(({ id }) => id)
      : (results ?? []).filter(({ status }) => status === "passed").map(({ id }) => id),
  );
  return challenge.skills.map(({ id, label, evidence }) => {
    if (evidence.type === "completed-with-hints") {
      const status: SkillStatus = !completed
        ? "Not demonstrated yet"
        : highestHintViewed <= evidence.maximumHints
          ? "Demonstrated"
          : "Developing";
      return { id, label, status };
    }

    const passed = evidence.testIds.filter((testId) =>
      passedTestIds.has(testId),
    ).length;
    return {
      id,
      label,
      status: statusFromEvidence(passed, evidence.testIds.length),
    };
  });
}
