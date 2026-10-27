import {
  type MissionRunnerError,
  type MissionTestResult,
} from "@/lib/lab/mission";

const HINTS = [
  "Think about what percentage of the price remains after the discount is applied.",
  "Convert the discount percentage into a fraction of the original price, then subtract that amount.",
  "The remaining fraction is (100 - discountPercent) / 100. Multiply the price by that fraction.",
] as const;

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
      <p className="text-sm text-gray-600">
        Use one <code>calculateTotal(price, discountPercent)</code> function with a return expression. Supported: numbers,
        these two inputs, parentheses, and +, -, *, /, or %.
      </p>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onRunTests}
          disabled={running || !progressReady}
          className="rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800 disabled:cursor-wait disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2"
        >
          {running ? "Running…" : hasRun ? "Run Again" : "Run Tests"}
        </button>
        <button
          type="button"
          onClick={onReset}
          disabled={running}
          className="rounded-lg border border-gray-400 px-5 py-3 font-semibold text-gray-800 hover:bg-gray-50 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2"
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
    storageMessage ? <p role="status" className="text-sm text-amber-800">{storageMessage}</p> : null
  );
}

type MissionResultsProps = {
  running: boolean;
  hasRun: boolean;
  results: MissionTestResult[] | null;
  runnerError: MissionRunnerError | null;
};

export function MissionResults({ running, hasRun, results, runnerError }: MissionResultsProps) {
  return (
    <section aria-labelledby="results-heading" aria-live="polite" className="rounded-xl border border-gray-200 bg-white p-5">
      <h3 id="results-heading" className="text-lg font-semibold text-gray-900">Test results</h3>
      {!hasRun && <p className="mt-2 text-gray-600">Run the tests to check your function.</p>}
      {running && <p className="mt-2 text-gray-700" role="status">Running mission tests…</p>}
      {runnerError && (
        <p className="mt-3 text-amber-900" role="alert">
          {runnerError === "syntax" && "Syntax error: check the function declaration and try again."}
          {runnerError === "runtime" && "Runtime error: the function could not be evaluated."}
          {runnerError === "timeout" && "Execution timed out. The worker was stopped; revise the code and try again."}
          {runnerError === "internal" && "The challenge runner could not start safely. Please try again later."}
        </p>
      )}
      {results && (
        <ul className="mt-4 space-y-3">
          {results.map((result) => (
            <li key={result.id} className="rounded-lg bg-gray-50 p-3">
              <p className="font-medium text-gray-900">
                {result.status === "passed" && "✓ Passed"}
                {result.status === "incorrect" && "✕ Failed"}
                {result.status === "runtime-error" && "⚠ Runtime error"}
                {" — "}
                ₹{result.price}, {result.discountPercent}% discount
              </p>
              <p className="mt-1 text-sm text-gray-700">
                Expected {formatRupees(result.expected)}; got {formatRupees(result.actual)}.
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function MissionPreview({ previewResult }: { previewResult: number | null }) {
  return (
    <section aria-labelledby="preview-heading" className="rounded-xl border border-blue-200 bg-blue-50 p-5">
      <h3 id="preview-heading" className="text-lg font-semibold text-gray-900">Trusted preview</h3>
      <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
        <dt className="text-gray-700">Product price</dt><dd className="font-medium">{formatRupees(800)}</dd>
        <dt className="text-gray-700">Discount</dt><dd className="font-medium">10%</dd>
        <dt className="text-gray-700">Current total</dt><dd className="font-medium">{formatRupees(previewResult ?? 800)}</dd>
        <dt className="text-gray-700">Expected total</dt><dd className="font-medium">{formatRupees(720)}</dd>
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
    <section aria-labelledby="hints-heading">
      <h3 id="hints-heading" className="text-lg font-semibold text-gray-900">Hints</h3>
      <ol className="mt-3 space-y-2">
        {HINTS.map((hint, index) => (
          <li key={hint}>
            {highestHintViewed > index ? (
              <p className="rounded-lg bg-amber-50 p-3 text-gray-800">
                <span className="font-semibold">Hint {index + 1}:</span> {hint}
              </p>
            ) : (
              <button
                type="button"
                onClick={() => onShowHint(index)}
                disabled={index > highestHintViewed}
                className="min-h-11 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-800 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2"
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
