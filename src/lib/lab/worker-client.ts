import {
  isMissionWorkerResponse,
  type MissionRunnerError,
  type MissionWorkerResponse,
} from "./mission";

type MissionWorkerOutcome =
  | { type: "results"; response: Extract<MissionWorkerResponse, { type: "results" }> }
  | { type: "error"; error: MissionRunnerError }
  | { type: "cancelled" };

type MissionWorkerLike = Pick<
  Worker,
  "onmessage" | "onerror" | "onmessageerror" | "postMessage" | "terminate"
>;

export function startMissionWorker(
  worker: MissionWorkerLike,
  code: string,
  timeoutMs: number,
): { promise: Promise<MissionWorkerOutcome>; cancel: () => void } {
  let resolveOutcome: (outcome: MissionWorkerOutcome) => void = () => undefined;
  const promise = new Promise<MissionWorkerOutcome>((resolve) => {
    resolveOutcome = resolve;
  });
  let settled = false;

  const finish = (outcome: MissionWorkerOutcome, terminate = true) => {
    if (settled) return;
    settled = true;
    clearTimeout(timer);
    worker.onmessage = null;
    worker.onerror = null;
    worker.onmessageerror = null;
    if (terminate) worker.terminate();
    resolveOutcome(outcome);
  };

  const timer = setTimeout(() => finish({ type: "error", error: "timeout" }), timeoutMs);
  worker.onmessage = (event: MessageEvent<unknown>) => {
    const response: unknown = event.data;
    if (!isMissionWorkerResponse(response)) {
      finish({ type: "error", error: "internal" });
    } else if (response.type === "error") {
      finish({ type: "error", error: response.error });
    } else {
      finish({ type: "results", response });
    }
  };
  worker.onerror = () => finish({ type: "error", error: "internal" });
  worker.onmessageerror = () => finish({ type: "error", error: "internal" });

  try {
    worker.postMessage({ code });
  } catch {
    finish({ type: "error", error: "internal" });
  }

  return {
    promise,
    cancel: () => finish({ type: "cancelled" }),
  };
}
