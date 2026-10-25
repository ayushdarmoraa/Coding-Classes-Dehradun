import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { runInNewContext } from "node:vm";
import ts from "typescript";

const root = fileURLToPath(new URL("../", import.meta.url));
const require = createRequire(import.meta.url);

function loadTypeScript(relativePath, localModules = {}) {
  const source = readFileSync(path.resolve(root, relativePath), "utf8");
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  }).outputText;
  const loaded = { exports: {} };
  const localRequire = (specifier) => localModules[specifier] ?? require(specifier);
  new Function("require", "module", "exports", compiled)(
    localRequire,
    loaded,
    loaded.exports,
  );
  return loaded.exports;
}

const mission = loadTypeScript("src/lib/lab/mission.ts");
const storage = loadTypeScript("src/lib/lab/storage.ts", {
  "./mission": mission,
});
const execution = loadTypeScript("src/lib/lab/mission-run-controller.ts", {
  "./mission": mission,
});
const workerSource = loadTypeScript("src/lib/lab/discount-calculation.worker.ts");
const analytics = loadTypeScript("src/lib/analytics.ts");

const validProgress = {
  code: mission.MISSION_STARTER_CODE,
  attempts: 2,
  highestHintViewed: 1,
  completed: false,
  updatedAt: "2026-10-25T00:00:00.000Z",
};

function makeStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    values,
    getItem(key) {
      return values.has(key) ? values.get(key) : null;
    },
    setItem(key, value) {
      values.set(key, value);
    },
    removeItem(key) {
      values.delete(key);
    },
  };
}

function makeWorker({ postMessage = () => {} } = {}) {
  return {
    onmessage: null,
    onerror: null,
    terminated: 0,
    posted: [],
    postMessage(message) {
      this.posted.push(message);
      postMessage.call(this, message);
    },
    terminate() {
      this.terminated += 1;
    },
    send(data) {
      this.onmessage?.({ data });
    },
    fail() {
      this.onerror?.(new ErrorEvent("error"));
    },
  };
}

function makeTimerHarness() {
  const callbacks = new Map();
  const cleared = [];
  let nextId = 1;
  return {
    callbacks,
    cleared,
    setTimeout(callback, delay) {
      const id = nextId++;
      callbacks.set(id, { callback, delay });
      return id;
    },
    clearTimeout(id) {
      cleared.push(id);
      callbacks.delete(id);
    },
  };
}

function successfulResponse() {
  return {
    type: "results",
    results: mission.MISSION_TESTS.map((testCase) => ({
      ...testCase,
      actual: testCase.expected,
      status: "passed",
    })),
  };
}

test("versioned progress saves and reloads the existing supported fields", () => {
  const fakeStorage = makeStorage();

  assert.deepEqual(storage.loadMissionProgress(fakeStorage), { status: "empty" });
  assert.deepEqual(storage.saveMissionProgress(validProgress, fakeStorage), {
    status: "saved",
  });
  assert.equal(
    fakeStorage.values.has(mission.MISSION_STORAGE_KEY),
    true,
  );
  assert.deepEqual(storage.loadMissionProgress(fakeStorage), {
    status: "loaded",
    progress: validProgress,
  });
  assert.equal(validProgress.code, mission.MISSION_STARTER_CODE);
  assert.equal(validProgress.attempts, 2);
  assert.equal(validProgress.highestHintViewed, 1);
  assert.equal(validProgress.completed, false);
});

test("malformed JSON and invalid progress shapes are rejected without throwing", () => {
  const malformedJson = makeStorage({
    [mission.MISSION_STORAGE_KEY]: "{not-json",
  });
  const malformedShape = makeStorage({
    [mission.MISSION_STORAGE_KEY]: JSON.stringify({
      ...validProgress,
      attempts: -1,
    }),
  });

  assert.deepEqual(storage.loadMissionProgress(malformedJson), {
    status: "invalid",
  });
  assert.deepEqual(storage.loadMissionProgress(malformedShape), {
    status: "invalid",
  });
});

