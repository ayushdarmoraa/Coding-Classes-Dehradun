"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  trackLabAttempt,
  trackLabCompletion,
  trackLabHintView,
} from "@/lib/analytics";
import {
  canRevealMissionHint,
  getHighestMissionHintViewed,
  MAX_MISSION_CODE_LENGTH,
  MISSION_ID,
  MISSION_STARTER_CODE,
  type MissionRunnerError,
  type MissionTestResult,
  type MissionWorkerResponse,
  type SavedMissionProgress,
} from "@/lib/lab/mission";
import { createDiscountCalculationWorker } from "@/lib/lab/discount-calculation.worker";
import { createMissionRunController } from "@/lib/lab/mission-run-controller";
import {
  clearMissionProgress,
  loadMissionProgress,
  saveMissionProgress,
} from "@/lib/lab/storage";
import {
  MissionHints,
  MissionPreview,
  MissionResults,
  MissionStatus,
  WorkspaceControls,
} from "./ChallengeWorkspacePanels";
import CompletionPanel from "./CompletionPanel";

const CodeEditor = dynamic(() => import("./CodeEditor"), {
  ssr: false,
  loading: () => <p className="p-4 text-sm text-gray-600">Loading code editor…</p>,
});

const RUN_TIMEOUT_MS = 1500;

type MissionRunController = ReturnType<typeof createMissionRunController>;

