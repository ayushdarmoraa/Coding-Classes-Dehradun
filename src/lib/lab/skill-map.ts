import { MISSION_TESTS, type MissionTestResult } from "./mission";

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
): SkillMapItem[] {
  const requiredTestIds = MISSION_TESTS.map(({ id }) => id);
  const edgeCaseTestIds = MISSION_TESTS
    .filter(({ discountPercent }) => discountPercent === 0 || discountPercent === 100)
    .map(({ id }) => id);
  const passedTestIds = new Set(
    completed
      ? requiredTestIds
      : (results ?? []).filter(({ status }) => status === "passed").map(({ id }) => id),
  );
  const countPassed = (ids: readonly string[]) => ids.filter((id) => passedTestIds.has(id)).length;
  const allTestStatus = statusFromEvidence(countPassed(requiredTestIds), requiredTestIds.length);
  const edgeCaseStatus = statusFromEvidence(countPassed(edgeCaseTestIds), edgeCaseTestIds.length);
  const independentStatus: SkillStatus = !completed
    ? "Not demonstrated yet"
    : highestHintViewed <= 1
      ? "Demonstrated"
      : "Developing";

  return [
    { id: "javascript-expressions", label: "JavaScript expressions", status: allTestStatus },
    { id: "requirements-to-logic", label: "Requirements → logic", status: allTestStatus },
    { id: "debugging-with-tests", label: "Debugging with tests", status: allTestStatus },
    { id: "edge-case-handling", label: "Edge-case handling", status: edgeCaseStatus },
    { id: "independent-completion", label: "Independent completion", status: independentStatus },
  ];
}