test("storage access and read, write, or clear exceptions are reported safely", () => {
  const throwingRead = makeStorage();
  throwingRead.getItem = () => {
    throw new Error("storage denied");
  };
  const throwingWrite = makeStorage();
  throwingWrite.setItem = () => {
    throw new Error("quota exceeded");
  };
  const throwingClear = makeStorage();
  throwingClear.removeItem = () => {
    throw new Error("storage denied");
  };

  assert.deepEqual(storage.loadMissionProgress(null), {
    status: "unavailable",
  });
  assert.deepEqual(storage.loadMissionProgress(throwingRead), {
    status: "unavailable",
  });
  assert.deepEqual(storage.saveMissionProgress(validProgress, throwingWrite), {
    status: "unavailable",
  });
  assert.deepEqual(storage.clearMissionProgress(throwingClear), {
    status: "unavailable",
  });
  assert.deepEqual(storage.saveMissionProgress({
    ...validProgress,
    highestHintViewed: 4,
  }, makeStorage()), { status: "invalid" });
});

test("browser storage getter failures are handled without blocking mission state", () => {
  const original = Object.getOwnPropertyDescriptor(globalThis, "window");
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: Object.defineProperty({}, "localStorage", {
      get() {
        throw new Error("storage disabled");
      },
    }),
  });

  try {
    assert.deepEqual(storage.loadMissionProgress(), { status: "unavailable" });
    assert.deepEqual(storage.saveMissionProgress(validProgress), {
      status: "unavailable",
    });
  } finally {
    if (original) Object.defineProperty(globalThis, "window", original);
    else delete globalThis.window;
  }
});

test("reset clears the versioned entry and hint progression stays sequential", () => {
  const fakeStorage = makeStorage({
    [mission.MISSION_STORAGE_KEY]: JSON.stringify(validProgress),
  });

  assert.deepEqual(storage.clearMissionProgress(fakeStorage), {
    status: "cleared",
  });
  assert.equal(fakeStorage.values.has(mission.MISSION_STORAGE_KEY), false);
  assert.equal(mission.canRevealMissionHint(0, 0), true);
  assert.equal(mission.canRevealMissionHint(1, 0), false);
  assert.equal(mission.getHighestMissionHintViewed(0, 0), 1);
  assert.equal(mission.canRevealMissionHint(1, 1), true);
  assert.equal(mission.getHighestMissionHintViewed(1, 1), 2);
  assert.equal(mission.canRevealMissionHint(3, 2), false);
  assert.equal(mission.getHighestMissionHintViewed(2, 3), 2);
});

test("generated worker parses the supported formula and rejects executable learner code", () => {
  let onMessage;
  const messages = [];
  const workerSelf = {
    addEventListener(type, listener) {
      assert.equal(type, "message");
      onMessage = listener;
    },
    postMessage(message) {
      messages.push(message);
    },
  };

  runInNewContext(workerSource.buildDiscountCalculationWorkerScript(), {
    self: workerSelf,
  });
  onMessage({
    data: {
      code: "function calculateTotal(price, discountPercent) { return price * (100 - discountPercent) / 100; }",
    },
  });

  const successfulRun = messages.pop();
  assert.equal(successfulRun.type, "results", JSON.stringify(successfulRun));
  assert.deepEqual(
    JSON.parse(JSON.stringify(successfulRun.results.map(({ actual, status }) => [actual, status]))),
    [[720, "passed"], [800, "passed"], [500, "passed"], [0, "passed"]],
  );

  onMessage({
    data: {
      code: "// preserve supported comments\nfunction /* declaration */ calculateTotal(price, discountPercent) { return price /* expression */ * (100 - discountPercent) / 100; };",
    },
  });
  assert.equal(messages.pop().type, "results");

  onMessage({
    data: {
      code: "function calculateTotal(price, discountPercent) { return price; }",
    },
  });
  assert.deepEqual(
    JSON.parse(JSON.stringify(messages.pop().results.map(({ actual, status }) => [actual, status]))),
    [[800, "incorrect"], [1000, "incorrect"], [500, "passed"], [200, "incorrect"]],
  );

  onMessage({
    data: {
      code: "function calculateTotal(price, discountPercent) { return globalThis.process; }",
    },
  });
  const rejectedRun = messages.pop();
  assert.equal(rejectedRun.type, "error");
  assert.equal(rejectedRun.error, "syntax");

  onMessage({
    data: {
      code: "function calculateTotal(price, discountPercent) { return -price; }",
    },
  });
  assert.equal(messages.pop().error, "syntax");
});

