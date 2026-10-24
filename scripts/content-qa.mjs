import fs from "node:fs";
import path from "node:path";
import { validateBlogPost } from "./content-validation.mjs";

const contentDirectory = path.join(process.cwd(), "src", "content", "blog");

function main() {
  if (!fs.existsSync(contentDirectory)) {
    console.error(`Blog content directory not found: ${contentDirectory}`);
    process.exitCode = 1;
    return;
  }

  const files = fs.readdirSync(contentDirectory)
    .filter((filename) => /\.mdx?$/i.test(filename))
    .sort();
  const results = files.map((filename) => {
    try {
      return validateBlogPost(filename, fs.readFileSync(path.join(contentDirectory, filename), "utf8"));
    } catch (error) {
      return {
        slug: filename,
        isPublic: true,
        errors: [`could not read file (${error instanceof Error ? error.message : String(error)})`],
      };
    }
  });
  const failures = results.filter((result) => result.errors.length);

  for (const result of failures) {
    for (const error of result.errors) {
      console.error(`${result.slug}: ${error}`);
    }
  }

  if (failures.length) {
    console.error(`Content QA failed: ${failures.length} file(s) need attention.`);
    process.exitCode = 1;
    return;
  }

  const publicCount = results.filter((result) => result.isPublic).length;
  console.log(`Content QA passed: ${publicCount} public blog file(s) have valid frontmatter.`);
}

main();
