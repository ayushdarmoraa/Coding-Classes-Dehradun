import { getCourses } from "./courses";
import { formatCourseDuration, formatCoursePrice } from "./pricing";

export interface FAQItem {
  question: string;
  answer: string;
}

const coursePricingAnswer = getCourses()
  .map(
    (course) =>
      `• ${course.shortTitle}: ${formatCourseDuration(course.duration)} · ${formatCoursePrice(course.pricing)} — <a href="/courses/${course.slug}">see curriculum & outcomes</a>.`
  )
  .join("\n");

export const faqs: FAQItem[] = [
  {
    question: "What courses does Doon Coding Academy offer?",
    answer: `We offer Full-Stack with Gen AI, Data Science, Python, and Java. Explore each program:
<a href="/courses/full-stack">Full-Stack (MERN + Gen AI)</a>,
<a href="/courses/data-science">Data Science</a>,
<a href="/courses/python">Python</a>, and
<a href="/courses/java">Java</a>.`,
  },
  {
    question: "Where is Doon Coding Academy located?",
    answer: `Near DR School, Herbertpur (Dehradun district), PIN 248142. See <a href="/locations" aria-label="View our locations">Locations</a> or <a href="/contact" aria-label="Contact Doon Coding Academy">Contact</a> for directions and queries.`,
  },
  {
    question: "What are the fees for the courses?",
    answer: `Current course pricing and duration:
${coursePricingAnswer}`,
  },
  {
    question: "Do you offer flexible payment plans?",
    answer: `Course pricing includes monthly rates and package rates. Details are listed on each course page under Fees. <a href="/courses">Browse courses</a> or <a href="/contact">talk to a mentor</a>.`,
  },
  {
    question: "Who is the target audience for your courses?",
    answer: `College/school students in Dehradun and working professionals seeking upskilling. If you’re unsure which track fits best, <a href="/courses">browse the courses</a> or <a href="/contact">request a quick counselling call</a>.`,
  },
];
