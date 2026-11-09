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
const analyticsMetadata = loadTypeScript("src/lib/lab/analytics-metadata.ts");
const challengeUtils = loadTypeScript("src/lib/lab/challenge-utils.ts");
const challengeTypes = loadTypeScript("src/lib/lab/types.ts");
const challenges = loadTypeScript("src/lib/lab/challenges.ts", {
  "./mission": mission,
  "./types": challengeTypes,
  "./challenge-utils": challengeUtils,
  "./analytics-metadata": analyticsMetadata,
});
const storage = loadTypeScript("src/lib/lab/storage.ts", {
  "./mission": mission,
});
const execution = loadTypeScript("src/lib/lab/mission-run-controller.ts", {
  "./mission": mission,
});
const workerSource = loadTypeScript("src/lib/lab/discount-calculation.worker.ts");
const analytics = loadTypeScript("src/lib/analytics.ts", {
  "./lab/analytics-metadata": analyticsMetadata,
});
const labAnalyticsSession = loadTypeScript("src/lib/lab/analytics-session.ts", {
  "@/lib/analytics": analytics,
});

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

test("worker rejects imports, network access, malformed requests, and forged results", () => {
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

  for (const expression of [
    'import("https://example.invalid/module.js")',
    "fetch('/private')",
    "new XMLHttpRequest()",
  ]) {
    onMessage({
      data: {
        code: `function calculateTotal(price, discountPercent) { return ${expression}; }`,
      },
    });
    assert.equal(messages.pop().error, "syntax", expression);
  }

  onMessage({
    data: {
      code: "function calculateTotal(price, discountPercent) { return price; }",
      forged: true,
    },
  });
  assert.deepEqual(
    JSON.parse(JSON.stringify(messages.pop())),
    { type: "error", error: "internal" },
  );

  onMessage({
    data: {
      code: "x".repeat(mission.MAX_MISSION_CODE_LENGTH + 1),
    },
  });
  assert.deepEqual(
    JSON.parse(JSON.stringify(messages.pop())),
    { type: "error", error: "input-too-long" },
  );

  const valid = successfulResponse();
  assert.equal(mission.isMissionWorkerResponse(valid), true);
  assert.equal(
    mission.isMissionWorkerResponse({ ...valid, success: true }),
    false,
  );
  assert.equal(
    mission.isMissionWorkerResponse({
      ...valid,
      results: [{ ...valid.results[0], status: "passed", actual: -1 }, ...valid.results.slice(1)],
    }),
    false,
  );
  assert.equal(
    mission.isMissionWorkerResponse({
      ...valid,
      results: [{ ...valid.results[0], stack: "forged" }, ...valid.results.slice(1)],
    }),
    false,
  );
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

test("Lab route classifiers distinguish index and mission routes without changing existing labels", () => {
  const publishedPaths = challenges
    .getPublishedChallenges()
    .map(challengeUtils.getChallengePath);
  const draftChallenge = {
    ...challenges.challenges[0],
    id: "draft-only-mission",
    slug: "draft-only-mission",
    status: "draft",
  };
  const draftPaths = challenges
    .getPublishedChallenges([draftChallenge])
    .map(challengeUtils.getChallengePath);
  const draftPath = challengeUtils.getChallengePath(draftChallenge);
  assert.deepEqual(draftPaths, []);
  assert.equal(analytics.derivePageContext(draftPath).page_type, "generic");
  assert.deepEqual(
    publishedPaths,
    analyticsMetadata.PUBLISHED_LAB_ANALYTICS_METADATA.map(
      ({ track, slug }) => `/lab/${track}/${slug}`,
    ),
  );

  assert.equal(analytics.derivePageContext("/lab").page_type, "lab_index");
  assert.equal(analytics.derivePageContext("/lab/").page_type, "lab_index");
  assert.equal(analytics.derivePageContext("/lab//").page_type, "lab_index");
  assert.equal(
    analytics.derivePageContext("/lab/javascript/discount-calculation-bug").page_type,
    "lab_challenge",
  );
  assert.equal(
    analytics.derivePageContext("/lab/javascript/discount-calculation-bug/").page_type,
    "lab_challenge",
  );
  assert.equal(analytics.derivePageContext("/lab/javascript").page_type, "generic");
  assert.equal(analytics.derivePageContext("/lab/javascript/draft-mission").page_type, "generic");
  assert.equal(analytics.derivePageContext("/lab/unknown/mission").page_type, "generic");
  assert.equal(analytics.derivePageContext("/lab//javascript/discount-calculation-bug").page_type, "generic");
  assert.equal(analytics.derivePageContext("/lab/javascript/discount-calculation-bug?email=user@example.invalid").page_type, "generic");
  assert.equal(analytics.derivePageContext("/lab/javascript/discount-calculation-bug#private").page_type, "generic");
  assert.equal(analytics.derivePageContext("/courses/python").page_type, "course_detail");
  assert.equal(analytics.derivePageContext("/online-courses/python").page_type, "online_course_detail");
  assert.equal(analytics.derivePageContext("/vs/scaler").page_type, "comparison");
  assert.equal(analytics.derivePageContext("/blog/example").page_type, "blog_post");
  assert.equal(analytics.derivePageContext("/contact").page_type, "contact");
  assert.equal(analytics.derivePageContext("/other").page_type, "generic");

  const layout = readFileSync(path.resolve(root, "src/app/layout.tsx"), "utf8");
  const script = layout.match(
    /<Script id="ga4-delegated-clicks"[^>]*>\s*\{\s*`([\s\S]*?)`\s*\}\s*<\/Script>/,
  );
  assert.ok(script, "expected the delegated-click script in layout");
  const emittedScript = new Function(
    `return \`${script[1].replace(
      "${JSON.stringify(PUBLISHED_LAB_PATHS)}",
      JSON.stringify(publishedPaths),
    )}\`;`,
  )();
  const instrumentedScript = emittedScript.replace(
    /\}\)\(\);\s*$/,
    "window.__pageTypeFromPath = pageTypeFromPath;\n})();",
  );
  assert.notEqual(instrumentedScript, emittedScript);
  const window = {};
  runInNewContext(instrumentedScript, {
    document: {
      addEventListener() {},
      removeEventListener() {},
    },
    location: { pathname: "/" },
    window,
  });
  const pageTypeFromPath = window.__pageTypeFromPath;
  assert.equal(pageTypeFromPath("/"), "home");
  assert.equal(pageTypeFromPath("/lab"), "lab_index");
  assert.equal(pageTypeFromPath("/lab/"), "lab_index");
  assert.equal(pageTypeFromPath("/lab///"), "lab_index");
  assert.equal(
    pageTypeFromPath("/lab/javascript/discount-calculation-bug"),
    "lab_challenge",
  );
  assert.equal(pageTypeFromPath("/lab/javascript/discount-calculation-bug/"), "lab_challenge");
  assert.equal(pageTypeFromPath("/lab/javascript/not-published"), "home");
  assert.equal(pageTypeFromPath(draftPath), "home");
  assert.equal(pageTypeFromPath("/courses/python"), "course");
  assert.equal(pageTypeFromPath("/courses"), "course");
  assert.equal(pageTypeFromPath("/online-courses/python"), "online_course");
  assert.equal(pageTypeFromPath("/online-courses"), "online_course");
  assert.equal(pageTypeFromPath("/blog/example"), "blog");
  assert.equal(pageTypeFromPath("/blog"), "blog");
  assert.equal(pageTypeFromPath("/locations/dehradun"), "locations");
  assert.equal(pageTypeFromPath("/locations/dehradun/"), "locations");
  assert.equal(pageTypeFromPath("/vs/scaler"), "vs");
  assert.equal(pageTypeFromPath("/contact"), "home");
  assert.equal(pageTypeFromPath("/unrecognized"), "home");
});

