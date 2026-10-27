import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = fileURLToPath(new URL("../", import.meta.url));
const require = createRequire(import.meta.url);

function loadTypeScript(relativePath, localModules = {}) {
  const source = readFileSync(path.resolve(root, relativePath), "utf8");
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const transpiledModule = { exports: {} };
  const localRequire = (specifier) => localModules[specifier] ?? require(specifier);
  new Function("require", "module", "exports", compiled)(localRequire, transpiledModule, transpiledModule.exports);
  return transpiledModule.exports;
}

const mission = loadTypeScript("src/lib/lab/mission.ts");
const { createSkillMap } = loadTypeScript("src/lib/lab/skill-map.ts", { "./mission": mission });
const route = readFileSync(path.resolve(root, "src/app/lab/javascript/discount-calculation-bug/page.tsx"), "utf8");
const workspace = readFileSync(path.resolve(root, "src/components/lab/ChallengeWorkspace.tsx"), "utf8");
const workspacePanels = readFileSync(path.resolve(root, "src/components/lab/ChallengeWorkspacePanels.tsx"), "utf8");
const skillMapComponent = readFileSync(path.resolve(root, "src/components/lab/SkillMap.tsx"), "utf8");
const completionPanel = readFileSync(path.resolve(root, "src/components/lab/CompletionPanel.tsx"), "utf8");
const editor = readFileSync(path.resolve(root, "src/components/lab/CodeEditor.tsx"), "utf8");
const worker = readFileSync(path.resolve(root, "src/lib/lab/discount-calculation.worker.ts"), "utf8");
const workerClient = readFileSync(path.resolve(root, "src/lib/lab/worker-client.ts"), "utf8");
const {
  isMissionWorkerResponse,
  MISSION_TESTS,
} = mission;
const { compileMission, MissionSyntaxError } = loadTypeScript("src/lib/lab/runner.ts", {
  "./mission": mission,
});
const { handleMissionMessage } = loadTypeScript("src/lib/lab/discount-calculation.worker.ts", {
  "./mission": mission,
  "./runner": { compileMission, MissionSyntaxError },
});
const { startMissionWorker } = loadTypeScript("src/lib/lab/worker-client.ts", {
  "./mission": mission,
});
const header = readFileSync(path.resolve(root, "src/components/layout/Header.tsx"), "utf8");
const labPage = readFileSync(path.resolve(root, "src/app/lab/page.tsx"), "utf8");

test("mission route presents the approved scenario, metadata, and learning objective", () => {
  assert.match(route, /Fix the Discount Calculation Bug/);
  assert.match(route, /An online store has a discount calculator/);
  assert.match(route, /A product costs ₹800/);
  assert.match(route, /The discount is 10%/);
  assert.match(route, /Expected total/);
  assert.match(route, /₹720/);
  assert.match(route, /Current output/);
  assert.match(route, /₹800/);
  assert.match(route, /calculateTotal/);
  assert.match(route, /learning objective/i);
  assert.match(route, /canonical: "\/lab\/javascript\/discount-calculation-bug"/);
});

test("starter code is intentionally incorrect and the deterministic cases cover boundaries", () => {
  assert.match(mission.MISSION_STARTER_CODE, /return price;/);
  assert.deepEqual(
    mission.MISSION_TESTS.map(({ price, discountPercent, expected }) => [price, discountPercent, expected]),
    [
      [800, 10, 720],
      [1000, 20, 800],
      [500, 0, 500],
      [200, 100, 0],
    ],
  );
});

test("saved mission progress rejects malformed values", () => {
  const valid = {
    code: mission.MISSION_STARTER_CODE,
    attempts: 2,
    highestHintViewed: 3,
    completed: false,
    updatedAt: "2026-10-25T00:00:00.000Z",
  };
  assert.equal(mission.isSavedMissionProgress(valid), true);
  assert.equal(mission.isSavedMissionProgress({ ...valid, attempts: -1 }), false);
  assert.equal(mission.isSavedMissionProgress({ ...valid, highestHintViewed: 4 }), false);
  assert.equal(mission.isSavedMissionProgress(null), false);
});

