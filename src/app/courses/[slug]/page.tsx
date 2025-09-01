import { getCourseBySlug } from '@/lib/courses';

export default function CoursePage({ params }: { params: { slug: string } }) {
  const course = getCourseBySlug(params.slug);
  if (!course) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold">Course not found</h1>
      </div>
    );
  }
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
      <p className="mb-2">{course.description}</p>
      <p className="mb-2"><strong>Duration:</strong> {course.duration}</p>
      <p className="mb-2"><strong>Price:</strong> ₹{course.price}</p>
      <h2 className="text-2xl font-semibold mt-4 mb-2">Curriculum</h2>
      <ul className="list-disc ml-6">
        {course.curriculum.map((topic, idx) => (
          <li key={idx}>{topic}</li>
        ))}
      </ul>
      <h2 className="text-2xl font-semibold mt-4 mb-2">Prerequisites</h2>
      <ul className="list-disc ml-6">
        {course.prerequisites.map((pre, idx) => (
          <li key={idx}>{pre}</li>
        ))}
      </ul>
      <h2 className="text-2xl font-semibold mt-4 mb-2">Outcomes</h2>
      <ul className="list-disc ml-6">
        {course.outcomes.map((outcome, idx) => (
          <li key={idx}>{outcome}</li>
        ))}
      </ul>
      <p className="mt-4"><strong>Instructor:</strong> {course.instructor}</p>
      <p className="mb-4"><strong>Schedule:</strong> {course.schedule}</p>
    </div>
  );
}