test("new Lab analytics helpers emit only their explicit safe event contracts", () => {
  const original = Object.getOwnPropertyDescriptor(globalThis, "window");
  const captured = [];
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: { location: { pathname: "/lab/javascript/discount-calculation-bug" }, dataLayer: captured },
  });
  const context = {
    challengeSlug: "discount-calculation-bug",
    track: "javascript",
    difficulty: "Beginner",
    sourceCode: "learner code",
    name: "Learner Name",
    email: "learner@example.invalid",
    phone: "+10000000000",
    message: "private form message",
    testValue: 12345,
    results: { passed: false, output: "complete private test output" },
    stack: "Error: private runtime stack\n    at run (worker.js:1:1)",
  };

  try {
    analytics.trackLabImpression(context);
    analytics.trackLabStart(context);
    analytics.trackLabFirstEdit(context);
    analytics.trackLabRun(context, 2);
    analytics.trackLabTestResult(context, 2, false);
    analytics.trackLabHintOpen(context, 1);
    analytics.trackLabReset(context);
    analytics.trackLabComplete(context, 2);
    analytics.trackLabSkillMapView(context);
    analytics.trackLabCourseClick(context, "full-stack");
    analytics.trackLabContactClick(context);
  } finally {
    if (original) Object.defineProperty(globalThis, "window", original);
    else delete globalThis.window;
  }

  assert.deepEqual(captured, [
    {
      event: "lab_impression",
      challenge_slug: "discount-calculation-bug",
      track: "javascript",
      difficulty: "Beginner",
      page_path: "/lab/javascript/discount-calculation-bug",
    },
    {
      event: "lab_start",
      challenge_slug: "discount-calculation-bug",
      track: "javascript",
      difficulty: "Beginner",
      page_path: "/lab/javascript/discount-calculation-bug",
    },
    {
      event: "lab_first_edit",
      challenge_slug: "discount-calculation-bug",
      track: "javascript",
      difficulty: "Beginner",
      page_path: "/lab/javascript/discount-calculation-bug",
    },
    {
      event: "lab_run",
      challenge_slug: "discount-calculation-bug",
      track: "javascript",
      difficulty: "Beginner",
      page_path: "/lab/javascript/discount-calculation-bug",
      attempt_number: 2,
    },
    {
      event: "lab_test_result",
      challenge_slug: "discount-calculation-bug",
      track: "javascript",
      difficulty: "Beginner",
      page_path: "/lab/javascript/discount-calculation-bug",
      attempt_number: 2,
      completed: false,
    },
    {
      event: "lab_hint_open",
      challenge_slug: "discount-calculation-bug",
      track: "javascript",
      difficulty: "Beginner",
      page_path: "/lab/javascript/discount-calculation-bug",
      hint_level: 1,
    },
    {
      event: "lab_reset",
      challenge_slug: "discount-calculation-bug",
      track: "javascript",
      difficulty: "Beginner",
      page_path: "/lab/javascript/discount-calculation-bug",
    },
    {
      event: "lab_complete",
      challenge_slug: "discount-calculation-bug",
      track: "javascript",
      difficulty: "Beginner",
      page_path: "/lab/javascript/discount-calculation-bug",
      attempt_number: 2,
      completed: true,
    },
    {
      event: "lab_skill_map_view",
      challenge_slug: "discount-calculation-bug",
      track: "javascript",
      difficulty: "Beginner",
      page_path: "/lab/javascript/discount-calculation-bug",
    },
    {
      event: "lab_course_click",
      challenge_slug: "discount-calculation-bug",
      track: "javascript",
      difficulty: "Beginner",
      page_path: "/lab/javascript/discount-calculation-bug",
      related_course_slug: "full-stack",
    },
    {
      event: "lab_contact_click",
      challenge_slug: "discount-calculation-bug",
      track: "javascript",
      difficulty: "Beginner",
      page_path: "/lab/javascript/discount-calculation-bug",
    },
  ]);

  const serialized = JSON.stringify(captured);
  for (const prohibited of [
    context.sourceCode,
    context.name,
    context.email,
    context.phone,
    context.message,
    String(context.testValue),
    JSON.stringify(context.results),
    context.stack,
  ]) {
    assert.equal(serialized.includes(prohibited), false);
  }
  assert.equal(serialized.includes("lab_next_challenge_click"), false);
});