export default function ChallengeWorkspace({
  children,
}: {
  children: ReactNode;
}) {
  const [code, setCode] = useState(MISSION_STARTER_CODE);
  const [attempts, setAttempts] = useState(0);
  const [highestHintViewed, setHighestHintViewed] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [results, setResults] = useState<MissionTestResult[] | null>(null);
  const [runnerError, setRunnerError] = useState<MissionRunnerError | null>(null);
  const [running, setRunning] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  const [storageMessage, setStorageMessage] = useState("");
  const [codeLimitMessage, setCodeLimitMessage] = useState("");
  const [progressReady, setProgressReady] = useState(false);
  const runControllerRef = useRef<MissionRunController | null>(null);
  const clearedProgressSnapshotRef = useRef<string | null>(null);

  useEffect(() => {
    const saved = loadMissionProgress();
    if (saved.status === "loaded") {
      setCode(saved.progress.code);
      setAttempts(saved.progress.attempts);
      setHighestHintViewed(saved.progress.highestHintViewed);
      setCompleted(saved.progress.completed);
    } else if (saved.status === "invalid") {
      setStorageMessage("Saved progress could not be read. Starting with a fresh mission.");
    } else if (saved.status === "unavailable") {
      setStorageMessage(
        "Progress is unavailable in this browser. You can still complete the mission for this visit.",
      );
    }
    setProgressReady(true);
  }, []);

  useEffect(() => {
    if (!progressReady) return;

    const progress: SavedMissionProgress = {
      code,
      attempts,
      highestHintViewed,
      completed,
      updatedAt: new Date().toISOString(),
    };
    const progressSnapshot = JSON.stringify([
      code,
      attempts,
      highestHintViewed,
      completed,
    ]);
    if (clearedProgressSnapshotRef.current === progressSnapshot) {
      clearedProgressSnapshotRef.current = null;
      return;
    }
    clearedProgressSnapshotRef.current = null;
    const saved = saveMissionProgress(progress);
    if (saved.status === "unavailable") {
      setStorageMessage(
        "Progress could not be saved in this browser. You can continue for this visit.",
      );
    }
  }, [attempts, code, completed, highestHintViewed, progressReady]);

  const finishRun = useCallback(
    (response: MissionWorkerResponse | null, error: MissionRunnerError | null) => {
      setRunning(false);
      setHasRun(true);
      setRunnerError(error);
      setResults(response?.type === "results" ? response.results : null);

      if (
        response?.type === "results" &&
        response.results.length > 0 &&
        response.results.every((result) => result.status === "passed")
      ) {
        if (!completed) trackLabCompletion(MISSION_ID);
        setCompleted(true);
      }
    },
    [completed],
  );
  const finishRunRef = useRef(finishRun);
  finishRunRef.current = finishRun;

  useEffect(
    () => () => {
      runControllerRef.current?.cancel();
    },
    [],
  );

  const runTests = useCallback(() => {
    if (!progressReady || runControllerRef.current?.isRunning()) return;
    setAttempts((count) => count + 1);
    setRunning(true);
    setRunnerError(null);
    setResults(null);
    trackLabAttempt(MISSION_ID);

    if (!runControllerRef.current) {
      runControllerRef.current = createMissionRunController({
        createWorker: () => createDiscountCalculationWorker(),
        timeoutMs: RUN_TIMEOUT_MS,
        onFinish: (response, error) => finishRunRef.current(response, error),
      });
    }
    runControllerRef.current.start(code);
  }, [code, progressReady]);

  const showHint = (index: number) => {
    if (!canRevealMissionHint(index, highestHintViewed)) return;
    setHighestHintViewed((level) => getHighestMissionHintViewed(level, index));
    trackLabHintView(MISSION_ID, index + 1);
  };

  const handleCodeChange = (nextCode: string) => {
    if (nextCode.length > MAX_MISSION_CODE_LENGTH) {
      setCode(nextCode.slice(0, MAX_MISSION_CODE_LENGTH));
      setCodeLimitMessage(
        `The editor limit is ${MAX_MISSION_CODE_LENGTH.toLocaleString()} characters. Extra pasted characters were not kept.`,
      );
      setResults(null);
      setHasRun(false);
      return;
    }
    setCode(nextCode);
    setCodeLimitMessage("");
  };

  const resetMission = () => {
    runControllerRef.current?.cancel();
    setCode(MISSION_STARTER_CODE);
    setAttempts(0);
    setHighestHintViewed(0);
    setCompleted(false);
    setResults(null);
    setRunnerError(null);
    setCodeLimitMessage("");
    setRunning(false);
    setHasRun(false);
    clearedProgressSnapshotRef.current = JSON.stringify([
      MISSION_STARTER_CODE,
      0,
      0,
      false,
    ]);

    const cleared = clearMissionProgress();
    setStorageMessage(
      cleared.status === "unavailable"
        ? "Saved progress could not be cleared. The editor has been reset for this visit."
        : "",
    );
  };

  const previewResult = results?.[0]?.actual ?? null;

  return (
    <section
      aria-labelledby="workspace-heading"
      className="mt-8 grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8"
    >
      <div className="lg:col-span-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 id="workspace-heading" className="text-2xl font-bold text-gray-900">
              Challenge workspace
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Edit the function, then run the deterministic checks.
            </p>
          </div>
          <p className="text-sm text-gray-600" aria-live="polite">
            Attempts: {attempts}
          </p>
        </div>
      </div>

      <div className="min-w-0">{children}</div>
      <div className="min-w-0">
        <MissionPreview previewResult={previewResult} />
      </div>

      <div className="min-w-0 overflow-hidden rounded-xl border border-gray-300 focus-within:ring-2 focus-within:ring-blue-700 focus-within:ring-offset-2 lg:col-span-2">
        <CodeEditor value={code} onChange={handleCodeChange} readOnly={!progressReady} />
      </div>
      {!progressReady && (
        <p role="status" aria-live="polite" className="lg:col-span-2 text-sm text-gray-600">
          Loading saved progress…
        </p>
      )}
      {codeLimitMessage && (
        <p role="alert" className="lg:col-span-2 text-sm text-amber-900">
          {codeLimitMessage}
        </p>
      )}
      <div className="space-y-4 lg:col-span-2">
        <WorkspaceControls
          running={running}
          progressReady={progressReady}
          hasRun={hasRun}
          onRunTests={runTests}
          onReset={resetMission}
        />
        <MissionStatus storageMessage={storageMessage} />
      </div>
      <div className="lg:col-span-2">
        <MissionResults
          running={running}
          hasRun={hasRun}
          results={results}
          runnerError={runnerError}
        />
      </div>
      <div className="lg:col-span-2">
        <MissionHints
          highestHintViewed={highestHintViewed}
          onShowHint={showHint}
        />
      </div>
      <div className="lg:col-span-2">
        <CompletionPanel
          results={results}
          highestHintViewed={highestHintViewed}
          completed={completed}
        />
      </div>
    </section>
  );
}
