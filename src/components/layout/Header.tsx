import Link from "next/link";
import { NAV_LINKS, COURSE_LINKS } from "@/lib/nav";

type HeaderProps = {
  currentPath?: string;
};

export default function Header({ currentPath = "/" }: HeaderProps) {
  const isActive = (href: string) =>
    href === "/" ? currentPath === "/" : currentPath.startsWith(href);
  const isCurrent = (href: string) => currentPath === href;
  const isCourseSectionActive = isActive("/courses") || isActive("/online-courses");

  const courseLinks = (
    <>
      <li>
        <Link
          href="/courses"
          aria-current={isCurrent("/courses") ? "page" : undefined}
          className={`block rounded-md px-4 py-2 font-semibold text-yellow-300 transition-colors hover:bg-blue-600/60 focus-visible:bg-blue-600/60 ${
            isActive("/courses") ? "underline underline-offset-4" : ""
          }`}
        >
          On-Campus (Dehradun)
        </Link>
      </li>
      <li>
        <Link
          href="/online-courses"
          aria-current={isCurrent("/online-courses") ? "page" : undefined}
          className={`block rounded-md px-4 py-2 transition-colors hover:bg-blue-600/60 focus-visible:bg-blue-600/60 ${
            isActive("/online-courses") ? "font-semibold underline underline-offset-4" : ""
          }`}
        >
          Online (India)
        </Link>
      </li>
      <li className="mx-4 my-1 border-t border-white/15" aria-hidden="true" />
      {COURSE_LINKS.map((course) => (
        <li key={course.href}>
          <Link
            href={course.href}
            aria-current={isCurrent(course.href) ? "page" : undefined}
            className={`block rounded-md px-4 py-2 transition-colors hover:bg-blue-600/60 focus-visible:bg-blue-600/60 ${
              isActive(course.href) ? "font-semibold underline underline-offset-4" : ""
            } ${course.accent ? "font-semibold text-yellow-300" : ""}`}
          >
            {course.label}
          </Link>
        </li>
      ))}
    </>
  );

  return (
    <header className="sticky top-0 z-50 bg-navy-grad text-white shadow-md">
      <div className="container relative">
        <div className="flex h-14 items-center justify-between sm:h-16">
          <Link
            href="/"
            className="group inline-flex min-w-0 items-center gap-2"
            aria-label="Doon Coding Academy Home"
            title="Doon Coding Academy"
          >
            <span className="text-xl font-extrabold tracking-tight sm:text-2xl">&lt;/&gt;</span>
            <span className="hidden whitespace-nowrap text-base font-semibold leading-tight tracking-tight sm:inline sm:text-lg">
              Doon Coding Academy
            </span>
          </Link>

          <nav aria-label="Main navigation">
            <ul className="hidden items-center gap-4 whitespace-nowrap text-sm xl:flex 2xl:gap-6 2xl:text-base">
              {NAV_LINKS.map((item) =>
                item.href === "/courses" ? (
                  <li key={item.href}>
                    <details className="group relative">
                      <summary
                        aria-controls="desktop-course-menu"
                        className={`cursor-pointer list-none rounded-md px-2 py-2 transition-colors hover:text-yellow-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 [&::-webkit-details-marker]:hidden ${
                          isCourseSectionActive ? "font-semibold underline underline-offset-4" : ""
                        }`}
                      >
                        {item.label}
                      </summary>
                      <ul
                        id="desktop-course-menu"
                        className="absolute left-0 top-full z-20 mt-2 w-64 rounded-2xl border border-white/10 bg-[#10264b]/95 p-2 text-sm shadow-soft-blue backdrop-blur"
                      >
                        {courseLinks}
                      </ul>
                    </details>
                  </li>
                ) : (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={isCurrent(item.href) ? "page" : undefined}
                      className={`rounded-md py-2 transition-colors hover:text-yellow-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 ${
                        isActive(item.href) ? "font-semibold underline underline-offset-4" : ""
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                ),
              )}
            </ul>
          </nav>

          <div className="hidden items-center gap-2 xl:flex">
            <Link
              href="/lab/javascript/discount-calculation-bug"
              className="whitespace-nowrap rounded-full bg-yellow-300 px-4 py-2 text-sm font-semibold text-blue-950 hover:bg-yellow-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-blue-700 2xl:px-5"
            >
              Try Free Challenge
            </Link>
            <Link
              href="/contact"
              className="whitespace-nowrap rounded-full border border-white/70 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-blue-700 2xl:px-5"
            >
              Talk to Mentor
            </Link>
          </div>

          <details className="relative ml-auto lg:ml-4 xl:hidden">
            <summary
              aria-controls="mobile-menu"
              className="flex cursor-pointer list-none items-center gap-2 rounded-lg p-2 text-sm hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 [&::-webkit-details-marker]:hidden"
            >
              <span>Menu</span>
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M3 6h18M3 12h18M3 18h18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </summary>
            <nav
              id="mobile-menu"
              aria-label="Mobile navigation"
              className="absolute right-0 top-full z-20 mt-2 max-h-[85vh] w-[min(22rem,calc(100vw-2rem))] overflow-y-auto overscroll-contain rounded-2xl border border-white/10 bg-[#10264b]/95 p-2 shadow-soft-blue backdrop-blur"
            >
              <ul className="flex flex-col">
                {NAV_LINKS.map((item) =>
                  item.href === "/courses" ? (
                    <li key={item.href}>
                      <details>
                        <summary
                          aria-controls="mobile-course-menu"
                          className={`cursor-pointer list-none rounded-xl px-4 py-3 transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 [&::-webkit-details-marker]:hidden ${
                            isCourseSectionActive ? "font-semibold underline underline-offset-4" : ""
                          }`}
                        >
                          Courses
                        </summary>
                        <ul id="mobile-course-menu" className="pb-2 pl-3">
                          {courseLinks}
                        </ul>
                      </details>
                    </li>
                  ) : (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={isCurrent(item.href) ? "page" : undefined}
                        className={`my-0.5 block rounded-xl px-4 py-3 transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 ${
                          isActive(item.href) ? "bg-white/5 font-semibold underline underline-offset-4" : ""
                        }`}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ),
                )}
                <li className="mt-2 border-t border-white/15 pt-2">
                  <Link
                    href="/lab/javascript/discount-calculation-bug"
                    className="my-0.5 block rounded-xl bg-yellow-300 px-4 py-3 font-semibold text-blue-950 hover:bg-yellow-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  >
                    Try Free Challenge
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="my-0.5 block rounded-xl px-4 py-3 font-semibold text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  >
                    Talk to Mentor
                  </Link>
                </li>
              </ul>
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}
