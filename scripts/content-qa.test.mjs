import assert from "node:assert/strict";
import test from "node:test";
import { isValidDate, validateBlogPost } from "./content-validation.mjs";

test("publication dates must be real YYYY-MM-DD calendar dates", () => {
  assert.equal(isValidDate("2024-02-29"), true);
  assert.equal(isValidDate("2025-02-29"), false);
  assert.equal(isValidDate("2025-9-03"), false);
  assert.equal(isValidDate("2025-09-03T00:00:00Z"), false);
});

test("published posts require delimited frontmatter and explicit dates", () => {
  const missingDelimiter = validateBlogPost(
    "guide.mdx",
    'title: "Guide"\ndescription: "Useful guide"\ndate: "2025-09-03"\n---\nBody'
  );
  assert.ok(missingDelimiter.errors.includes("missing opening YAML frontmatter delimiter"));

  const missingDate = validateBlogPost(
    "guide.mdx",
    '---\ntitle: "Guide"\ndescription: "Useful guide"\n---\nBody'
  );
  assert.ok(missingDate.errors.some((error) => error.includes("missing or invalid date")));

  const invalidDate = validateBlogPost(
    "guide.mdx",
    '---\ntitle: "Guide"\ndescription: "Useful guide"\ndate: "2025-02-29"\n---\nBody'
  );
  assert.ok(invalidDate.errors.some((error) => error.includes("missing or invalid date")));

  const missingClosingDelimiter = validateBlogPost(
    "guide.mdx",
    '---\ntitle: "Guide"\ndescription: "Useful guide"\ndate: "2025-09-03"\nBody'
  );
  assert.ok(missingClosingDelimiter.errors.includes("missing closing YAML frontmatter delimiter"));
});

test("malformed YAML is reported as a content error", () => {
  const result = validateBlogPost(
    "guide.mdx",
    '---\ntitle: "Guide"\ntitle: "Duplicate"\ndescription: "Useful guide"\ndate: "2025-09-03"\n---\nBody'
  );
  assert.ok(result.errors.some((error) => error.includes("invalid YAML frontmatter")));
});

test("draft/sample content is not treated as public content", () => {
  const draft = validateBlogPost(
    "draft.mdx",
    '---\ndraft: true\n---\nDraft content'
  );
  assert.equal(draft.isPublic, false);
  assert.deepEqual(draft.errors, []);
});