test("Lab analytics reject invalid allowlisted values and omit unsafe page paths", () => {
  const original = Object.getOwnPropertyDescriptor(globalThis, "window");
  const captured = [];
  const location = { pathname: "/lab/javascript/discount-calculation-bug" };
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: { location, dataLayer: captured },
  });
  const validContext = {
    challengeSlug: "discount-calculation-bug",
    track: "javascript",
    difficulty: "Beginner",
  };

  try {
    const invalidContexts = [
      { ...validContext, challengeSlug: "learner@example.invalid" },
      { ...validContext, challengeSlug: "1234567890" },
      {
        ...validContext,
        challengeSlug: "function calculateTotal(price) { return price; }",
      },
      { ...validContext, challengeSlug: "ayush" },
      { ...validContext, track: "learner@example.invalid" },
      { ...validContext, track: "private-source-code" },
      { ...validContext, difficulty: "name@example.invalid" },
      { ...validContext, difficulty: "stack at runtime" },
    ];
    for (const context of invalidContexts) {
      analytics.trackLabImpression(context);
    }
    analytics.trackLabRun(validContext, "complete test output");
    analytics.trackLabRun(validContext, 0);
    analytics.trackLabRun(validContext, 10001);
    analytics.trackLabRun(validContext, Number.NaN);
    analytics.trackLabHintOpen(validContext, "Error: stack trace");
    analytics.trackLabHintOpen(validContext, 0);
    analytics.trackLabHintOpen(validContext, 6);
    analytics.trackLabHintOpen(validContext, 5551234567);
    analytics.trackLabTestResult(
      validContext,
      1,
      { passed: true, results: ["private test output"], stack: "runtime stack" },
    );
    analytics.trackLabCourseClick(validContext, "learner@example.invalid");
    analytics.trackLabCourseClick(
      validContext,
      "function calculateTotal(price) { return price; }",
    );

    assert.equal(captured.length, 0);

    const unsafePathnames = [
      "/lab/javascript/discount-calculation-bug?email=learner@example.invalid",
      "/lab/javascript/discount-calculation-bug#private-fragment",
      "/lab/learner@example.invalid/discount-calculation-bug",
      "/lab/javascript/5551234567",
      "/lab/javascript/ayush",
      "/lab/javascript/discount_calculation_bug",
      "/lab/javascript/not-published",
      "/lab//javascript/discount-calculation-bug",
    ];
    for (const pathname of unsafePathnames) {
      location.pathname = pathname;
      analytics.trackLabImpression(validContext);
      assert.equal(
        Object.prototype.hasOwnProperty.call(captured.at(-1), "page_path"),
        false,
        `unsafe pathname should be omitted: ${pathname}`,
      );
    }

    location.pathname = "/lab/javascript/discount-calculation-bug///";
    analytics.trackLabImpression(validContext);
    assert.equal(
      captured.at(-1).page_path,
      "/lab/javascript/discount-calculation-bug",
    );

    const serialized = JSON.stringify(captured);
    for (const prohibited of [
      "complete test output",
      "private runtime stack",
      "Error: stack trace",
      "private test output",
      "learner@example.invalid",
      "5551234567",
      "function calculateTotal(price) { return price; }",
      "ayush",
    ]) {
      assert.equal(serialized.includes(prohibited), false);
    }
  } finally {
    if (original) Object.defineProperty(globalThis, "window", original);
    else delete globalThis.window;
  }
});

