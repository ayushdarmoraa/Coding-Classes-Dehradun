import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));
const require = createRequire(path.join(repositoryRoot, "package.json"));
const mission = loadTypeScript("src/lib/lab/mission.ts");
const registry = loadTypeScript("src/lib/lab/challenges.ts", {
  "./mission": mission,
  "./types": loadTypeScript("src/lib/lab/types.ts"),
});
const skillMapModule = loadTypeScript("src/lib/lab/skill-map.ts", {
  "./mission": mission,
  "./challenges": registry,
});
const {
  DEFAULT_CHALLENGE,
  getChallenge,
  getChallengeStatus,
  getChallengesByTrack,
  getPublishedChallenges,
  validateChallenges,
} = registry;
const { getChallengePath, isValidChallengeRouteSegment } = loadTypeScript(
  "src/lib/lab/challenge-utils.ts",
);

function loadTypeScript(relativePath, localModules = {}) {
  const source = readFileSync(path.resolve(repositoryRoot, relativePath), "utf8");
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      esModuleInterop: true,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  }).outputText;
  const module = { exports: {} };
  const localRequire = (specifier) => {
    if (Object.hasOwn(localModules, specifier)) return localModules[specifier];
    if (specifier.startsWith("./")) {
      const dependencyPath = path.resolve(
        repositoryRoot,
        path.dirname(relativePath),
        `${specifier}.ts`,
      );
      return loadTypeScript(path.relative(repositoryRoot, dependencyPath));
    }
    return require(specifier);
  };
  new Function("require", "module", "exports", compiled)(
    localRequire,
    module,
    module.exports,
  );
  return module.exports;
}

function cloneChallenge(challenge) {
  return structuredClone(challenge);
}

test("registry validates and returns the published first mission by stable route", () => {
  const challenge = getChallenge("javascript", "discount-calculation-bug");
  assert.equal(challenge.id, mission.MISSION_ID);
  assert.equal(challenge.status, "published");
  assert.equal(challenge.runner, "discount-calculation-v1");
  assert.equal(challenge.entryFunction, "calculateTotal");
  assert.deepEqual(getPublishedChallenges().map(({ id }) => id), [
    "discount-calculation-bug",
  ]);
  assert.deepEqual(getChallengesByTrack("javascript"), [DEFAULT_CHALLENGE]);
  assert.equal(
    getChallengePath(challenge),
    "/lab/javascript/discount-calculation-bug",
  );
  assert.deepEqual(
    challenge.tests.map(({ price, discountPercent, expected }) => [
      price,
      discountPercent,
      expected,
    ]),
    [[800, 10, 720], [1000, 20, 800], [500, 0, 500], [200, 100, 0]],
  );
});

test("draft and unknown missions are excluded from public lookup safely", () => {
  const draft = cloneChallenge(DEFAULT_CHALLENGE);
  draft.id = "future-draft";
  draft.slug = "future-draft";
  draft.status = "draft";
  const validatedDraft = validateChallenges([draft]);

  assert.equal(getPublishedChallenges(validatedDraft).length, 0);
  assert.equal(
    getChallengeStatus("javascript", "future-draft", validatedDraft),
    "draft",
  );
  assert.equal(
    getChallenge("javascript", "future-draft", validatedDraft),
    undefined,
  );
  assert.equal(getChallengeStatus("javascript", "discount-calculation-bug"), "published");
  assert.equal(getChallenge("javascript", "future-draft"), undefined);
  assert.equal(getChallengeStatus("javascript", "future-draft"), "not-found");
  assert.equal(getChallengeStatus("../javascript", "discount-calculation-bug"), "not-found");
  assert.deepEqual(getChallengesByTrack("../javascript"), []);
});

test("route utilities validate segments and build safe canonical challenge paths", () => {
  assert.equal(isValidChallengeRouteSegment("javascript"), true);
  assert.equal(isValidChallengeRouteSegment("../javascript"), false);
  assert.equal(isValidChallengeRouteSegment(""), false);
  assert.throws(() =>
    getChallengePath({ track: "../javascript", slug: "discount-calculation-bug" }),
  );
});

test("registry rejects malformed content, unsupported runners and invalid estimates", () => {
  assert.throws(() => getPublishedChallenges([{}]));
  assert.throws(() => getChallengeStatus("javascript", "broken", [{}]));

  const missingObjective = cloneChallenge(DEFAULT_CHALLENGE);
  missingObjective.mission.objective = "";
  assert.throws(() => validateChallenges([missingObjective]));

  const unsafeRunner = cloneChallenge(DEFAULT_CHALLENGE);
  unsafeRunner.runner = "arbitrary-javascript";
  assert.throws(() => validateChallenges([unsafeRunner]));

  const invalidEstimate = cloneChallenge(DEFAULT_CHALLENGE);
  invalidEstimate.estimatedMinutes = { minimum: 11, maximum: 5 };
  assert.throws(() => validateChallenges([invalidEstimate]));

  const invalidEntryPoint = cloneChallenge(DEFAULT_CHALLENGE);
  invalidEntryPoint.entryFunction = "calculateTotal();";
  assert.throws(() => validateChallenges([invalidEntryPoint]));
});

