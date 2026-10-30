export const MISSION_ID = "discount-calculation-bug";
export const MISSION_STORAGE_KEY = "dca.lab.v1.challenge.javascript.discount-calculation-bug";
export const MAX_MISSION_CODE_LENGTH = 5000;
export const MISSION_STARTER_CODE = `function calculateTotal(price, discountPercent) {
  return price;
}`;

export const MISSION_HINTS = [
  "Think about what percentage of the price remains after the discount is applied.",
  "Convert the discount percentage into a fraction of the original price, then subtract that amount.",
  "The remaining fraction is (100 - discountPercent) / 100. Multiply the price by that fraction.",
] as const;

export type MissionTestCase = {
  id: string;
  price: number;
  discountPercent: number;
  expected: number;
};

export const MISSION_TESTS = [
  { id: "discount-10", price: 800, discountPercent: 10, expected: 720 },
  { id: "discount-20", price: 1000, discountPercent: 20, expected: 800 },
  { id: "no-discount", price: 500, discountPercent: 0, expected: 500 },
  { id: "full-discount", price: 200, discountPercent: 100, expected: 0 },
] as const;

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
  | { type: "error"; error: "syntax" | "runtime" | "internal" | "input-too-long" };

export type MissionRunnerError =
  | "syntax"
  | "runtime"
  | "internal"
  | "timeout"
  | "input-too-long";

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
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }
  const request = value as Record<string, unknown>;
  return (
    hasExactKeys(request, ["code"]) &&
    typeof request.code === "string" &&
    request.code.length <= MAX_MISSION_CODE_LENGTH
  );
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
    progress.code.length <= MAX_MISSION_CODE_LENGTH &&
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

export function canRevealMissionHint(
  hintIndex: number,
  highestHintViewed: number,
): boolean {
  return (
    Number.isInteger(hintIndex) &&
    hintIndex >= 0 &&
    hintIndex < MISSION_HINTS.length &&
    hintIndex <= highestHintViewed
  );
}

export function getHighestMissionHintViewed(
  highestHintViewed: number,
  hintIndex: number,
): number {
  return canRevealMissionHint(hintIndex, highestHintViewed)
    ? Math.max(highestHintViewed, hintIndex + 1)
    : highestHintViewed;
}

export function isMissionWorkerResponse(
  value: unknown,
): value is MissionWorkerResponse {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  const response = value as Record<string, unknown>;
  if (response.type === "error") {
    return (
      hasExactKeys(response, ["type", "error"]) &&
      ["syntax", "runtime", "internal", "input-too-long"].includes(
        String(response.error),
      )
    );
  }
  if (
    response.type !== "results" ||
    !hasExactKeys(response, ["type", "results"]) ||
    !Array.isArray(response.results)
  ) {
    return false;
  }
  if (response.results.length !== MISSION_TESTS.length) return false;

  return response.results.every((result: unknown, index: number) => {
    if (typeof result !== "object" || result === null || Array.isArray(result)) {
      return false;
    }
    const item = result as Record<string, unknown>;
    if (
      !hasExactKeys(item, [
        "id",
        "price",
        "discountPercent",
        "expected",
        "actual",
        "status",
      ])
    ) {
      return false;
    }
    const expectedCase = MISSION_TESTS[index];
    const validStatus =
      (item.status === "passed" && item.actual === expectedCase.expected) ||
      (item.status === "incorrect" &&
        item.actual !== expectedCase.expected) ||
      (item.status === "runtime-error" && item.actual === null);
    return (
      item.id === expectedCase.id &&
      item.price === expectedCase.price &&
      item.discountPercent === expectedCase.discountPercent &&
      item.expected === expectedCase.expected &&
      (item.actual === null ||
        (typeof item.actual === "number" && Number.isFinite(item.actual))) &&
      validStatus
    );
  });
}