// Analytics semantics: impressions are once per mounted route view; start requires
// a clicked start link; edits and Skill Map views are once per challenge view;
// every Run Tests action gets one aggregate result; only revealed hints count;
// reset clears completion-cycle state; course/contact events require their links.
test("Lab analytics session deduplicates view and transition events and maps actual links", () => {
  const original = Object.getOwnPropertyDescriptor(globalThis, "window");
  const captured = [];
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      location: { pathname: "/lab/javascript/discount-calculation-bug" },
      dataLayer: captured,
    },
  });
  const context = {
    challengeSlug: "discount-calculation-bug",
    track: "javascript",
    difficulty: "Beginner",
  };
  const session = new labAnalyticsSession.LabAnalyticsSession(context);

  try {
    session.pageImpression();
    session.pageImpression();
    const indexImpression = labAnalyticsSession.createLabIndexImpressionTracker(context);
    indexImpression("/lab");
    indexImpression("/lab/");
    indexImpression("/courses");
    indexImpression("/lab///");
    session.firstEdit();
    session.firstEdit();
    labAnalyticsSession.recordLabLinkClick({ event: "start", context });

    const firstRun = session.run(1);
    session.testResult(firstRun, true);
    session.testResult(firstRun, true);
    const secondRun = session.run(2);
    session.testResult(secondRun, false);
    session.hintOpen(1);
    session.reset();
    session.complete(2);
    session.complete(2);
    session.skillMapViewed();
    session.skillMapViewed();
    labAnalyticsSession.recordLabLinkClick({
      event: "course",
      context,
      relatedCourseSlug: "full-stack",
    });
    labAnalyticsSession.recordLabLinkClick({ event: "contact", context });
  } finally {
    if (original) Object.defineProperty(globalThis, "window", original);
    else delete globalThis.window;
  }

  assert.deepEqual(
    captured.map(({ event }) => event),
    [
      "lab_impression",
      "lab_impression",
      "lab_impression",
      "lab_first_edit",
      "lab_start",
      "lab_run",
      "lab_test_result",
      "lab_run",
      "lab_test_result",
      "lab_hint_open",
      "lab_reset",
      "lab_complete",
      "dca_lab_completed",
      "lab_skill_map_view",
      "lab_course_click",
      "lab_contact_click",
    ],
  );
  assert.deepEqual(captured[6], {
    event: "lab_test_result",
    challenge_slug: "discount-calculation-bug",
    track: "javascript",
    difficulty: "Beginner",
    page_path: "/lab/javascript/discount-calculation-bug",
    attempt_number: 1,
    completed: true,
  });
  assert.deepEqual(captured[8], {
    event: "lab_test_result",
    challenge_slug: "discount-calculation-bug",
    track: "javascript",
    difficulty: "Beginner",
    page_path: "/lab/javascript/discount-calculation-bug",
    attempt_number: 2,
    completed: false,
  });
  assert.deepEqual(captured[12], {
    event: "dca_lab_completed",
    challenge_id: "discount-calculation-bug",
  });
  const payloads = JSON.stringify(captured);
  for (const prohibited of [
    mission.MISSION_STARTER_CODE,
    "learner@example.invalid",
    "private test output",
    "runtime stack",
    "private form message",
  ]) {
    assert.equal(payloads.includes(prohibited), false);
  }
});

