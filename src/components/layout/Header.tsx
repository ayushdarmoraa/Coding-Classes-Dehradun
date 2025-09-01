import Link from "next/link";
import { getAllBlogPosts } from "@/lib/blog";

export default function Header() {
  const hasBlogPosts = getAllBlogPosts().length > 0;

  return (
    <header className="sticky top-0 z-50 bg-blue-600 text-white p-4 shadow-md">
      <nav className="container mx-auto flex justify-between items-center">
        {/* Brand */}
        <Link
          href="/"
          className="flex flex-col items-start text-2xl font-bold"
          aria-label="Doon Coding Academy Home"
          title="Doon Coding Academy"
        >
          <span>&lt;DCA/&gt;</span>
          <span className="text-lg font-semibold tracking-tight">Doon Coding Academy</span>
        </Link>

        {/* Nav links */}
        <ul className="flex items-center space-x-6">
          <li>
            <Link href="/about" className="transition-colors duration-200 hover:text-yellow-300">
              About
            </Link>
          </li>

          {/* Courses dropdown */}
          <li className="relative group">
            <Link
              href="/courses"
              className="transition-colors duration-200 hover:text-yellow-300"
            >
              Courses
            </Link>

            {/* Dropdown panel */}
            <div
              className="invisible absolute left-0 top-full mt-2 w-64 rounded-lg bg-blue-700/95 shadow-lg backdrop-blur
                         opacity-0 transition-all duration-150 group-hover:visible group-hover:opacity-100"
            >
              <ul className="py-2 text-sm">
                <li>
                  <Link
                    href="/courses/full-stack"
                    className="block px-4 py-2 rounded-md transition-colors duration-150 hover:bg-blue-600/60"
                  >
                    Full-Stack with Gen AI
                  </Link>
                </li>
                <li>
                  <Link
                    href="/courses/data-science"
                    className="block px-4 py-2 rounded-md transition-colors duration-150 hover:bg-blue-600/60"
                  >
                    Data Science
                  </Link>
                </li>
                <li>
                  <Link
                    href="/courses/python"
                    className="block px-4 py-2 rounded-md transition-colors duration-150 hover:bg-blue-600/60"
                  >
                    Python
                  </Link>
                </li>
                <li>
                  <Link
                    href="/courses/java"
                    className="block px-4 py-2 rounded-md transition-colors duration-150 hover:bg-blue-600/60"
                  >
                    Java
                  </Link>
                </li>

                {/* Divider */}
                <li>
                  <hr className="my-2 border-blue-500/50" />
                </li>

                {/* All Courses link */}
                <li>
                  <Link
                    href="/courses"
                    className="block px-4 py-2 font-semibold text-yellow-300 rounded-md transition-colors duration-150 hover:bg-blue-600/60"
                  >
                    → All Courses
                  </Link>
                </li>
              </ul>
            </div>
          </li>

          {hasBlogPosts && (
            <li>
              <Link href="/blog" className="transition-colors duration-200 hover:text-yellow-300">
                Blog
              </Link>
            </li>
          )}

          <li>
            <Link href="/faq" className="transition-colors duration-200 hover:text-yellow-300">
              FAQ
            </Link>
          </li>
          <li>
            <Link
              href="/testimonials"
              className="transition-colors duration-200 hover:text-yellow-300"
            >
              Testimonials
            </Link>
          </li>
          <li>
            <Link href="/contact" className="transition-colors duration-200 hover:text-yellow-300">
              Contact
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}


