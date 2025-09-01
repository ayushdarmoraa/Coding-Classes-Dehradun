src/lib/courses.tsexport interface Course {
  id: string
  slug: string
  title: string
  description: string
  duration: string
  price: number
  curriculum: string[]
  prerequisites: string[]
  outcomes: string[]
  instructor: string
  schedule: string
  seoMetadata: {
    title: string
    description: string
    keywords: string[]
  }
}

/**
 * Sample course data. In a real application this could be fetched from a CMS or database.
 */
export const courses: Course[] = [
  {
    id: 'full-stack',
    slug: 'full-stack',
    title: 'Full‑Stack Development with Gen AI',
    description: 'Learn to build modern web applications using the latest tools and frameworks, including generative AI integrations.',
    duration: '6 months',
    price: 30000,
    curriculum: [
      'HTML, CSS, and JavaScript fundamentals',
      'React and Next.js for front‑end development',
      'Node.js and Express for back‑end development',
      'Generative AI APIs and integrations',
      'Deployment and DevOps basics',
    ],
    prerequisites: ['Basic computer literacy'],
    outcomes: ['Build full‑stack applications', 'Deploy production‑ready web apps'],
    instructor: 'Experienced industry professionals',
    schedule: 'Weekday evenings and weekend batches',
    seoMetadata: {
      title: 'Full‑Stack Development Course – Doon Coding Academy',
      description: 'Master full‑stack development with Gen AI in Dehradun at Doon Coding Academy.',
      keywords: ['full‑stack course', 'gen ai course', 'coding classes Dehradun'],
    },
  },
  {
    id: 'data-science',
    slug: 'data-science',
    title: 'Data Science and Machine Learning',
    description: 'Dive into the world of data analysis, statistics and machine learning with hands‑on projects.',
    duration: '5 months',
    price: 28000,
    curriculum: [
      'Python for data analysis',
      'Statistics and probability',
      'Machine learning algorithms',
      'Data visualization with Matplotlib and Pandas',
      'Capstone project',
    ],
    prerequisites: ['Basic programming knowledge'],
    outcomes: ['Perform exploratory data analysis', 'Build and evaluate ML models'],
    instructor: 'Data scientists with industry experience',
    schedule: 'Weekend batches',
    seoMetadata: {
      title: 'Data Science Course – Doon Coding Academy',
      description: 'Learn data science and machine learning in Dehradun at Doon Coding Academy.',
      keywords: ['data science course', 'machine learning', 'Dehradun coding academy'],
    },
  },
  {
    id: 'python',
    slug: 'python',
    title: 'Python Programming',
    description: 'Start your programming journey with Python. Ideal for beginners and enthusiasts.',
    duration: '3 months',
    price: 15000,
    curriculum: [
      'Python syntax and semantics',
      'Data structures and algorithms',
      'File I/O and error handling',
      'Intro to web frameworks',
    ],
    prerequisites: ['None'],
    outcomes: ['Write Python programs', 'Solve computational problems'],
    instructor: 'Seasoned Python developers',
    schedule: 'Morning and evening batches',
    seoMetadata: {
      title: 'Python Programming Course – Doon Coding Academy',
      description: 'Learn Python programming from scratch in Dehradun at Doon Coding Academy.',
      keywords: ['python course', 'python programming', 'coding classes'],
    },
  },
  {
    id: 'java',
    slug: 'java',
    title: 'Java Programming',
    description: 'Comprehensive Java programming course covering core and advanced concepts.',
    duration: '4 months',
    price: 18000,
    curriculum: [
      'Java syntax and OOP',
      'Collections framework',
      'Multithreading and concurrency',
      'Spring Boot basics',
    ],
    prerequisites: ['Basic programming knowledge'],
    outcomes: ['Develop Java applications', 'Understand OOP principles'],
    instructor: 'Expert Java professionals',
    schedule: 'Weekday evening batches',
    seoMetadata: {
      title: 'Java Course – Doon Coding Academy',
      description: 'Learn Java programming with hands‑on projects in Dehradun at Doon Coding Academy.',
      keywords: ['java course', 'java programming', 'coding classes'],
    },
  },
]

/**
 * Return a course by slug.
 */
export function getCourseBySlug(slug: string) {
  return courses.find((c) => c.slug === slug)
}
