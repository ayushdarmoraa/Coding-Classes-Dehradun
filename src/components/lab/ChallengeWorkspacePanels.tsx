import { motion, useReducedMotion } from "framer-motion";
import {
  canRevealMissionHint,
  MAX_MISSION_CODE_LENGTH,
  MISSION_HINTS,
  MISSION_TESTS,
  type MissionRunnerError,
  type MissionTestResult,
} from "@/lib/lab/mission";

function formatRupees(value: number | null): string {
  return value === null
    ? "No numeric result"
    : new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(value);
}

type WorkspaceControlsProps = {
  running: boolean;
  progressReady: boolean;
  hasRun: boolean;
  onRunTests: () => void;
  onReset: () => void;
};

export function WorkspaceControls({
  running,
  progressReady,
  hasRun,
  onRunTests,
  onReset,
}: WorkspaceControlsProps) {
  return (
    <>
      <p className="text-sm text-ink-2">
        Use one <code>calculateTotal(price, discountPercent)</code> function
        with a return expression. Supported: numbers, these two inputs,
        parentheses, and +, -, *, /, or %.
      </p>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onRunTests}
          disabled={running || !progressReady}
          className="pill min-h-12 bg-navy-grad px-6 py-3 font-semibold text-white shadow-soft-blue transition-transform hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
        >
          {running ? "Running…" : hasRun ? "Run Again" : "Run Tests"}
        </button>
        <button
          type="button"
          onClick={onReset}
          disabled={running}
          className="pill min-h-12 border border-brand-soft bg-white px-6 py-3 font-semibold text-ink-2 transition-colors hover:bg-brand-soft disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
        >
          Reset mission
        </button>
      </div>
    </>
  );
}

type MissionStatusProps = {
  storageMessage: string;
};

export function MissionStatus({ storageMessage }: MissionStatusProps) {
  return (
    storageMessage ? (
      <p role="status" className="rounded-dca-sm border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
        {storageMessage}
      </p>
    ) : null
  );
}

type MissionResultsProps = {
  running: boolean;
  hasRun: boolean;
  runCancelled: boolean;
  results: MissionTestResult[] | null;
  runnerError: MissionRunnerError | null;
};

export function MissionResults({
  running,
  hasRun,
  runCancelled,
  results,
  runnerError,
}: MissionResultsProps) {
  const passed = results?.filter((result) => result.status === "passed").length ?? 0;
  const reduceMotion = useReducedMotion() ?? false;
  return (
    <section aria-labelledby="results-heading" className="surface-card p-5 sm:p-6">
      <h3 id="results-heading" className="text-xl font-semibold text-ink">Test results</h3>
      {!hasRun && <p className="mt-2 text-ink-2">Run the tests to check your function.</p>}
      {running && <p className="mt-2 text-ink-2" role="status" aria-live="polite">Running mission tests…</p>}
      {runCancelled && (
        <p className="mt-2 text-ink-2" role="status" aria-live="polite">
          Execution was canceled because the code changed. Run Tests again to check the latest code.
        </p>
      )}
      {!running && hasRun && !runnerError && results && (
        <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
          {passed === results.length
            ? `All ${results.length} mission tests passed.`
            : `${passed} of ${results.length} mission tests passed.`}
        </p>
      )}
      {runnerError && (
        <p className="mt-3 rounded-dca-sm border border-amber-200 bg-amber-50 p-3 text-amber-900" role="alert" aria-live="assertive">
          {runnerError === "syntax" && "Syntax error: check the function declaration and try again."}
          {runnerError === "runtime" && "Runtime error: the function could not be evaluated."}
          {runnerError === "timeout" && "Execution timed out. The worker was stopped; revise the code and try again."}
          {runnerError === "input-too-long" && `The submitted code exceeds the ${MAX_MISSION_CODE_LENGTH.toLocaleString()}-character limit.`}
          {runnerError === "internal" && "The challenge runner could not start safely. Please try again later."}
        </p>
      )}
      {results && (
        <ul className="mt-4 space-y-3">
          {results.map((result, index) => (
            <motion.li
              key={result.id}
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: reduceMotion ? 0 : 0.22,
                delay: reduceMotion ? 0 : index * 0.04,
              }}
              className={`rounded-dca-sm border p-4 ${
                result.status === "passed"
                  ? "border-green-200 bg-tint-mint"
                  : "border-amber-200 bg-tint-peach"
              }`}
            >
              <p className="font-medium text-ink">
                {result.status === "passed" && "✓ Passed"}
                {result.status === "incorrect" && "✕ Failed"}
                {result.status === "runtime-error" && "⚠ Runtime error"}
                {" — "}
                ₹{result.price}, {result.discountPercent}% discount
              </p>
              <p className="mt-1 text-sm text-ink-2">
                Expected {formatRupees(result.expected)}; got {formatRupees(result.actual)}.
              </p>
            </motion.li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function MissionPreview({ previewResult }: { previewResult: number | null }) {
  const firstCase = MISSION_TESTS[0];
  return (
    <section aria-labelledby="preview-heading" className="rounded-dca-md border border-brand-soft bg-tint-blue p-5 sm:p-6">
      <h3 id="preview-heading" className="text-xl font-semibold text-ink">Trusted preview</h3>
      <p className="mt-1 text-sm text-ink-2">A live reference for the first fixed mission case.</p>
      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 rounded-dca-sm border border-white/80 bg-white/80 p-4 text-sm">
        <dt className="text-ink-2">Product price</dt><dd className="font-medium text-ink">{formatRupees(firstCase.price)}</dd>
        <dt className="text-ink-2">Discount</dt><dd className="font-medium text-ink">{firstCase.discountPercent}%</dd>
        <dt className="text-ink-2">Current total</dt><dd className="font-medium text-ink">{formatRupees(previewResult ?? firstCase.price)}</dd>
        <dt className="text-ink-2">Expected total</dt><dd className="font-medium text-ink">{formatRupees(firstCase.expected)}</dd>
      </dl>
    </section>
  );
}

type MissionHintsProps = {
  highestHintViewed: number;
  onShowHint: (index: number) => void;
};

export function MissionHints({ highestHintViewed, onShowHint }: MissionHintsProps) {
  return (
    <section aria-labelledby="hints-heading" className="rounded-dca-md border border-brand-soft bg-white p-5 sm:p-6">
      <h3 id="hints-heading" className="text-xl font-semibold text-ink">Hints</h3>
      <ol className="mt-3 space-y-2">
        {MISSION_HINTS.map((hint, index) => (
          <li key={hint}>
            {highestHintViewed > index ? (
              <p className="rounded-dca-sm border border-amber-200 bg-amber-50 p-3 text-ink-2">
                <span className="font-semibold">Hint {index + 1}:</span> {hint}
              </p>
            ) : (
              <button
                type="button"
                onClick={() => onShowHint(index)}
                disabled={!canRevealMissionHint(index, highestHintViewed)}
                className="pill min-h-11 border border-brand-soft bg-white px-4 py-2 text-sm font-semibold text-brand-dark transition-colors hover:bg-brand-soft disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
              >
                Show hint {index + 1}
              </button>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