test("reset cancellation emits one incomplete aggregate result before reset", () => {
  const original = Object.getOwnPropertyDescriptor(globalThis, "window");
  const captured = [];
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      location: { pathname: "/lab/javascript/discount-calculation-bug" },
      dataLayer: captured,
    },
  });
  const context = {
    challengeSlug: "discount-calculation-bug",
    track: "javascript",
    difficulty: "Beginner",
  };
  const session = new labAnalyticsSession.LabAnalyticsSession(context);

  try {
    const runToken = session.run(3);
    session.cancelRun(runToken);
    session.reset();
  } finally {
    if (original) Object.defineProperty(globalThis, "window", original);
    else delete globalThis.window;
  }

  assert.deepEqual(captured.map(({ event }) => event), [
    "lab_run",
    "lab_test_result",
    "lab_reset",
  ]);
  assert.deepEqual(captured[1], {
    event: "lab_test_result",
    challenge_slug: "discount-calculation-bug",
    track: "javascript",
    difficulty: "Beginner",
    page_path: "/lab/javascript/discount-calculation-bug",
    attempt_number: 3,
    completed: false,
  });
});

test("unmount cancellation emits one incomplete result and no completion event", () => {
  const original = Object.getOwnPropertyDescriptor(globalThis, "window");
  const captured = [];
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      location: { pathname: "/lab/javascript/discount-calculation-bug" },
      dataLayer: captured,
    },
  });
  const session = new labAnalyticsSession.LabAnalyticsSession({
    challengeSlug: "discount-calculation-bug",
    track: "javascript",
    difficulty: "Beginner",
  });

  try {
    const runToken = session.run(1);
    session.cancelRun(runToken);
    session.cancelRun(runToken);
    session.testResult(runToken, true);
  } finally {
    if (original) Object.defineProperty(globalThis, "window", original);
    else delete globalThis.window;
  }

  assert.deepEqual(captured.map(({ event }) => event), [
    "lab_run",
    "lab_test_result",
  ]);
  assert.equal(captured[1].completed, false);
  assert.equal(
    captured.filter(({ event }) => event === "lab_test_result").length,
    1,
  );
  assert.equal(captured.some(({ event }) => event === "lab_complete"), false);
  assert.equal(
    captured.some(({ event }) => event === "dca_lab_completed"),
    false,
  );
});

