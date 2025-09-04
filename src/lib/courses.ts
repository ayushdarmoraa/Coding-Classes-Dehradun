import { PRICES } from "@/lib/pricing";

export interface Course {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: string;
  duration: string;
  level?: string;
  curriculum: string[];
  prerequisites: string[];
  outcomes: string[];
}

const courses: Course[] = [
  {
    id: "1",
    slug: "full-stack",
    title: "Full-Stack Development (MERN + Gen AI)",
    description:
      "Modern full-stack program covering HTML/CSS/JS, React, Node.js, Express, MongoDB, Git/GitHub, deployments, and Gen AI integrations.",
    price: PRICES.FULL_STACK_GEN_AI,
    duration: "6 months",
    curriculum: [
      "HTML, CSS, Tailwind fundamentals",
      "Modern JavaScript (ES202x) & TypeScript basics",
      "React + Hooks, Routing, State management",
      "Node.js, Express APIs, MongoDB",
      "Auth, security, validation",
      "Gen AI APIs (prompting, simple RAG)",
      "Project, Git/GitHub, deployment (Vercel)"
    ],
    prerequisites: ["Basic computer skills", "Motivation to learn"],
    outcomes: [
      "Build full-stack apps end-to-end",
      "Deploy production projects",
      "Portfolio with 2–3 projects"
    ]
  },
  {
    id: "2",
    slug: "data-science",
    title: "Data Science & AI",
    description:
      "Python for data analysis, statistics, ML algorithms, model evaluation, and practical AI workflows.",
    price: PRICES.DATA_SCIENCE,
    duration: "6 months",
    curriculum: [
      "Python, NumPy, Pandas",
      "Data cleaning & visualization",
      "Stats & probability basics",
      "ML algorithms (regression, trees, clustering)",
      "Model evaluation & tuning",
      "Intro to Gen AI & LLM tooling"
    ],
    prerequisites: ["Basic math", "Comfort with learning Python"],
    outcomes: [
      "Analyze datasets & build ML models",
      "Create notebooks & reports",
      "Mini capstone project"
    ]
  },
  {
    id: "3",
    slug: "python",
    title: "Python Programming",
    description:
      "Start-to-pro Python: syntax, data structures, OOP, file/JSON work, and small projects.",
  price: "₹6,000 (or ₹2,000/month)",
  duration: "4 months",
  level: "Intermediate",
    curriculum: [
      "Python basics & data types",
      "Control flow, functions, modules",
      "Lists, dicts, sets",
      "OOP & error handling",
      "Files, JSON, simple CLI projects"
    ],
    prerequisites: ["No prior coding required"],
    outcomes: [
      "Write clean Python scripts",
      "Understand OOP & modules",
      "Build small utilities"
    ]
  },
  {
    id: "4",
    slug: "java",
    title: "Java Programming",
    description:
      "Core Java foundations: syntax, OOP, collections, exceptions, and intro to Spring basics.",
  price: "₹6,000 (or ₹2,000/month)",
  duration: "4 months",
  level: "Intermediate",
    curriculum: [
      "Java syntax & tooling",
      "OOP, interfaces, packages",
      "Collections & generics",
      "Exceptions & IO",
      "Intro to Spring basics"
    ],
    prerequisites: ["No prior coding required"],
    outcomes: [
      "Strong Java fundamentals",
      "OOP problem-solving",
      "Starter backend knowledge"
    ]
  }
];

export function getCourses(): Course[] {
  return courses;
}

export function getCourseBySlug(slug: string): Course | undefined {
  return courses.find((c) => c.slug === slug);
}