test("mission execution prevents overlapping runs and returns objective results", () => {
  const timers = makeTimerHarness();
  const worker = makeWorker();
  const outcomes = [];
  const controller = execution.createMissionRunController({
    createWorker: () => worker,
    timeoutMs: 1500,
    onFinish: (...outcome) => outcomes.push(outcome),
    setTimeout: timers.setTimeout,
    clearTimeout: timers.clearTimeout,
  });

  assert.equal(controller.start(mission.MISSION_STARTER_CODE), true);
  assert.equal(controller.isRunning(), true);
  assert.equal(controller.start("another run"), false);
  assert.equal(worker.posted.length, 1);
  assert.deepEqual(worker.posted[0], { code: mission.MISSION_STARTER_CODE });
  assert.deepEqual([...timers.callbacks.values()].map(({ delay }) => delay), [1500]);

  worker.send(successfulResponse());

  assert.equal(controller.isRunning(), false);
  assert.equal(worker.terminated, 1);
  assert.equal(outcomes.length, 1);
  assert.equal(outcomes[0][0].results.length, 4);
  assert.deepEqual(outcomes[0][0].results.map(({ status }) => status), [
    "passed",
    "passed",
    "passed",
    "passed",
  ]);
  assert.deepEqual(timers.cleared, [1]);
});

test("timeouts terminate workers, reject stale replies, and allow a later run", () => {
  const timers = makeTimerHarness();
  const workers = [];
  const outcomes = [];
  const controller = execution.createMissionRunController({
    createWorker: () => {
      const worker = makeWorker();
      workers.push(worker);
      return worker;
    },
    timeoutMs: 1500,
    onFinish: (...outcome) => outcomes.push(outcome),
    setTimeout: timers.setTimeout,
    clearTimeout: timers.clearTimeout,
  });

  controller.start(mission.MISSION_STARTER_CODE);
  const lateReply = workers[0].onmessage;
  const timer = timers.callbacks.get(1);
  timer.callback();

  assert.equal(workers[0].terminated, 1);
  assert.equal(outcomes[0][1], "timeout");
  lateReply({ data: successfulResponse() });
  assert.equal(outcomes.length, 1);

  assert.equal(controller.start(mission.MISSION_STARTER_CODE), true);
  workers[1].send(successfulResponse());
  assert.equal(outcomes.length, 2);
  assert.equal(outcomes[1][1], null);
});

test("worker syntax, runtime, malformed-message, startup, and post failures recover", () => {
  const timers = makeTimerHarness();
  const workers = [];
  const outcomes = [];
  const controller = execution.createMissionRunController({
    createWorker: () => {
      const worker = makeWorker();
      workers.push(worker);
      return worker;
    },
    timeoutMs: 1500,
    onFinish: (...outcome) => outcomes.push(outcome),
    setTimeout: timers.setTimeout,
    clearTimeout: timers.clearTimeout,
  });

  controller.start("invalid syntax");
  workers[0].send({ type: "error", error: "syntax" });
  assert.equal(outcomes[0][1], "syntax");
  assert.equal(workers[0].terminated, 1);

  controller.start("runtime error");
  workers[1].send({ type: "error", error: "runtime" });
  assert.equal(outcomes[1][1], "runtime");

  controller.start("malformed worker response");
  workers[2].send({ type: "results", results: [{ stack: "private detail" }] });
  assert.equal(outcomes[2][1], "internal");
  assert.equal(JSON.stringify(outcomes[2]).includes("private detail"), false);

  const startFailure = execution.createMissionRunController({
    createWorker: () => {
      throw new Error("internal startup detail");
    },
    timeoutMs: 1500,
    onFinish: (...outcome) => outcomes.push(outcome),
    setTimeout: timers.setTimeout,
    clearTimeout: timers.clearTimeout,
  });
  assert.equal(startFailure.start("code"), true);
  assert.equal(startFailure.isRunning(), false);
  assert.equal(outcomes[3][1], "internal");

  const postFailure = makeWorker({
    postMessage() {
      throw new Error("internal post detail");
    },
  });
  const postFailureController = execution.createMissionRunController({
    createWorker: () => postFailure,
    timeoutMs: 1500,
    onFinish: (...outcome) => outcomes.push(outcome),
    setTimeout: timers.setTimeout,
    clearTimeout: timers.clearTimeout,
  });
  postFailureController.start("code");
  assert.equal(outcomes[4][1], "internal");
  assert.equal(postFailure.terminated, 1);
});