test("late worker completion after cancellation cannot duplicate its result", () => {
  const original = Object.getOwnPropertyDescriptor(globalThis, "window");
  const captured = [];
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      location: { pathname: "/lab/javascript/discount-calculation-bug" },
      dataLayer: captured,
    },
  });
  const session = new labAnalyticsSession.LabAnalyticsSession({
    challengeSlug: "discount-calculation-bug",
    track: "javascript",
    difficulty: "Beginner",
  });
  const timers = makeTimerHarness();
  const worker = makeWorker();
  const runToken = session.run(1);
  const controller = execution.createMissionRunController({
    createWorker: () => worker,
    timeoutMs: 1500,
    onFinish: (response) => {
      const completed =
        response?.type === "results" &&
        response.results.length > 0 &&
        response.results.every((result) => result.status === "passed");
      session.testResult(runToken, completed);
    },
    setTimeout: timers.setTimeout,
    clearTimeout: timers.clearTimeout,
  });

  try {
    controller.start("learner source is never sent to analytics");
    const lateWorkerReply = worker.onmessage;
    session.cancelRun(runToken);
    controller.cancel();
    lateWorkerReply({ data: successfulResponse() });
    session.testResult(runToken, true);
  } finally {
    if (original) Object.defineProperty(globalThis, "window", original);
    else delete globalThis.window;
  }

  assert.deepEqual(captured.map(({ event }) => event), [
    "lab_run",
    "lab_test_result",
  ]);
  assert.equal(captured[1].completed, false);
  assert.equal(
    captured.filter(({ event }) => event === "lab_test_result").length,
    1,
  );
  assert.equal(JSON.stringify(captured).includes("learner source"), false);
  assert.equal(captured.some(({ event }) => event === "lab_complete"), false);
});

