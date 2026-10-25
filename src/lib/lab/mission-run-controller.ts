import {
  isMissionWorkerResponse,
  type MissionRunnerError,
  type MissionWorkerRequest,
  type MissionWorkerResponse,
} from "./mission";

export type MissionWorkerPort = {
  onmessage: ((event: MessageEvent<unknown>) => void) | null;
  onerror: ((event: ErrorEvent) => void) | null;
  postMessage: (request: MissionWorkerRequest) => void;
  terminate: () => void;
};

type MissionRunControllerOptions = {
  createWorker: () => MissionWorkerPort;
  timeoutMs: number;
  onFinish: (
    response: MissionWorkerResponse | null,
    error: MissionRunnerError | null,
  ) => void;
  setTimeout?: (callback: () => void, delay: number) => number;
  clearTimeout?: (timeoutId: number) => void;
};

export function createMissionRunController({
  createWorker,
  timeoutMs,
  onFinish,
  setTimeout: schedule = (callback, delay) =>
    window.setTimeout(callback, delay),
  clearTimeout: cancelTimer = (timeoutId) =>
    window.clearTimeout(timeoutId),
}: MissionRunControllerOptions) {
  let activeWorker: MissionWorkerPort | null = null;
  let timeoutId: number | null = null;
  let runId = 0;
  let finishedRunId = 0;

  const finish = (
    currentRunId: number,
    response: MissionWorkerResponse | null,
    error: MissionRunnerError | null,
  ) => {
    if (currentRunId !== runId || !activeWorker) return;

    const worker = activeWorker;
    activeWorker = null;
    if (timeoutId !== null) {
      cancelTimer(timeoutId);
      timeoutId = null;
    }
    worker.onmessage = null;
    worker.onerror = null;
    worker.terminate();
    finishedRunId = currentRunId;
    onFinish(response, error);
  };

  return {
    start(code: string): boolean {
      if (activeWorker) return false;
      const currentRunId = ++runId;

      try {
        const worker = createWorker();
        activeWorker = worker;
        worker.onmessage = ({ data }) => {
          if (!isMissionWorkerResponse(data)) {
            finish(currentRunId, null, "internal");
            return;
          }
          finish(
            currentRunId,
            data,
            data.type === "error" ? data.error : null,
          );
        };
        worker.onerror = () => finish(currentRunId, null, "internal");
        timeoutId = schedule(
          () => finish(currentRunId, null, "timeout"),
          timeoutMs,
        );
        worker.postMessage({ code });
      } catch {
        if (activeWorker) finish(currentRunId, null, "internal");
        else if (finishedRunId !== currentRunId) onFinish(null, "internal");
      }

      return true;
    },
    cancel(): void {
      runId += 1;
      const worker = activeWorker;
      activeWorker = null;
      if (timeoutId !== null) {
        cancelTimer(timeoutId);
        timeoutId = null;
      }
      if (worker) {
        worker.onmessage = null;
        worker.onerror = null;
        worker.terminate();
      }
    },
    isRunning(): boolean {
      return activeWorker !== null;
    },
  };
}
