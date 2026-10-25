import {
  MAX_MISSION_CODE_LENGTH,
  MISSION_TESTS,
  type MissionTestResult,
  type MissionWorkerRequest,
  type MissionWorkerResponse,
} from "./mission";
import { compileMission, MissionSyntaxError } from "./runner";

self.addEventListener("message", (event: MessageEvent<MissionWorkerRequest>) => {
  if (typeof event.data?.code !== "string") {
    self.postMessage({ type: "error", error: "internal" } satisfies MissionWorkerResponse);
    return;
  }
  if (event.data.code.length > MAX_MISSION_CODE_LENGTH) {
    self.postMessage({ type: "error", error: "input-too-long" } satisfies MissionWorkerResponse);
    return;
  }

  let calculateTotal: (price: number, discountPercent: number) => number;
  try {
    calculateTotal = compileMission(event.data.code);
  } catch (error) {
    const category = error instanceof MissionSyntaxError ? "syntax" : "internal";
    self.postMessage({ type: "error", error: category } satisfies MissionWorkerResponse);
    return;
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

  self.postMessage({ type: "results", results } satisfies MissionWorkerResponse);
});
