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

## License

This project is provided for educational purposes. Feel free to modify and reuse as needed.
