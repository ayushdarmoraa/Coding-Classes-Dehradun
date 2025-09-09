// src/lib/nav.ts
export type NavLink = { href: string; label: string };
export type CourseLink = { href: string; label: string; accent?: boolean };

export const NAV_LINKS: readonly NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/online-courses", label: "Online Courses" },
  // "Courses" is handled as its own dropdown/accordion in Header
  { href: "/faq", label: "FAQ" },
  { href: "/testimonials", label: "Testimonials" },
  { href: "/contact", label: "Contact" },
] as const;

export const COURSE_LINKS: readonly CourseLink[] = [
  { href: "/courses/full-stack", label: "Full-Stack with Gen AI" },
  { href: "/courses/data-science", label: "Data Science" },
  { href: "/courses/python", label: "Python" },
  { href: "/courses/java", label: "Java" },
  { href: "/courses", label: "→ All Courses", accent: true },
] as const;
