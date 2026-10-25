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
