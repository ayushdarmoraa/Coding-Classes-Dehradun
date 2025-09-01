import Link from 'next/link'
import { courses } from '@/lib/courses'

export default function CoursesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Our Courses</h1>
      <p>We offer a range of programs designed to meet different learning goals. Browse our courses below.</p>
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {courses.map((course) => (
          <li key={course.id} className="border rounded-lg p-4 shadow-sm hover:shadow-md transition">
            <h2 className="text-xl font-semibold mb-2">{course.title}</h2>
            <p className="mb-4 text-sm text-gray-600">{course.description}</p>
            <Link href={`/courses/${course.slug}`} className="text-blue-600 hover:underline">View details</Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
