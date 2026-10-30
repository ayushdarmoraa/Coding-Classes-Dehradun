// src/lib/nav.ts
import { hasPublishedOutcomeContent } from "@/lib/outcomes";

export type NavLink = { href: string; label: string };
export type CourseLink = { href: string; label: string; accent?: boolean };

export const NAV_LINKS: readonly NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/courses", label: "Courses" },
  { href: "/lab", label: "DCA Lab" },
  { href: "/blog", label: "Guides" },
  ...(hasPublishedOutcomeContent() ? [{ href: "/outcomes", label: "Outcomes" }] : []),
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

export const COURSE_LINKS: readonly CourseLink[] = [
  { href: "/courses/full-stack", label: "Full-Stack with Gen AI" },
  { href: "/courses/data-science", label: "Data Science & AI" },
  { href: "/courses/python", label: "Python" },
  { href: "/courses/java", label: "Java" },
  { href: "/courses", label: "→ All Courses", accent: true },
] as const;