test("Skill Map statuses follow mission tests, boundary cases, and progressive hint count", () => {
  const results = mission.MISSION_TESTS.map((testCase) => ({
    ...testCase,
    actual: testCase.expected,
    status: "passed",
  }));
  const completedSkills = createSkillMap(results, 1, true);
  assert.deepEqual(
    completedSkills.map(({ label, status }) => [label, status]),
    [
      ["JavaScript expressions", "Demonstrated"],
      ["Requirements → logic", "Demonstrated"],
      ["Debugging with tests", "Demonstrated"],
      ["Edge-case handling", "Demonstrated"],
      ["Independent completion", "Demonstrated"],
    ],
  );

  const partialSkills = createSkillMap(
    results.map((result) =>
      result.id === "no-discount" ? { ...result, status: "incorrect" } : result,
    ),
    3,
    false,
  );
  assert.equal(partialSkills.find(({ id }) => id === "javascript-expressions").status, "Developing");
  assert.equal(partialSkills.find(({ id }) => id === "edge-case-handling").status, "Developing");
  assert.equal(partialSkills.find(({ id }) => id === "independent-completion").status, "Not demonstrated yet");

  const noEvidence = createSkillMap(null, 0, false);
  assert.ok(noEvidence.every(({ status }) => status === "Not demonstrated yet"));
  assert.equal(createSkillMap(results, 2, true).at(-1).status, "Developing");
});

test("mission runner evaluates the supported arithmetic expression and rejects executable syntax", () => {
  const calculateTotal = compileMission(
    "function calculateTotal(price, discountPercent) { return price * (100 - discountPercent) / 100; }",
  );
  assert.deepEqual(
    mission.MISSION_TESTS.map((testCase) => calculateTotal(testCase.price, testCase.discountPercent)),
    [720, 800, 500, 0],
  );
  assert.equal(
    compileMission("// amount after discount\nfunction calculateTotal(price, discountPercent) { /* formula */ return price * (100 - discountPercent) / 100; };")(800, 10),
    720,
  );
  assert.throws(
    () => compileMission("function calculateTotal(price, discountPercent) { return import('https://example.invalid/x'); }"),
    MissionSyntaxError,
  );
  assert.throws(
    () => compileMission("function calculateTotal(price, discountPercent) { return ({}).constructor.constructor('return globalThis')(); }"),
    MissionSyntaxError,
  );
  assert.throws(
    () => compileMission("function calculateTotal(price, discountPercent) { fetch('/private'); return price; }"),
    MissionSyntaxError,
  );
  assert.throws(
    () => compileMission("function calculateTotal(price, discountPercent) { while (true) {} }"),
    MissionSyntaxError,
  );
  assert.throws(
    () => compileMission(`function calculateTotal(price, discountPercent) { return ${"(".repeat(33)}price${")".repeat(33)}; }`),
    MissionSyntaxError,
  );
  assert.throws(
    () => compileMission(`function calculateTotal(price, discountPercent) { return ${"1 + ".repeat(1100)}1; }`),
    MissionSyntaxError,
  );
});

