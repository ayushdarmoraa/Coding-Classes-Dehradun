# Coding Classes Dehradun

This repository contains the source code for **Doon Coding Academy's** educational website. The site is built with **Next.js 14** using the **App Router** and is designed to be SEO-friendly and easy to extend.

## Getting Started

1. **Install dependencies** (if running locally):

   ```bash
   npm install
   ```

2. **Run the development server:**

   ```bash
   npm run dev
   ```

   Then open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

3. **Build for production:**

   ```bash
   npm run build
   npm start
   ```

## Project Structure

This project uses the Next.js **App Router**. Pages live under the `src/app` directory. For example:

* `src/app/page.tsx` – Home page
* `src/app/about/page.tsx` – About us page
* `src/app/courses/page.tsx` – Courses overview
* `src/app/courses/[slug]/page.tsx` – Dynamic course details
* `src/app/contact/page.tsx` – Contact form (stub)

Additional utilities and data live under `src/lib`.

## Deployment

This site is designed to be deployed on **Vercel**. Commit changes to the `main` branch, and Vercel will handle the build and deployment process automatically.

## SEO QA (pre-merge) checks

We run a lightweight SEO QA script on PRs to detect basic issues early:

* Ensures one `<h1>` in the page `<main>` content.
* Heuristic check for a canonical (`<link rel="canonical">` or `metadataBase` / exported metadata).
* Heuristic checks for JSON-LD presence for Course / FAQ / BreadcrumbList where expected.

Run locally:

```bash
# Node 18+ recommended
node scripts/seo-qa-check.js
```

CI:

The script is executed by `.github/workflows/seo-qa.yml` on PRs and feature branch pushes.

Notes:

The checks are intentionally heuristic. If you have special cases (dynamic metadata injection, server-only metadata), you can skip the check for a file by adding a top-line comment:
`// seo-qa-skip` at the top of the page file (this script can be extended to ignore files containing that comment).

If you want additional rules (BreadcrumbList required on location pages, max unique internal link targets, etc.) extend `scripts/seo-qa-check.js` accordingly.

## Lighthouse CI (CWV) checks

Local run:
1. Build and start the app locally (workflow assumes `npm run build` then `npm run start` on port 3000).
2. Run Lighthouse locally (optional):
   ```bash
   npx -y @lhci/cli@0.10 autorun --config=./.lighthouserc.json
## License

This project is provided for educational purposes. Feel free to modify and reuse as needed.