test("Skill Map analytics fire only after it becomes visible", () => {
  const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  const originalObserver = Object.getOwnPropertyDescriptor(
    globalThis,
    "IntersectionObserver",
  );
  const captured = [];
  let observerCallback;
  let disconnected = 0;
  class TestIntersectionObserver {
    constructor(callback) {
      observerCallback = callback;
    }
    observe() {}
    disconnect() {
      disconnected += 1;
    }
  }
  Object.defineProperty(globalThis, "IntersectionObserver", {
    configurable: true,
    value: TestIntersectionObserver,
  });
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      location: { pathname: "/lab/javascript/discount-calculation-bug" },
      dataLayer: captured,
    },
  });

  try {
    const session = new labAnalyticsSession.LabAnalyticsSession({
      challengeSlug: "discount-calculation-bug",
      track: "javascript",
      difficulty: "Beginner",
    });
    labAnalyticsSession.observeLabSkillMap({}, () => session.skillMapViewed());
    observerCallback([{ isIntersecting: false }]);
    observerCallback([{ isIntersecting: true, intersectionRatio: 0.1 }]);
    assert.deepEqual(captured, []);
    observerCallback([{ isIntersecting: true, intersectionRatio: 0.25 }]);
    observerCallback([{ isIntersecting: true, intersectionRatio: 1 }]);
    assert.deepEqual(captured, [
      {
        event: "lab_skill_map_view",
        challenge_slug: "discount-calculation-bug",
        track: "javascript",
        difficulty: "Beginner",
        page_path: "/lab/javascript/discount-calculation-bug",
      },
    ]);
    assert.equal(disconnected, 1);
  } finally {
    if (originalWindow) Object.defineProperty(globalThis, "window", originalWindow);
    else delete globalThis.window;
    if (originalObserver) {
      Object.defineProperty(
        globalThis,
        "IntersectionObserver",
        originalObserver,
      );
    } else {
      delete globalThis.IntersectionObserver;
    }
  }
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
  const skillMap = readFileSync(
    path.resolve(root, "src/components/lab/SkillMap.tsx"),
    "utf8",
  );
  const trackedLink = readFileSync(
    path.resolve(root, "src/components/lab/LabTrackedLink.tsx"),
    "utf8",
  );
  const session = readFileSync(
    path.resolve(root, "src/lib/lab/analytics-session.ts"),
    "utf8",
  );
  const labIndex = readFileSync(path.resolve(root, "src/app/lab/page.tsx"), "utf8");
  const challengeCard = readFileSync(
    path.resolve(root, "src/components/lab/ChallengeCard.tsx"),
    "utf8",
  );
  const missionBrief = readFileSync(
    path.resolve(root, "src/components/lab/MissionBrief.tsx"),
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
  assert.match(workspace, /analyticsSession\.firstEdit\(\)/);
  assert.match(workspace, /analyticsSession\.run\(attemptNumber\)/);
  assert.match(workspace, /analyticsSession\.testResult\(runToken, runCompleted\)/);
  assert.match(workspace, /analyticsSession\.hintOpen\(index \+ 1\)/);
  assert.match(workspace, /analyticsSession\.reset\(\)/);
  assert.equal(
    (workspace.match(/analyticsSession\.cancelRun\(runToken\)/g) ?? []).length,
    3,
  );
  assert.match(workspace, /analyticsSession\.complete\(activeAttemptNumberRef\.current\)/);
  assert.match(workspace, /analyticsSession\.skillMapViewed\(\)/);
  assert.match(route, /<ChallengeWorkspace[\s\S]*?<MissionBrief/);
  assert.match(session, /trackLabCompletion\(this\.context\.challengeSlug\)/);
  assert.match(skillMap, /observeLabSkillMap\(section, onViewed\)/);
  assert.match(trackedLink, /onClick=\{\(\) => recordLabLinkClick\(action\)\}/);
  assert.match(labIndex, /<LabPageImpression context=\{featuredAnalyticsContext\}/);
  assert.match(trackedLink, /createLabIndexImpressionTracker/);
  assert.match(route, /<LabChallengeImpression context=\{analyticsContext\}/);
  assert.match(trackedLink, /session\.pageImpression\(\)/);
  assert.match(labIndex, /event="start"/);
  assert.match(challengeCard, /event="start"/);
  assert.match(missionBrief, /event="course"/);
  assert.match(completion, /event="course"/);
  assert.match(completion, /event="contact"/);
  assert.match(workspace, /<MissionPreview/);
  assert.match(panels, /aria-live="polite"/);
  assert.match(panels, /role="alert"/);
  assert.match(completion, /role="status" aria-live="polite"/);
  assert.doesNotMatch(panels, /section aria-labelledby="results-heading" aria-live/);
});

test("editing code cancels active runs and clears feedback for the previous code", () => {
  const workspace = readFileSync(
    path.resolve(root, "src/components/lab/ChallengeWorkspace.tsx"),
    "utf8",
  );
  const panels = readFileSync(
    path.resolve(root, "src/components/lab/ChallengeWorkspacePanels.tsx"),
    "utf8",
  );
  const handleCodeChange = workspace
    .split("const handleCodeChange = ")[1]
    ?.split("\n  const resetMission = ")[0];

  assert.ok(handleCodeChange);
  assert.match(handleCodeChange, /runControllerRef\.current\?\.isRunning\(\)/);
  assert.match(handleCodeChange, /analyticsSession\.cancelRun\(runToken\)/);
  assert.match(handleCodeChange, /runControllerRef\.current\.cancel\(\)/);
  assert.match(handleCodeChange, /setResults\(null\)/);
  assert.match(handleCodeChange, /setHasRun\(false\)/);
  assert.match(handleCodeChange, /setRunCancelled\(true\)/);
  assert.match(panels, /runCancelled/);
  assert.match(panels, /changed[\s\S]*Run Tests[\s\S]*latest code/i);
});
