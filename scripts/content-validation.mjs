import matter from "gray-matter";

const excludedSlugs = new Set(["sample-1", "sample-2"]);

export function isValidDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function validateBlogPost(filename, source) {
  const lines = source.replace(/^\uFEFF/, "").split(/\r?\n/);
  const slug = filename.replace(/\.mdx?$/i, "");
  const errors = [];

  if (lines[0] !== "---") {
    errors.push("missing opening YAML frontmatter delimiter");
  } else if (!lines.slice(1).some((line) => line === "---")) {
    errors.push("missing closing YAML frontmatter delimiter");
  }

  let data;
  try {
    data = matter(source).data;
  } catch (error) {
    errors.push(`invalid YAML frontmatter (${error instanceof Error ? error.message : String(error)})`);
    return { slug, isPublic: !excludedSlugs.has(slug), errors };
  }

  const isPublic = data.draft !== true && !excludedSlugs.has(slug);
  if (!isPublic) return { slug, isPublic, errors };

  if (typeof data.title !== "string" || !data.title.trim()) {
    errors.push("missing title");
  }
  if (typeof data.description !== "string" || !data.description.trim()) {
    errors.push("missing description");
  }
  if (typeof data.date !== "string" || !isValidDate(data.date.trim())) {
    errors.push("missing or invalid date; expected a real YYYY-MM-DD publication date");
  }
  if (data.category != null && data.category !== "" && typeof data.category !== "string") {
    errors.push("category must be a string when provided");
  }

  return { slug, isPublic, errors };
}