test("registry rejects duplicate identifiers, routes, test IDs and missing skill evidence", () => {
  const duplicateId = cloneChallenge(DEFAULT_CHALLENGE);
  duplicateId.slug = "another-route";
  assert.throws(() =>
    validateChallenges([cloneChallenge(DEFAULT_CHALLENGE), duplicateId]),
  );

  const duplicateRoute = cloneChallenge(DEFAULT_CHALLENGE);
  duplicateRoute.id = "other-id";
  assert.throws(() =>
    validateChallenges([cloneChallenge(DEFAULT_CHALLENGE), duplicateRoute]),
  );

  const duplicateTests = cloneChallenge(DEFAULT_CHALLENGE);
  duplicateTests.tests[1].id = duplicateTests.tests[0].id;
  assert.throws(() => validateChallenges([duplicateTests]));

  const missingSkillTest = cloneChallenge(DEFAULT_CHALLENGE);
  missingSkillTest.skills[0].evidence.testIds = ["missing-test"];
  assert.throws(() => validateChallenges([missingSkillTest]));

  const missingExampleTest = cloneChallenge(DEFAULT_CHALLENGE);
  missingExampleTest.mission.example.testId = "missing-test";
  assert.throws(() => validateChallenges([missingExampleTest]));
});

test("skill evidence evaluation can use mission-specific definitions or safely handle missing data", () => {
  const challenge = cloneChallenge(DEFAULT_CHALLENGE);
  challenge.tests = [challenge.tests[0]];
  challenge.skills = [
    {
      id: "custom-skill",
      label: "Custom skill",
      evidence: { type: "tests", testIds: [challenge.tests[0].id] },
    },
  ];
  const passingResult = {
    ...challenge.tests[0],
    actual: challenge.tests[0].expected,
    status: "passed",
  };

  assert.deepEqual(
    skillMapModule.createSkillMap([passingResult], 0, false, challenge),
    [{ id: "custom-skill", label: "Custom skill", status: "Demonstrated" }],
  );
  assert.deepEqual(
    skillMapModule.createSkillMap(null, 0, false, { ...challenge, skills: [] }),
    [],
  );
});

test("public Lab routes are server-rendered, canonical, and exclude unpublished entries from the sitemap", () => {
  const indexPage = readFileSync(
    path.join(repositoryRoot, "src/app/lab/page.tsx"),
    "utf8",
  );
  const challengePage = readFileSync(
    path.join(repositoryRoot, "src/app/lab/[track]/[slug]/page.tsx"),
    "utf8",
  );
  const sitemap = readFileSync(
    path.join(repositoryRoot, "src/app/sitemap.ts"),
    "utf8",
  );

  assert.match(indexPage, /getPublishedChallenges\(\)/);
  assert.match(indexPage, /Start First Challenge/);
  assert.match(indexPage, /How the Lab works/);
  assert.match(indexPage, /canonical: `\$\{SITE\.url\}\/lab`/);
  assert.match(challengePage, /generateStaticParams/);
  assert.match(challengePage, /notFound\(\)/);
  assert.match(challengePage, /aria-label="Breadcrumb"/);
  assert.match(challengePage, /aria-current="page"/);
  assert.match(challengePage, /challenge\.seo\.title/);
  assert.match(challengePage, /robots: \{ index: false, follow: false \}/);
  assert.match(sitemap, /getPublishedChallenges\(\)/);
  assert.match(sitemap, /getChallengePath\(challenge\)/);
  assert.equal(
    getPublishedChallenges().some(({ status }) => status !== "published"),
    false,
  );
});

test("sitemap includes Lab index and published missions but excludes drafts", async () => {
  const draft = cloneChallenge(DEFAULT_CHALLENGE);
  draft.id = "future-draft";
  draft.slug = "future-draft";
  draft.status = "draft";
  const registryWithDraft = validateChallenges([
    cloneChallenge(DEFAULT_CHALLENGE),
    draft,
  ]);
  const sitemapModule = loadTypeScript("src/app/sitemap.ts", {
    "@/lib/courses": {
      getCourses: async () => [],
      isCourseModeAvailable: () => false,
    },
    "@/lib/blog": {
      getAllBlogPosts: async () => [],
      getPostLastModified: async () => undefined,
    },
    "@/lib/lab/challenges": {
      getPublishedChallenges: () => getPublishedChallenges(registryWithDraft),
    },
    "@/lib/lab/challenge-utils": { getChallengePath },
    "@/lib/projects": {
      getPublishedProjects: () => [],
      getProjectPath: ({ slug }) => `/projects/${slug}`,
    },
    "@/lib/site-config": { SITE: { url: "https://dooncodingacademy.in" } },
  });

  const entries = await sitemapModule.default();
  const urls = entries.map(({ url }) => url);

  assert.ok(urls.includes("https://dooncodingacademy.in/lab"));
  assert.ok(
    urls.includes(
      "https://dooncodingacademy.in/lab/javascript/discount-calculation-bug",
    ),
  );
  assert.equal(
    urls.includes("https://dooncodingacademy.in/lab/javascript/future-draft"),
    false,
  );
  assert.equal(urls.includes("https://dooncodingacademy.in/projects"), false);
  assert.ok(urls.includes("https://dooncodingacademy.in/courses"));
  assert.ok(urls.includes("https://dooncodingacademy.in/blog"));
});
