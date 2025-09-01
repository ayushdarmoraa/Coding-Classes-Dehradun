import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Coding Classes in Dehradun - Doon Coding Academy",
  description: "Looking for the best coding classes in Dehradun? Doon Coding Academy offers Full-Stack, Data Science, Python, and Java courses with expert instructors.",
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/locations/dehradun`,
  },
};

export default function DehradunLocationPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Best Coding Classes in Dehradun</h1>
      <p className="mb-4">
        Doon Coding Academy is proud to offer top-tier coding classes right here in Dehradun. Our Herbertpur campus is easily accessible and provides a conducive learning environment for students of all levels.
      </p>
      <h2 className="text-2xl font-semibold mb-4">Why Choose Us in Dehradun?</h2>
      <ul className="list-disc list-inside mb-4">
        <li>Local expert instructors with industry experience.</li>
        <li>Curriculum tailored to local job market demands.</li>
        <li>State-of-the-art facilities at our Herbertpur campus.</li>
        <li>Flexible timings and affordable fee structures for Dehradun students.</li>
      </ul>
      <p className="mb-4">
        Whether you are a school student, college graduate, or a working professional in Dehradun looking to upskill, our courses in Full-Stack Development, Data Science, Python, and Java are designed to help you achieve your career goals.
      </p>
      <p className="mb-6">
        <Link href="/contact" className="text-blue-600 hover:underline">
          Contact us today
        </Link> to learn more about our upcoming batches and special offers for Dehradun residents!
      </p>
    </div>
  );
}