test("editor is CodeMirror 6 and is loaded only inside the client workspace", () => {
  assert.match(editor, /@uiw\/react-codemirror/);
  assert.match(editor, /@codemirror\/lang-javascript/);
  assert.match(workspace, /dynamic\(\(\) => import\("\.\/CodeEditor"\)/);
  assert.match(workspace, /ssr: false/);
  assert.match(workspace, /<MissionResults/);
  assert.match(workspace, /<MissionPreview/);
  assert.match(workspace, /<MissionHints/);
  assert.match(workspace, /<WorkspaceControls/);
  assert.doesNotMatch(workspace, /<section aria-labelledby="results-heading"/);
  assert.doesNotMatch(workspace, /<section aria-labelledby="preview-heading"/);
  assert.doesNotMatch(readFileSync(path.resolve(root, "src/app/page.tsx"), "utf8"), /CodeEditor|ChallengeWorkspace/);
});

test("worker rejects imports and network-capable expressions before evaluation", () => {
  for (const code of [
    'function calculateTotal(price, discountPercent) { return import("https://example.invalid/module.js"); }',
    "function calculateTotal(price, discountPercent) { return fetch('/private'); }",
    "function calculateTotal(price, discountPercent) { return new XMLHttpRequest(); }",
    "function calculateTotal(price, discountPercent) { return new WebSocket('wss://example.invalid'); }",
    "function calculateTotal(price, discountPercent) { return navigator.sendBeacon('/private'); }",
    "function calculateTotal(price, discountPercent) { return importScripts('/worker.js'); }",
  ]) {
    assert.deepEqual(
      handleMissionMessage({ code }),
      { type: "error", error: "syntax" },
    );
  }
});

test("worker protocol accepts only canonical complete results and rejects forged successes", () => {
  const code = "function calculateTotal(price, discountPercent) { return price * (100 - discountPercent) / 100; }";
  const response = handleMissionMessage({ code });
  assert.equal(isMissionWorkerResponse(response), true);
  assert.equal(
    response.type === "results" && response.results.every(({ status }) => status === "passed"),
    true,
  );

  if (response.type !== "results") return;
  const forged = {
    ...response,
    results: response.results.map((result, index) =>
      index === 0 ? { ...result, expected: 0 } : result,
    ),
  };
  assert.equal(isMissionWorkerResponse(forged), false);
  assert.equal(isMissionWorkerResponse({ type: "results", results: [] }), false);
  assert.equal(isMissionWorkerResponse({ type: "results", results: response.results.slice(1) }), false);
  assert.equal(isMissionWorkerResponse({ type: "error", error: "forged" }), false);
  assert.equal(isMissionWorkerResponse({ ...response, extra: true }), false);
});

test("worker catches evaluation exceptions and reports non-finite arithmetic as incorrect", () => {
  const throwingWorker = loadTypeScript("src/lib/lab/discount-calculation.worker.ts", {
    "./mission": mission,
    "./runner": {
      MissionSyntaxError,
      compileMission: () => () => {
        throw new Error("evaluation failure");
      },
    },
  });
  const throwingResponse = throwingWorker.handleMissionMessage({ code: "valid parsed expression" });
  assert.equal(throwingResponse.type, "results");
  if (throwingResponse.type === "results") {
    assert.ok(throwingResponse.results.every(({ status, actual }) =>
      status === "runtime-error" && actual === null,
    ));
  }

  const nonFiniteResponse = handleMissionMessage({
    code: "function calculateTotal(price, discountPercent) { return price / 0; }",
  });
  assert.equal(nonFiniteResponse.type, "results");
  if (nonFiniteResponse.type === "results") {
    assert.deepEqual(
      nonFiniteResponse.results.map(({ actual, status }) => [actual, status]),
      MISSION_TESTS.map(() => [null, "incorrect"]),
    );
  }
});

test("worker client rejects malformed or forged messages and terminates on timeout or cancellation", async () => {
  class FakeWorker {
    onmessage = null;
    onerror = null;
    onmessageerror = null;
    terminated = false;
    postedMessage = null;

    postMessage(message) {
      this.postedMessage = message;
    }

    terminate() {
      this.terminated = true;
    }
  }

  const malformedWorker = new FakeWorker();
  const malformedRun = startMissionWorker(malformedWorker, "code", 1000);
  assert.deepEqual(malformedWorker.postedMessage, { code: "code" });
  malformedWorker.onmessage({ data: { type: "results", results: [{ status: "passed" }] } });
  assert.deepEqual(await malformedRun.promise, { type: "error", error: "internal" });
  assert.equal(malformedWorker.terminated, true);

  const timeoutWorker = new FakeWorker();
  const timeoutRun = startMissionWorker(timeoutWorker, "code", 5);
  assert.deepEqual(await timeoutRun.promise, { type: "error", error: "timeout" });
  assert.equal(timeoutWorker.terminated, true);

  const cancelledWorker = new FakeWorker();
  const cancelledRun = startMissionWorker(cancelledWorker, "code", 1000);
  cancelledRun.cancel();
  assert.deepEqual(await cancelledRun.promise, { type: "cancelled" });
  assert.equal(cancelledWorker.terminated, true);
});

test("worker runs the restricted mission interpreter and never evaluates source or leaks stacks", () => {
  assert.match(worker, /compileMission\(request\.code\)/);
  assert.doesNotMatch(worker, /new Function|eval\(/);
  assert.doesNotMatch(worker, /fetch\(|importScripts|import\(/);
  assert.match(workspace, /RUN_TIMEOUT_MS = 1500/);
  assert.match(workspace, /startMissionWorker/);
  assert.match(workerClient, /worker\.postMessage\(\{ code \}\)/);
  assert.doesNotMatch(workspace, /fetch\(|\/api\//);
  assert.doesNotMatch(worker, /stack|process\.env|SMTP|contact/i);
  assert.match(workspacePanels, /Execution timed out/);
  assert.match(workspacePanels, /Show hint \{index \+ 1\}/);
  assert.match(completionPanel, /Mission Complete/);
  assert.match(workspacePanels, /aria-labelledby="results-heading" aria-live="polite"/);
  assert.match(workspacePanels, /min-h-11/);
});

test("challenge and mentor CTAs point to implemented routes", () => {
  assert.match(header, /href="\/lab\/javascript\/discount-calculation-bug"/);
  assert.match(header, /Try Free Challenge/);
  assert.match(header, /href="\/contact"/);
  assert.match(header, /Talk to Mentor/);
  assert.match(labPage, /href="\/lab\/javascript\/discount-calculation-bug"/);
});

test("completed mission integrates the limited Skill Map and existing next-step routes", () => {
  assert.match(workspace, /<CompletionPanel/);
  assert.match(workspace, /completed=\{completed\}/);
  assert.match(completionPanel, /<SkillMap/);
  assert.match(completionPanel, /href="\/lab"/);
  assert.match(completionPanel, /Explore DCA Lab/);
  assert.match(completionPanel, /href="\/courses\/full-stack"/);
  assert.match(completionPanel, /Explore Full-Stack Course/);
  assert.match(completionPanel, /href="\/contact"/);
  assert.match(completionPanel, /Talk to Mentor/);
  assert.match(skillMapComponent, /This Skill Map reflects what you demonstrated in this mission only\. It is not a complete assessment of your programming ability or job readiness\./);
  assert.match(skillMapComponent, /Not demonstrated yet/);
  assert.doesNotMatch(completionPanel, /Try Next Challenge/);
});

test("challenge workspace follows the required mobile content order", () => {
  const sections = [
    "Mission scenario",
    "<MissionPreview",
    "<CodeEditor",
    "<WorkspaceControls",
    "<MissionResults",
    "<MissionHints",
    "<CompletionPanel",
  ];
  const workspaceOffset = route.indexOf("<ChallengeWorkspace");
  assert.ok(route.indexOf(sections[0]) < workspaceOffset, "Mission brief must precede the workspace");
  let previousIndex = -1;
  for (const section of sections.slice(1)) {
    const index = workspace.indexOf(section);
    assert.ok(index > previousIndex, `${section} must follow the previous mobile section`);
    previousIndex = index;
  }
  assert.ok(completionPanel.indexOf("<SkillMap") < completionPanel.indexOf('<nav aria-label="Next steps"'));
});
