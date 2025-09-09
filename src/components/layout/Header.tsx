// src/components/layout/Header.tsx
import Link from "next/link";
import { NAV_LINKS, COURSE_LINKS } from "@/lib/nav";

type HeaderProps = {
  currentPath?: string;
};

export default function Header({ currentPath = "/" }: HeaderProps) {
  const isActive = (href: string) =>
    href === "/" ? currentPath === "/" : currentPath.startsWith(href);

  return (
    <header className="sticky top-0 z-50 bg-blue-600 text-white shadow-md">
      <div className="container">
    {/* top row */}
  <div className="flex h-14 sm:h-16 items-center justify-between">
          {/* Brand */}
          <Link
            href="/"
            className="group inline-flex items-center gap-2 min-w-0"
            aria-label="Doon Coding Academy Home"
            title="Doon Coding Academy"
          >
            <span className="text-xl sm:text-2xl font-extrabold tracking-tight">&lt;DCA/&gt;</span>
            {/* hide long text on very small screens to avoid wrapping */}
            <span className="hidden sm:inline text-base sm:text-lg font-semibold tracking-tight whitespace-nowrap leading-tight">
              Doon Coding Academy
            </span>
          </Link>

          {/* Desktop nav */}
          <ul className="hidden md:flex items-center space-x-6">
            {/* static pages (exclude top-level Online Courses; now under Courses dropdown) */}
            {NAV_LINKS.filter(i => i.href !== "/online-courses").map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`transition-colors duration-200 hover:text-yellow-300 ${
                    isActive(item.href) ? "font-semibold underline underline-offset-4" : ""
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}

            {/* Courses dropdown (desktop only) */}
            <li className="relative group">
              <Link
                href="/courses"
                className={`px-2 py-2 transition-colors duration-200 hover:text-yellow-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 touch-manipulation ${
                  isActive("/courses") ? "font-semibold underline underline-offset-4" : ""
                }`}
              >
                Courses
              </Link>

              {/* Dropdown panel */}
              <div
                className="invisible absolute left-0 top-full mt-2 w-64 rounded-lg bg-blue-700/95 shadow-lg backdrop-blur z-10
                           opacity-0 translate-y-1 transition-all duration-150
                           md:group-hover:visible md:group-hover:opacity-100 md:group-hover:translate-y-0
                           md:group-focus-within:visible md:group-focus-within:opacity-100 md:group-focus-within:translate-y-0
                           pointer-events-none md:group-hover:pointer-events-auto md:group-focus-within:pointer-events-auto
                           motion-reduce:transition-none motion-reduce:transform-none"
              >
                <ul className="py-2 text-sm">
                  {/* Quick access: On-Campus vs Online */}
                  <li>
                    <Link
                      href="/courses"
                      className={`block px-4 py-2 rounded-md transition-colors duration-150 hover:bg-blue-600/60 focus:outline-none focus-visible:bg-blue-600/60 ${
                        isActive("/courses") ? "font-semibold underline underline-offset-4" : ""
                      } text-yellow-300 font-semibold`}
                    >
                      On-Campus (Dehradun)
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/online-courses"
                      className={`block px-4 py-2 rounded-md transition-colors duration-150 hover:bg-blue-600/60 focus:outline-none focus-visible:bg-blue-600/60 ${
                        isActive("/online-courses") ? "font-semibold underline underline-offset-4" : ""
                      }`}
                    >
                      Online (India)
                    </Link>
                  </li>

                  {/* Divider */}
                  <li className="my-1 mx-3 border-t border-white/15" aria-hidden />

                  {COURSE_LINKS.map((c) => (
                    <li key={c.href}>
                      <Link
                        href={c.href}
                        className={`block px-4 py-2 rounded-md transition-colors duration-150 hover:bg-blue-600/60 focus:outline-none focus-visible:bg-blue-600/60 ${
                          isActive(c.href) ? "font-semibold underline underline-offset-4" : ""
                        } ${c.accent ? "text-yellow-300 font-semibold" : ""}`}
                      >
                        {c.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </li>

            <li>
              <Link
                href="/blog"
                className={`transition-colors duration-200 hover:text-yellow-300 ${
                  isActive("/blog") ? "font-semibold underline underline-offset-4" : ""
                }`}
              >
                Blog
              </Link>
            </li>

            <li>
              <Link
                href="/faq"
                className={`transition-colors duration-200 hover:text-yellow-300 ${
                  isActive("/faq") ? "font-semibold underline underline-offset-4" : ""
                }`}
              >
                FAQ
              </Link>
            </li>
            <li>
              <Link
                href="/testimonials"
                className={`transition-colors duration-200 hover:text-yellow-300 ${
                  isActive("/testimonials") ? "font-semibold underline underline-offset-4" : ""
                }`}
              >
                Testimonials
              </Link>
            </li>
            <li>
              <Link
                href="/contact"
                className={`transition-colors duration-200 hover:text-yellow-300 ${
                  isActive("/contact") ? "font-semibold underline underline-offset-4" : ""
                }`}
              >
                Contact
              </Link>
            </li>
          </ul>

          {/* Hamburger (mobile only) */}
          <div className="md:hidden flex items-center">
            {/* keep only the label here */}
            <label
              htmlFor="nav-toggle"
              className="inline-flex items-center justify-center rounded-lg p-2 text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/70"
              aria-controls="mobile-menu"
              aria-label="Toggle navigation"
            >
              <svg
                className="h-6 w-6"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </label>
          </div>
        </div>

  {/* 👇 peer lives here so the panel below can “see” it */}
  <input id="nav-toggle" type="checkbox" className="peer sr-only" />

  {/* Mobile menu (collapsible) */}
  <div
    id="mobile-menu"
    className="md:hidden overflow-hidden max-h-0
               peer-checked:!max-h-[85vh] peer-checked:overflow-y-auto overscroll-contain
               transition-[max-height,opacity] duration-300 ease-out
               opacity-0 peer-checked:opacity-100
               bg-blue-700/95 backdrop-blur rounded-b-2xl shadow-lg
               border-t border-white/10 peer-checked:mb-4"
  >
    <nav className="py-2">
    <ul className="flex flex-col">
      <li>
      <Link
        href="/"
        className={`block mx-3 my-1 rounded-xl px-4 py-3 text-white/95
                hover:bg-white/10 active:bg-white/15 transition-colors
                ${isActive("/") ? "ring-1 ring-white/20 bg-white/5 font-semibold underline underline-offset-4" : ""}`}
      >
        Home
      </Link>
      </li>
      <li>
      <Link
        href="/about"
        className={`block mx-3 my-1 rounded-xl px-4 py-3 text-white/95
                hover:bg-white/10 active:bg-white/15 transition-colors
                ${isActive("/about") ? "ring-1 ring-white/20 bg-white/5 font-semibold underline underline-offset-4" : ""}`}
      >
        About
      </Link>
      </li>

      {/* Courses accordion (mobile) */}
      <li className="px-1">
      {/* checkbox controls the accordion; keep the same id */}
      <input id="courses-acc" type="checkbox" className="sr-only peer/courses" />

      {/* Row wrapper so left side is a link to /courses; right side is the chevron toggle */}
      <div className="relative mx-3 my-1 rounded-xl hover:bg-white/10 active:bg-white/15 transition-colors
              peer-checked/courses:[&>label>svg]:rotate-180">
        {/* Left: full row link to /courses */}
        <Link
          href="/courses"
          className="block w-full px-4 py-3 pr-12 text-white/95"
        >
        Courses
        </Link>

        {/* Right: chevron that ONLY toggles the accordion */}
        <label
          htmlFor="courses-acc"
          aria-label="Toggle course links"
          className="absolute right-2 top-1/2 -translate-y-1/2 grid place-items-center
                 h-8 w-8 rounded-md hover:bg-white/10 active:bg-white/15"
        >
        <svg className="h-4 w-4 transition-transform" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M6 8l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        </label>
      </div>

      {/* Accordion panel */}
      <div className="grid grid-rows-[0fr] peer-checked/courses:grid-rows-[1fr] transition-[grid-template-rows] duration-200">
        <div className="overflow-hidden">
        <ul className="pb-2">
          {/* Combined menu entries */}
          <li>
          <Link href="/online-courses" className="block mx-6 my-1 rounded-lg px-4 py-2.5 hover:bg-white/10 active:bg-white/15">
            Online (India)
          </Link>
          </li>
          <li>
          <Link href="/courses/full-stack" className="block mx-6 my-1 rounded-lg px-4 py-2.5 hover:bg-white/10 active:bg-white/15">
            Full-Stack with Gen AI
          </Link>
          </li>
          <li>
          <Link href="/courses/data-science" className="block mx-6 my-1 rounded-lg px-4 py-2.5 hover:bg-white/10 active:bg-white/15">
            Data Science
          </Link>
          </li>
          <li>
          <Link href="/courses/python" className="block mx-6 my-1 rounded-lg px-4 py-2.5 hover:bg-white/10 active:bg-white/15">
            Python
          </Link>
          </li>
          <li>
          <Link href="/courses/java" className="block mx-6 my-1 rounded-lg px-4 py-2.5 hover:bg-white/10 active:bg-white/15">
            Java
          </Link>
          </li>

          {/* ✅ Restored “All Courses” */}
          <li>
          <Link
            href="/courses"
            className="block mx-6 my-1 rounded-lg px-4 py-2.5 font-semibold text-yellow-300 hover:bg-white/10 active:bg-white/15"
          >
            → All Courses
          </Link>
          </li>
        </ul>
        </div>
      </div>
      </li>

      <li>
        <Link
          href="/blog"
          className={`block mx-3 my-1 rounded-xl px-4 py-3 text-white/95 hover:bg-white/10 active:bg-white/15 transition-colors ${
            isActive("/blog") ? "ring-1 ring-white/20 bg-white/5 font-semibold underline underline-offset-4" : ""
          }`}
        >
          Blog
        </Link>
      </li>

      <li>
      <Link
        href="/faq"
        className={`block mx-3 my-1 rounded-xl px-4 py-3 text-white/95
              hover:bg-white/10 active:bg-white/15 transition-colors
              ${isActive("/faq") ? "ring-1 ring-white/20 bg-white/5 font-semibold underline underline-offset-4" : ""}`}
      >
        FAQ
      </Link>
      </li>
      <li>
      <Link
        href="/testimonials"
        className={`block mx-3 my-1 rounded-xl px-4 py-3 text-white/95
              hover:bg-white/10 active:bg-white/15 transition-colors
              ${isActive("/testimonials") ? "ring-1 ring-white/20 bg-white/5 font-semibold underline underline-offset-4" : ""}`}
      >
        Testimonials
      </Link>
      </li>
      <li>
      <Link
        href="/contact"
        className={`block mx-3 my-1 rounded-xl px-4 py-3 text-white/95
              hover:bg-white/10 active:bg-white/15 transition-colors
              ${isActive("/contact") ? "ring-1 ring-white/20 bg-white/5 font-semibold underline underline-offset-4" : ""}`}
      >
        Contact
      </Link>
      </li>
    </ul>
    </nav>
  </div>
        {/* Note: the mobile panel is tied to the checkbox above via `peer` */}
      </div>
    </header>
  );
}


