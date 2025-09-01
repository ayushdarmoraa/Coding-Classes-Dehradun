import Link from "next/link";
import { getAllBlogPosts } from "@/lib/blog";

export default function Header() {
  const hasBlogPosts = getAllBlogPosts().length > 0;

  return (
    <header className="bg-blue-600 text-white p-4 shadow-md">
      <nav className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          &lt;DCA/&gt;
        </Link>
        {/* Assuming no hamburger menu for now, as it's not explicitly in the current design. */}
        {/* If a hamburger menu is added later, ensure it has aria-label="Toggle navigation" */}
        <ul className="flex space-x-4">
          <li>
            <Link href="/about" className="hover:underline">
              About
            </Link>
          </li>
          <li>
            <Link href="/courses" className="hover:underline">
              Courses
            </Link>
          </li>
          {hasBlogPosts && (
            <li>
              <Link href="/blog" className="hover:underline">
                Blog
              </Link>
            </li>
          )}
          <li>
            <Link href="/faq" className="hover:underline">
              FAQ
            </Link>
          </li>
          <li>
            <Link href="/testimonials" className="hover:underline">
              Testimonials
            </Link>
          </li>
          <li>
            <Link href="/contact" className="hover:underline">
              Contact
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}


