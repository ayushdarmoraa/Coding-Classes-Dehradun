import type { Course } from "./courses";
import { getCourseProjectDetails } from "./course-catalog";
import { formatCourseDuration, formatCoursePrice } from "./pricing";

type CourseExperienceCopy = {
  learnerFit: string;
  practicalPractice: string;
  learningApproach: string[];
  topicFaq: {
    question: string;
    answer: (course: Course) => string;
  };
};

const COURSE_EXPERIENCE_COPY: Record<string, CourseExperienceCopy> = {
  "full-stack": {
    learnerFit:
      "A good starting point for learners with basic computer skills who want to explore front-end and back-end web development. The listed curriculum moves from web fundamentals through React, APIs, databases, and deployment.",
    practicalPractice:
      "Bring the listed web, API, database, and deployment topics together as you develop full-stack skills.",
    learningApproach: [
      "Start with the listed web foundations and build familiarity with JavaScript and TypeScript.",
      "Connect interface, API, and database topics as you work through the curriculum.",
      "Use the published project and deployment outcomes to guide further practice.",
    ],
    topicFaq: {
      question: "What topics are included in the Full-Stack curriculum?",
      answer: (course) =>
        `The listed curriculum covers ${course.curriculum.join("; ")}.`,
    },
  },
  "data-science": {
    learnerFit:
      "For learners comfortable with basic math and ready to learn Python, who want to explore data analysis, statistics, machine learning, and introductory AI topics.",
    practicalPractice:
      "Use the listed data preparation, visualization, statistics, and model-evaluation topics to practise analysing and explaining results.",
    learningApproach: [
      "Build from Python and data-handling foundations into cleaning and visualization.",
      "Connect statistics and probability concepts to the listed machine-learning topics.",
      "Use model evaluation and the published notebook, report, and capstone outcomes to guide practice.",
    ],
    topicFaq: {
      question: "Which tools and topics are covered?",
      answer: (course) =>
        `The listed curriculum covers ${course.curriculum.join("; ")}.`,
    },
  },
  python: {
    learnerFit:
      "A starting point for beginners, including learners with no prior coding experience, and for anyone looking to strengthen practical Python fundamentals.",
    practicalPractice:
      "Practise combining Python fundamentals, collections, object-oriented concepts, and file and JSON handling.",
    learningApproach: [
      "Begin with Python syntax and data types, then work through control flow and functions.",
      "Practise organizing code with collections, modules, and object-oriented concepts.",
      "Apply file and JSON handling to the simple CLI project work listed in the curriculum.",
    ],
    topicFaq: {
      question: "Do I need prior coding experience?",
      answer: (course) =>
        `The published prerequisite is ${course.prerequisites.join("; ")}. The curriculum starts with ${course.curriculum[0]} and continues through ${course.curriculum.slice(1).join("; ")}.`,
    },
  },
  java: {
    learnerFit:
      "A starting point for beginners, including learners with no prior coding experience, and for anyone looking to build a foundation in Java.",
    practicalPractice:
      "Practise Java syntax, object-oriented concepts, collections, exceptions, and input/output with exercises based on the published curriculum.",
    learningApproach: [
      "Start with Java syntax and tooling, then build familiarity with object-oriented concepts.",
      "Work through interfaces, packages, collections, and generics as listed in the curriculum.",
      "Use exception handling, I/O, and the introduction to Spring basics as topics for further practice.",
    ],
    topicFaq: {
      question: "Does the curriculum include Spring Boot?",
      answer: (course) => {
        const springTopic = course.curriculum.find((item) =>
          /spring/i.test(item),
        );
        return springTopic
          ? `The published curriculum lists ${springTopic}. Spring Boot is not specifically listed.`
          : "The published curriculum does not specifically list Spring basics or Spring Boot.";
      },
    },
  },
};

export function getCourseExperienceContent(course: Course) {
  const copy = COURSE_EXPERIENCE_COPY[course.slug];
  if (!copy) {
    throw new Error(`Missing course experience copy for "${course.slug}".`);
  }

  const projectDetails = getCourseProjectDetails(course);
  const projectSummary = projectDetails.length
    ? `Published course outcomes include: ${projectDetails.join("; ")}.`
    : copy.practicalPractice;

  return {
    ...copy,
    projectDetails,
    projectSummary,
    faqs: [
      {
        question: `How long is the ${course.shortTitle} course?`,
        answer: `The listed course duration is ${formatCourseDuration(course.duration)}. Ask about upcoming batch dates and schedules.`,
      },
      {
        question: `What are the fees for ${course.shortTitle}?`,
        answer: `The current listed fees are ${formatCoursePrice(course.pricing)}. Contact the team if you have questions about the available payment options.`,
      },
      {
        question: copy.topicFaq.question,
        answer: copy.topicFaq.answer(course),
      },
      {
        question: "What learning format and support are available?",
        answer:
          "The course page outlines the current curriculum and learning modes. Discuss your goals with the team to learn about upcoming batches, class arrangements, and available support.",
      },
    ],
  };
}