test("cancel terminates an interrupted run and ignores its late response", () => {
  const timers = makeTimerHarness();
  const worker = makeWorker();
  const outcomes = [];
  const controller = execution.createMissionRunController({
    createWorker: () => worker,
    timeoutMs: 1500,
    onFinish: (...outcome) => outcomes.push(outcome),
    setTimeout: timers.setTimeout,
    clearTimeout: timers.clearTimeout,
  });

  controller.start("code");
  const lateReply = worker.onmessage;
  controller.cancel();

  assert.equal(controller.isRunning(), false);
  assert.equal(worker.terminated, 1);
  assert.deepEqual(timers.cleared, [1]);
  assert.equal(outcomes.length, 0);
  lateReply({ data: successfulResponse() });
  assert.equal(outcomes.length, 0);
});

test("Lab analytics preserve event contracts and exclude learner code and results", () => {
  const original = Object.getOwnPropertyDescriptor(globalThis, "window");
  const captured = [];
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: { dataLayer: captured },
  });

  try {
    analytics.trackLabAttempt(mission.MISSION_ID);
    analytics.trackLabHintView(mission.MISSION_ID, 2);
    analytics.trackLabCompletion(mission.MISSION_ID);
  } finally {
    if (original) Object.defineProperty(globalThis, "window", original);
    else delete globalThis.window;
  }

  assert.deepEqual(captured, [
    { event: "dca_lab_attempt", challenge_id: mission.MISSION_ID },
    {
      event: "dca_lab_hint_view",
      challenge_id: mission.MISSION_ID,
      hint_level: 2,
    },
    { event: "dca_lab_completed", challenge_id: mission.MISSION_ID },
  ]);
  assert.equal(JSON.stringify(captured).includes(mission.MISSION_STARTER_CODE), false);
  assert.equal(JSON.stringify(captured).includes("results"), false);
});

test("workspace wires persistence, result announcements, and interruptible reset accessibly", () => {
  const workspace = readFileSync(
    path.resolve(root, "src/components/lab/ChallengeWorkspace.tsx"),
    "utf8",
  );
  const panels = readFileSync(
    path.resolve(root, "src/components/lab/ChallengeWorkspacePanels.tsx"),
    "utf8",
  );
  const completion = readFileSync(
    path.resolve(root, "src/components/lab/CompletionPanel.tsx"),
    "utf8",
  );
  const route = readFileSync(
    path.resolve(root, "src/app/lab/[track]/[slug]/page.tsx"),
    "utf8",
  );

  assert.match(workspace, /loadMissionProgress/);
  assert.match(workspace, /saveMissionProgress/);
  assert.match(workspace, /clearMissionProgress/);
  assert.match(workspace, /trackLabAttempt/);
  assert.match(workspace, /trackLabHintView/);
  assert.match(workspace, /trackLabCompletion/);
  assert.match(route, /<ChallengeWorkspace>\s*<MissionBrief/);
  assert.match(workspace, /<MissionPreview/);
  assert.match(panels, /aria-live="polite"/);
  assert.match(panels, /role="alert"/);
  assert.match(completion, /role="status" aria-live="polite"/);
  assert.doesNotMatch(panels, /section aria-labelledby="results-heading" aria-live/);
});
