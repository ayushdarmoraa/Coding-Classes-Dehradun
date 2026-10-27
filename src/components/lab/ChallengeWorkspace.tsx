"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { track } from "@/lib/analytics";
import {
  isSavedMissionProgress,
  MISSION_ID,
  MISSION_STARTER_CODE,
  MISSION_STORAGE_KEY,
  type MissionRunnerError,
  type MissionTestResult,
  type SavedMissionProgress,
} from "@/lib/lab/mission";
import { startMissionWorker } from "@/lib/lab/worker-client";
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

export default function ChallengeWorkspace() {
  const [code, setCode] = useState(MISSION_STARTER_CODE);
  const [attempts, setAttempts] = useState(0);
  const [highestHintViewed, setHighestHintViewed] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [results, setResults] = useState<MissionTestResult[] | null>(null);
  const [runnerError, setRunnerError] = useState<MissionRunnerError | null>(null);
  const [running, setRunning] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  const [storageMessage, setStorageMessage] = useState("");
  const [progressReady, setProgressReady] = useState(false);
  const workerRunRef = useRef<ReturnType<typeof startMissionWorker> | null>(null);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(MISSION_STORAGE_KEY);
      if (saved) {
        const parsed: unknown = JSON.parse(saved);
        if (isSavedMissionProgress(parsed)) {
          setCode(parsed.code);
          setAttempts(parsed.attempts);
          setHighestHintViewed(parsed.highestHintViewed);
          setCompleted(false);
        } else {
          setStorageMessage("Saved progress could not be read. Reset the mission to start fresh.");
        }
      }
    } catch {
      setStorageMessage("Progress is unavailable in this browser. You can still complete the mission for this visit.");
    } finally {
      setProgressReady(true);
    }
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
    try {
      window.localStorage.setItem(MISSION_STORAGE_KEY, JSON.stringify(progress));
    } catch {
      setStorageMessage("Progress could not be saved in this browser. You can continue for this visit.");
    }
  }, [attempts, code, completed, highestHintViewed, progressReady]);

  useEffect(
    () => () => {
      workerRunRef.current?.cancel();
    },
    [],
  );

  const finishRun = useCallback((outcome: Awaited<ReturnType<typeof startMissionWorker>["promise"]>) => {
    workerRunRef.current = null;
    if (outcome.type === "cancelled") return;
    const response = outcome.type === "results" ? outcome.response : null;
    setRunning(false);
    setHasRun(true);
    setRunnerError(outcome.type === "error" ? outcome.error : null);
    setResults(response?.results ?? null);

    if (response && response.results.every((result) => result.status === "passed")) {
      if (!completed) track("dca_lab_completed", { challenge_id: MISSION_ID });
      setCompleted(true);
    }
  }, [completed]);

  const runTests = useCallback(() => {
    if (workerRunRef.current) return;
    setAttempts((count) => count + 1);
    setRunning(true);
    setRunnerError(null);
    setResults(null);
    setCompleted(false);
    track("dca_lab_attempt", { challenge_id: MISSION_ID });

    try {
      const worker = new Worker(new URL("../../lib/lab/discount-calculation.worker.ts", import.meta.url), {
        type: "module",
      });
      const workerRun = startMissionWorker(worker, code, RUN_TIMEOUT_MS);
      workerRunRef.current = workerRun;
      void workerRun.promise.then(finishRun);
    } catch {
      finishRun({ type: "error", error: "internal" });
    }
  }, [code, finishRun]);

  const showHint = (index: number) => {
    setHighestHintViewed((level) => Math.max(level, index + 1));
    track("dca_lab_hint_view", { challenge_id: MISSION_ID, hint_level: index + 1 });
  };

  const resetMission = () => {
    workerRunRef.current?.cancel();
    workerRunRef.current = null;
    setCode(MISSION_STARTER_CODE);
    setAttempts(0);
    setHighestHintViewed(0);
    setCompleted(false);
    setResults(null);
    setRunnerError(null);
    setRunning(false);
    setHasRun(false);
    try {
      window.localStorage.removeItem(MISSION_STORAGE_KEY);
      setStorageMessage("");
    } catch {
      setStorageMessage("Saved progress could not be cleared. The editor has been reset for this visit.");
    }
  };

  const previewResult = results?.[0]?.actual ?? null;

  return (
    <section aria-labelledby="workspace-heading" className="mt-10 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="workspace-heading" className="text-2xl font-bold text-gray-900">Challenge workspace</h2>
          <p className="mt-1 text-sm text-gray-600">Edit the function, then run the deterministic checks.</p>
        </div>
        <p className="text-sm text-gray-600" aria-live="polite">Attempts: {attempts}</p>
      </div>

      <MissionPreview previewResult={previewResult} />
      <div className="overflow-hidden rounded-xl border border-gray-300">
        <CodeEditor value={code} onChange={setCode} />
      </div>
      <WorkspaceControls
        running={running}
        progressReady={progressReady}
        hasRun={hasRun}
        onRunTests={runTests}
        onReset={resetMission}
      />
      <MissionStatus storageMessage={storageMessage} />
      <MissionResults running={running} hasRun={hasRun} results={results} runnerError={runnerError} />
      <MissionHints highestHintViewed={highestHintViewed} onShowHint={showHint} />
      <CompletionPanel results={results} highestHintViewed={highestHintViewed} completed={completed} />
    </section>
  );
}
