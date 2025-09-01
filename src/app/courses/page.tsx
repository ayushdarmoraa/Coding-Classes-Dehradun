import Link from 'next/link'
import { getCourses } from "@/lib/courses";

export default function CoursesPage() {
  const courses = getCourses();
  return (
    <main className="mx-auto max-w-4xl p-6 space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Our Courses</h1>
        <p className="text-gray-600">
          We offer programs designed for different learning goals. Browse the catalog below.
        </p>
      </header>

      <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {courses.map((course) => (
          <li
            key={course.id}
            className="border rounded-lg p-4 shadow-sm hover:shadow-md transition"
          >
            <h2 className="text-xl font-semibold mb-1">{course.title}</h2>
            <p className="mb-3 text-sm text-gray-600">{course.description}</p>
            <p className="mb-1 text-sm">
              <span className="font-medium">Duration:</span> {course.duration}
            </p>
            <p className="mb-3 text-sm">
              <span className="font-medium">Price:</span> {course.price}
            </p>
            <Link
              href={`/courses/${course.slug}`}
              className="inline-block mt-2 text-blue-600 hover:underline"
            >
              View details →
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
