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
const challengeRegistry = loadTypeScript("src/lib/lab/challenges.ts", {
  "./mission": mission,
  "./types": loadTypeScript("src/lib/lab/types.ts"),
  "./challenge-utils": loadTypeScript("src/lib/lab/challenge-utils.ts"),
});
const { createSkillMap } = loadTypeScript("src/lib/lab/skill-map.ts", {
  "./mission": mission,
  "./challenges": challengeRegistry,
});
const route = readFileSync(path.resolve(root, "src/app/lab/[track]/[slug]/page.tsx"), "utf8");
const missionChallenge = challengeRegistry.getChallenge("javascript", mission.MISSION_ID);
const workspace = readFileSync(path.resolve(root, "src/components/lab/ChallengeWorkspace.tsx"), "utf8");
const workspacePanels = readFileSync(path.resolve(root, "src/components/lab/ChallengeWorkspacePanels.tsx"), "utf8");
const skillMapComponent = readFileSync(path.resolve(root, "src/components/lab/SkillMap.tsx"), "utf8");
const completionPanel = readFileSync(path.resolve(root, "src/components/lab/CompletionPanel.tsx"), "utf8");
const editor = readFileSync(path.resolve(root, "src/components/lab/CodeEditor.tsx"), "utf8");
const worker = readFileSync(path.resolve(root, "src/lib/lab/discount-calculation.worker.ts"), "utf8");
const runController = readFileSync(path.resolve(root, "src/lib/lab/mission-run-controller.ts"), "utf8");
const { compileMission, MissionSyntaxError } = loadTypeScript(
  "src/lib/lab/runner.ts",
  { "./mission": mission },
);
const header = readFileSync(path.resolve(root, "src/components/layout/Header.tsx"), "utf8");
const labPage = readFileSync(path.resolve(root, "src/app/lab/page.tsx"), "utf8");

test("mission route presents the approved scenario, metadata, and learning objective", () => {
  assert.equal(missionChallenge.title, "Fix the Discount Calculation Bug");
  assert.match(missionChallenge.mission.scenario.join(" "), /online store has a discount calculator/);
  assert.match(missionChallenge.mission.scenario.join(" "), /₹800/);
  assert.match(missionChallenge.mission.scenario.join(" "), /10%/);
  assert.match(missionChallenge.mission.objective, /calculateTotal/);
  assert.deepEqual(
    missionChallenge.tests.map(({ price, discountPercent, expected }) => [
      price,
      discountPercent,
      expected,
    ]),
    [[800, 10, 720], [1000, 20, 800], [500, 0, 500], [200, 100, 0]],
  );
  assert.match(route, /getChallenge\(params\.track, params\.slug\)/);
  assert.match(route, /MissionBrief challenge=\{challenge\}/);
  assert.match(route, /notFound\(\)/);
  assert.match(route, /alternates: \{ canonical \}/);
  assert.deepEqual(route.includes("ChallengeWorkspace"), true);
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
  assert.equal(
    mission.isSavedMissionProgress({
      ...valid,
      code: "x".repeat(mission.MAX_MISSION_CODE_LENGTH + 1),
    }),
    false,
  );
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
    () => compileMission("x".repeat(mission.MAX_MISSION_CODE_LENGTH + 1)),
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

test("worker runs the restricted mission interpreter and never evaluates source or leaks stacks", () => {
  assert.match(worker, /compileMission\(event\.data\.code\)/);
  assert.match(worker, /event\.data\.code\.length > MAX_MISSION_CODE_LENGTH/);
  assert.match(workspace, /MAX_MISSION_CODE_LENGTH/);
  assert.match(workspace, /Extra pasted characters were not kept/);
  assert.doesNotMatch(worker, /new Function|eval\(/);
  assert.doesNotMatch(worker, /fetch\(|importScripts|import\(/);
  assert.match(workspace, /RUN_TIMEOUT_MS = 1500/);
  assert.match(runController, /worker\.terminate\(\)/);
  assert.match(runController, /worker\.postMessage\(\{ code \}\)/);
  assert.match(runController, /timeoutMs/);
  assert.doesNotMatch(workspace, /fetch\(|\/api\//);
  assert.doesNotMatch(worker, /stack|process\.env|SMTP|contact/i);
  assert.match(workspacePanels, /Execution timed out/);
  assert.match(workspacePanels, /Show hint \{index \+ 1\}/);
  assert.match(completionPanel, /Mission Complete/);
  assert.match(workspacePanels, /role="status" aria-live="polite"/);
  assert.match(workspacePanels, /min-h-11/);
});

test("challenge and mentor CTAs point to implemented routes", () => {
  assert.match(header, /href="\/lab\/javascript\/discount-calculation-bug"/);
  assert.match(header, /Try Free Challenge/);
  assert.match(header, /href="\/contact"/);
  assert.match(header, /Talk to Mentor/);
  assert.match(labPage, /href=\{`\/lab\/\$\{featuredChallenge\.track\}\/\$\{featuredChallenge\.slug\}`\}/);
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
  const workspaceOffset = route.indexOf("<ChallengeWorkspace>");
  const briefOffset = route.indexOf("<MissionBrief");
  assert.ok(briefOffset > workspaceOffset, "The server-rendered brief must be passed into the workspace first");
  let previousIndex = -1;
  for (const section of sections.slice(1)) {
    const index = workspace.indexOf(section);
    assert.ok(index > previousIndex, `${section} must follow the previous mobile section`);
    previousIndex = index;
  }
  assert.ok(completionPanel.indexOf("<SkillMap") < completionPanel.indexOf('<nav aria-label="Next steps"'));
});
