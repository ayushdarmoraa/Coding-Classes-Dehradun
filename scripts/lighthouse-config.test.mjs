import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { fileURLToPath } from "node:url";

const config = JSON.parse(
  readFileSync(new URL("../.lighthouserc.json", import.meta.url), "utf8"),
);
const assertions = config.ci.assert.assertions;

test("Lighthouse CI uses supported metrics and the agreed mobile thresholds", () => {
  const expectedAssertionIds = [
    "categories:performance",
    "metrics/first-contentful-paint",
    "metrics/largest-contentful-paint",
    "metrics/interactive",
    "metrics/total-blocking-time",
    "metrics/cumulative-layout-shift",
  ].sort();
  const configuredAssertionIds = Object.keys(assertions).sort();

  assert.deepEqual(
    configuredAssertionIds,
    expectedAssertionIds,
    `Lighthouse assertion IDs must match supported metrics; found: ${configuredAssertionIds.join(", ")}`,
  );
  assert.deepEqual(assertions["categories:performance"], [
    "warn",
    { minScore: 0.85 },
  ]);
  assert.deepEqual(assertions["metrics/first-contentful-paint"], [
    "warn",
    { maxNumericValue: 1500 },
  ]);
  assert.deepEqual(assertions["metrics/largest-contentful-paint"], [
    "warn",
    { maxNumericValue: 2500 },
  ]);
  assert.deepEqual(assertions["metrics/interactive"], [
    "warn",
    { maxNumericValue: 200 },
  ]);
  assert.deepEqual(assertions["metrics/total-blocking-time"], [
    "warn",
    { maxNumericValue: 200 },
  ]);
  assert.deepEqual(assertions["metrics/cumulative-layout-shift"], [
    "warn",
    { maxNumericValue: 0.1 },
  ]);
});
