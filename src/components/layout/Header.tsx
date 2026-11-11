import Link from "next/link";
import { getNavLinks, COURSE_LINKS } from "@/lib/nav";

type HeaderProps = {
  currentPath?: string;
  compact?: boolean;
  projectsAvailable: boolean;
};

export default function Header({
  currentPath = "/",
  compact = false,
  projectsAvailable,
}: HeaderProps) {
  const isActive = (href: string) =>
    href === "/" ? currentPath === "/" : currentPath.startsWith(href);
  const isCurrent = (href: string) => currentPath === href;
  const isCourseSectionActive = isActive("/courses") || isActive("/online-courses");
  const navLinks = getNavLinks(projectsAvailable);

  const courseLinks = (
    <>
      <li>
        <Link
          href="/courses"
          aria-current={isCurrent("/courses") ? "page" : undefined}
          className={`block rounded-xl px-4 py-2 font-semibold text-brand-dark transition-colors hover:bg-brand-soft focus-visible:bg-brand-soft ${
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
          className={`block rounded-xl px-4 py-2 text-ink-2 transition-colors hover:bg-brand-soft focus-visible:bg-brand-soft ${
            isActive("/online-courses") ? "font-semibold underline underline-offset-4" : ""
          }`}
        >
          Online (India)
        </Link>
      </li>
      <li className="mx-4 my-1 border-t border-brand-soft" aria-hidden="true" />
      {COURSE_LINKS.map((course) => (
        <li key={course.href}>
          <Link
            href={course.href}
            aria-current={isCurrent(course.href) ? "page" : undefined}
            className={`block rounded-xl px-4 py-2 text-ink-2 transition-colors hover:bg-brand-soft focus-visible:bg-brand-soft ${
              isActive(course.href) ? "font-semibold underline underline-offset-4" : ""
            } ${course.accent ? "font-semibold text-brand-dark" : ""}`}
          >
            {course.label}
          </Link>
        </li>
      ))}
    </>
  );

  return (
    <header
      className={`site-header sticky top-0 z-50 border-b border-brand-soft/80 bg-white/95 text-ink backdrop-blur ${
        compact ? "h-14 shadow-[0_8px_24px_rgba(30,70,160,.12)]" : "h-16 shadow-[0_8px_24px_rgba(30,70,160,.06)]"
      }`}
    >
      <div className="container relative h-full">
        <div className="flex h-full items-center justify-between">
          <Link
            href="/"
            className="group inline-flex min-w-0 items-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-[#2F7BF0] focus-visible:ring-offset-2 rounded-lg"
            aria-label="Doon Coding Academy Home"
            title="Doon Coding Academy"
          >
            <span className="text-xl font-extrabold tracking-tight text-brand-dark sm:text-2xl">&lt;/&gt;</span>
            <span className="hidden whitespace-nowrap text-base font-semibold leading-tight tracking-tight text-ink sm:inline sm:text-lg">
              Doon Coding Academy
            </span>
          </Link>

          <nav aria-label="Main navigation">
            <ul className="hidden items-center gap-4 whitespace-nowrap text-sm xl:flex 2xl:gap-6 2xl:text-base">
              {navLinks.map((item) =>
                item.href === "/courses" ? (
                  <li key={item.href}>
                    <details className="group relative">
                      <summary
                        aria-controls="desktop-course-menu"
                        className={`relative cursor-pointer list-none rounded-lg px-2 py-2 transition-colors hover:text-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand [&::-webkit-details-marker]:hidden after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:origin-left after:scale-x-0 after:rounded-full after:bg-gradient-to-r after:from-[#4b3fd8] after:to-[#2fa8f0] after:transition-transform after:content-[''] group-open:after:scale-x-100 ${
                          isCourseSectionActive ? "font-semibold text-brand-dark after:scale-x-100" : ""
                        }`}
                      >
                        {item.label}
                      </summary>
                      <ul
                        id="desktop-course-menu"
                        className="animate-menu-in absolute left-0 top-full z-20 mt-2 w-72 rounded-dca-sm border border-brand-soft bg-white p-2 text-sm text-ink shadow-soft-blue"
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
                      className={`relative rounded-lg px-2 py-2 transition-colors hover:text-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:origin-left after:scale-x-0 after:rounded-full after:bg-gradient-to-r after:from-[#4b3fd8] after:to-[#2fa8f0] after:transition-transform after:content-[''] hover:after:scale-x-100 ${
                        isActive(item.href) ? "font-semibold text-brand-dark after:scale-x-100" : ""
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
              className="whitespace-nowrap rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            >
              Try Free Challenge
            </Link>
            <Link
              href="/contact"
              className="whitespace-nowrap rounded-full border border-brand px-4 py-2 text-sm font-semibold text-brand-dark transition-colors hover:bg-brand-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            >
              Talk to Mentor
            </Link>
          </div>

          <details className="relative ml-auto xl:hidden">
            <summary
              aria-controls="mobile-menu"
              className="flex cursor-pointer list-none items-center gap-2 rounded-full border border-brand-soft px-4 py-2 text-sm font-medium text-ink-2 transition-colors hover:bg-brand-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand [&::-webkit-details-marker]:hidden"
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
              className="animate-menu-in absolute right-0 top-full z-20 mt-2 max-h-[85vh] w-[min(22rem,calc(100vw-2rem))] overflow-y-auto overscroll-contain rounded-dca-md border border-brand-soft bg-white p-2 text-ink shadow-soft-blue"
            >
              <ul className="flex flex-col">
                {navLinks.map((item) =>
                  item.href === "/courses" ? (
                    <li key={item.href}>
                      <details>
                        <summary
                          aria-controls="mobile-course-menu"
                          className={`cursor-pointer list-none rounded-xl px-4 py-3 transition-colors hover:bg-brand-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand [&::-webkit-details-marker]:hidden ${
                            isCourseSectionActive ? "font-semibold text-brand-dark" : ""
                          }`}
                        >
                          Courses
                        </summary>
                        <ul id="mobile-course-menu" className="animate-menu-in pb-2 pl-3">
                          {courseLinks}
                        </ul>
                      </details>
                    </li>
                  ) : (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={isCurrent(item.href) ? "page" : undefined}
                        className={`my-0.5 block rounded-xl px-4 py-3 transition-colors hover:bg-brand-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                          isActive(item.href) ? "bg-brand-soft font-semibold text-brand-dark" : ""
                        }`}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ),
                )}
                <li className="mt-2 border-t border-brand-soft pt-2">
                  <Link
                    href="/lab/javascript/discount-calculation-bug"
                    className="my-0.5 block rounded-full bg-brand px-4 py-3 text-center font-semibold text-white transition-colors hover:bg-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                  >
                    Try Free Challenge
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="my-0.5 block rounded-full border border-brand px-4 py-3 text-center font-semibold text-brand-dark transition-colors hover:bg-brand-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
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
