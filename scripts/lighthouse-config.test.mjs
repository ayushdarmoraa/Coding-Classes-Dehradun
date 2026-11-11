import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { fileURLToPath } from "node:url";

const config = JSON.parse(
  readFileSync(new URL("../.lighthouserc.json", import.meta.url), "utf8"),
);
const assertions = config.ci.assert.assertions;

test("Lighthouse CI uses supported metrics and the agreed mobile thresholds", () => {
  const supportedAssertions = new Set([
    "categories:performance",
    "first-contentful-paint",
    "largest-contentful-paint",
    "total-blocking-time",
    "cumulative-layout-shift",
  ]);

  assert.ok(
    Object.keys(assertions).every((id) => supportedAssertions.has(id)),
    "Lighthouse assertion IDs must be recognized by current Lighthouse CI",
  );
  assert.deepEqual(assertions["categories:performance"], [
    "warn",
    { minScore: 0.85 },
  ]);
  assert.deepEqual(assertions["largest-contentful-paint"], [
    "warn",
    { maxNumericValue: 2500 },
  ]);
  assert.deepEqual(assertions["cumulative-layout-shift"], [
    "warn",
    { maxNumericValue: 0.1 },
  ]);
  assert.deepEqual(config.ci.upload, {
    target: "filesystem",
    outputDir: ".lighthouseci",
  });
});
