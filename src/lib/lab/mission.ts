export const MISSION_ID = "discount-calculation-bug";
export const MISSION_STORAGE_KEY = "dca.lab.v1.challenge.javascript.discount-calculation-bug";
export const MISSION_STARTER_CODE = `function calculateTotal(price, discountPercent) {
  return price;
}`;

export const MISSION_TESTS = [
  { id: "discount-10", price: 800, discountPercent: 10, expected: 720 },
  { id: "discount-20", price: 1000, discountPercent: 20, expected: 800 },
  { id: "no-discount", price: 500, discountPercent: 0, expected: 500 },
  { id: "full-discount", price: 200, discountPercent: 100, expected: 0 },
] as const;

export const MAX_MISSION_CODE_LENGTH = 4096;

export type MissionTestResult = {
  id: string;
  price: number;
  discountPercent: number;
  expected: number;
  actual: number | null;
  status: "passed" | "incorrect" | "runtime-error";
};

export type MissionWorkerResponse =
  | { type: "results"; results: MissionTestResult[] }
  | { type: "error"; error: "syntax" | "runtime" | "internal" };

export type MissionRunnerError = "syntax" | "runtime" | "internal" | "timeout";

export type MissionWorkerRequest = { code: string };

function hasExactKeys(value: Record<string, unknown>, expectedKeys: readonly string[]) {
  const keys = Object.keys(value).sort();
  const sortedExpectedKeys = [...expectedKeys].sort();
  return (
    keys.length === sortedExpectedKeys.length &&
    keys.every((key, index) => key === sortedExpectedKeys[index])
  );
}

export function isMissionWorkerRequest(value: unknown): value is MissionWorkerRequest {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    hasExactKeys(value as Record<string, unknown>, ["code"]) &&
    typeof (value as Record<string, unknown>).code === "string"
  );
}

export function isMissionWorkerResponse(value: unknown): value is MissionWorkerResponse {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const response = value as Record<string, unknown>;

  if (response.type === "error") {
    return (
      hasExactKeys(response, ["type", "error"]) &&
      ["syntax", "runtime", "internal"].includes(String(response.error))
    );
  }
  if (response.type !== "results" || !hasExactKeys(response, ["type", "results"])) {
    return false;
  }
  if (!Array.isArray(response.results) || response.results.length !== MISSION_TESTS.length) {
    return false;
  }

  return response.results.every((value, index) => {
    if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
    const result = value as Record<string, unknown>;
    const testCase = MISSION_TESTS[index];
    if (
      !hasExactKeys(result, [
        "id",
        "price",
        "discountPercent",
        "expected",
        "actual",
        "status",
      ]) ||
      result.id !== testCase.id ||
      result.price !== testCase.price ||
      result.discountPercent !== testCase.discountPercent ||
      result.expected !== testCase.expected ||
      (result.actual !== null &&
        (typeof result.actual !== "number" || !Number.isFinite(result.actual)))
    ) {
      return false;
    }

    if (result.status === "passed") return result.actual === testCase.expected;
    if (result.status === "incorrect") return result.actual !== testCase.expected;
    return result.status === "runtime-error" && result.actual === null;
  });
}

export type SavedMissionProgress = {
  code: string;
  attempts: number;
  highestHintViewed: number;
  completed: boolean;
  updatedAt: string;
};

export function isSavedMissionProgress(value: unknown): value is SavedMissionProgress {
  if (typeof value !== "object" || value === null) return false;

  const progress = value as Partial<SavedMissionProgress>;
  return (
    typeof progress.code === "string" &&
    typeof progress.attempts === "number" &&
    Number.isInteger(progress.attempts) &&
    progress.attempts >= 0 &&
    typeof progress.highestHintViewed === "number" &&
    Number.isInteger(progress.highestHintViewed) &&
    progress.highestHintViewed >= 0 &&
    progress.highestHintViewed <= 3 &&
    typeof progress.completed === "boolean" &&
    typeof progress.updatedAt === "string"
  );
}
