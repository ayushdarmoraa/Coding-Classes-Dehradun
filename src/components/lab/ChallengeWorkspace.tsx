"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  trackLabAttempt,
  trackLabHintView,
  type LabChallengeContext,
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
import { LabAnalyticsSession } from "@/lib/lab/analytics-session";
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
  analyticsContext,
}: {
  children: ReactNode;
  analyticsContext: LabChallengeContext;
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
  const activeRunTokenRef = useRef<number | null>(null);
  const activeAttemptNumberRef = useRef(0);
  const { challengeSlug, track, difficulty } = analyticsContext;
  const analyticsSession = useMemo(
    () => new LabAnalyticsSession({ challengeSlug, track, difficulty }),
    [challengeSlug, track, difficulty],
  );
  const handleSkillMapViewed = useCallback(
    () => analyticsSession.skillMapViewed(),
    [analyticsSession],
  );

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

      const runToken = activeRunTokenRef.current;
      activeRunTokenRef.current = null;
      if (runToken !== null) {
        const runCompleted =
          response?.type === "results" &&
          response.results.length > 0 &&
          response.results.every((result) => result.status === "passed");
        analyticsSession.testResult(runToken, runCompleted);
      }

      if (
        response?.type === "results" &&
        response.results.length > 0 &&
        response.results.every((result) => result.status === "passed")
      ) {
        if (!completed) analyticsSession.complete(activeAttemptNumberRef.current);
        setCompleted(true);
      }
    },
    [analyticsSession, completed],
  );
  const finishRunRef = useRef(finishRun);
  finishRunRef.current = finishRun;

  useEffect(
    () => () => {
      const runToken = activeRunTokenRef.current;
      if (runToken !== null) {
        analyticsSession.cancelRun(runToken);
        activeRunTokenRef.current = null;
      }
      runControllerRef.current?.cancel();
    },
    [analyticsSession],
  );

  const runTests = useCallback(() => {
    if (!progressReady || runControllerRef.current?.isRunning()) return;
    const attemptNumber = attempts + 1;
    setAttempts(attemptNumber);
    setRunning(true);
    setRunnerError(null);
    setResults(null);
    trackLabAttempt(MISSION_ID);
    activeAttemptNumberRef.current = attemptNumber;
    activeRunTokenRef.current = analyticsSession.run(attemptNumber);

    if (!runControllerRef.current) {
      runControllerRef.current = createMissionRunController({
        createWorker: () => createDiscountCalculationWorker(),
        timeoutMs: RUN_TIMEOUT_MS,
        onFinish: (response, error) => finishRunRef.current(response, error),
      });
    }
    runControllerRef.current.start(code);
  }, [analyticsSession, attempts, code, progressReady]);

  const showHint = (index: number) => {
    if (!canRevealMissionHint(index, highestHintViewed)) return;
    setHighestHintViewed((level) => getHighestMissionHintViewed(level, index));
    trackLabHintView(MISSION_ID, index + 1);
    analyticsSession.hintOpen(index + 1);
  };

  const handleCodeChange = (nextCode: string) => {
    if (nextCode.length > MAX_MISSION_CODE_LENGTH) {
      const acceptedCode = nextCode.slice(0, MAX_MISSION_CODE_LENGTH);
      if (acceptedCode !== code) analyticsSession.firstEdit();
      setCode(acceptedCode);
      setCodeLimitMessage(
        `The editor limit is ${MAX_MISSION_CODE_LENGTH.toLocaleString()} characters. Extra pasted characters were not kept.`,
      );
      setResults(null);
      setHasRun(false);
      return;
    }
    if (nextCode !== code) analyticsSession.firstEdit();
    setCode(nextCode);
    setCodeLimitMessage("");
  };

  const resetMission = () => {
    const runToken = activeRunTokenRef.current;
    if (runToken !== null) analyticsSession.cancelRun(runToken);
    activeRunTokenRef.current = null;
    runControllerRef.current?.cancel();
    analyticsSession.reset();
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
          analyticsContext={analyticsContext}
          onSkillMapViewed={handleSkillMapViewed}
        />
      </div>
    </section>
  );
}
