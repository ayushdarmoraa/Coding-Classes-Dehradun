export type Instructor = {
  id: string;
  name: string;
  title: string;              // e.g., "Lead Instructor — Full-Stack"
  bio: string;                // short 1–2 lines
  expertise: string[];        // tags
  photo?: string;             // /images/instructors/<file>.jpg (optional)
  linkedin?: string;
  github?: string;
};

export const INSTRUCTORS: Instructor[] = [
  {
    id: "ayush-darmora",
    name: "Ayush Darmora",
    title: "Founder & Lead Instructor — Full-Stack",
    bio: "8+ years building production apps with React, Node, and cloud. Loves teaching pragmatic engineering.",
    expertise: ["MERN", "Next.js", "TypeScript", "GenAI"],
    photo: "/images/instructors/ayush.jpg",
    linkedin: "https://www.linkedin.com/in/ayushdarmoraa",
    github: "https://github.com/ayushdarmoraa",
  },
  {
    id: "data-mentor",
    name: "Shreya Singh",
    title: "Senior Instructor — Data Science",
    bio: "Hands-on ML with Python, real datasets, and deployment. Ex-analytics lead.",
    expertise: ["Python", "Pandas", "ML", "Visualization"],
    photo: "/images/instructors/shreya.jpg",
    linkedin: "https://www.linkedin.com/",
  },
  {
    id: "java-mentor",
    name: "Rohit Verma",
    title: "Instructor — Java & Spring Boot",
    bio: "Teaches Java fundamentals to production-grade APIs with Spring Boot.",
    expertise: ["Java", "Spring Boot", "REST APIs"],
    photo: "/images/instructors/rohit.jpg",
  },
];
