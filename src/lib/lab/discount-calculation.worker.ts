import {
  isMissionWorkerRequest,
  MISSION_TESTS,
  type MissionTestResult,
  type MissionWorkerResponse,
} from "./mission";
import { compileMission, MissionSyntaxError } from "./runner";

export function handleMissionMessage(request: unknown): MissionWorkerResponse {
  if (!isMissionWorkerRequest(request)) return { type: "error", error: "internal" };
  let calculateTotal: (price: number, discountPercent: number) => number;
  try {
    calculateTotal = compileMission(request.code);
  } catch (error) {
    const category = error instanceof MissionSyntaxError ? "syntax" : "internal";
    return { type: "error", error: category };
  }

  const results: MissionTestResult[] = MISSION_TESTS.map((testCase) => {
    try {
      const output = calculateTotal(testCase.price, testCase.discountPercent);
      const actual = typeof output === "number" && Number.isFinite(output) ? output : null;
      return {
        ...testCase,
        actual,
        status: actual === testCase.expected ? "passed" : "incorrect",
      };
    } catch {
      return {
        ...testCase,
        actual: null,
        status: "runtime-error",
      };
    }
  });

  return { type: "results", results };
}

if (typeof self !== "undefined") {
  self.addEventListener("message", (event: MessageEvent<unknown>) => {
    self.postMessage(handleMissionMessage(event.data));
  });
}
