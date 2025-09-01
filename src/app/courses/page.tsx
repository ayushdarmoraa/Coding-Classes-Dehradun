import type { Metadata } from "next";
import { getCourses } from "@/lib/courses";
import CourseCard from "@/components/features/CourseCard";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

export const metadata: Metadata = {
  title: "Coding Courses in Dehradun - Full Stack, Data Science, Python, Java",
  description: "Explore our comprehensive coding courses in Dehradun. Learn Full-Stack Development with Gen AI, Data Science, Python, and Java programming with industry experts.",
  alternates: { canonical: "/courses" },
  openGraph: {
    title: "Coding Courses in Dehradun - Doon Coding Academy",
    description: "Explore our comprehensive coding courses in Dehradun. Learn Full-Stack Development with Gen AI, Data Science, Python, and Java programming with industry experts.",
    url: "/courses",
    type: "website",
  },
};

const features = [
  {
    icon: "👨‍🏫",
    title: "Expert Instructors",
    description: "Learn from industry professionals with 6+ years of experience"
  },
  {
    icon: "🏗️",
    title: "Project-Based Learning",
    description: "Build real-world projects that showcase your skills to employers"
  },
  {
    icon: "🎯",
    title: "Job-Ready Skills",
    description: "Curriculum designed to match current industry requirements"
  },
  {
    icon: "🤝",
    title: "Placement Support",
    description: "Resume building, interview prep, and job referrals included"
  }
];

export default function CoursesPage() {
  const courses = getCourses();
  const featuredCourses = courses.filter(course => 
    ['full-stack', 'data-science'].includes(course.slug)
  );
  const otherCourses = courses.filter(course => 
    !['full-stack', 'data-science'].includes(course.slug)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <Badge variant="success" className="mb-6 bg-green-500 text-white">
            🎓 Industry-Focused Curriculum
          </Badge>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Master Coding Skills in Dehradun
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-blue-100">
            Choose from our carefully crafted programs designed to transform you into a job-ready developer. 
            Small batches, hands-on projects, and placement assistance included.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              href="#courses" 
              variant="primary"
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100"
            >
              Browse Courses
            </Button>
            <Button 
              href="/contact"
              variant="secondary"
              size="lg"
              className="border-white text-white hover:bg-white hover:text-blue-600"
            >
              Get Free Consultation
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Our Courses?
            </h2>
            <p className="text-xl text-gray-600">
              We focus on practical skills and real-world experience
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section id="courses" className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Featured Courses
            </h2>
            <p className="text-xl text-gray-600">
              Our most popular programs with highest placement rates
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {featuredCourses.map((course, index) => (
              <CourseCard 
                key={course.id} 
                course={course} 
                featured={index === 0}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Other Courses */}
      {otherCourses.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Foundation Courses
              </h2>
              <p className="text-xl text-gray-600">
                Perfect for beginners starting their coding journey
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              {otherCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Course Comparison */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Course Comparison
            </h2>
            <p className="text-xl text-gray-600">
              Find the perfect course for your career goals
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-lg shadow-md overflow-hidden">
              <thead className="bg-blue-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left">Course</th>
                  <th className="px-6 py-4 text-center">Duration</th>
                  <th className="px-6 py-4 text-center">Price</th>
                  <th className="px-6 py-4 text-center">Level</th>
                  <th className="px-6 py-4 text-center">Job Roles</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">Full-Stack Development (MERN + Gen AI)</div>
                    <div className="text-sm text-gray-600">Complete web development with AI integration</div>
                  </td>
                  <td className="px-6 py-4 text-center">6 months</td>
                  <td className="px-6 py-4 text-center">₹25,000</td>
                  <td className="px-6 py-4 text-center">
                    <Badge variant="success">Beginner to Advanced</Badge>
                  </td>
                  <td className="px-6 py-4 text-center text-sm">
                    Full-Stack Developer, Frontend Developer, Backend Developer
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">Data Science & AI</div>
                    <div className="text-sm text-gray-600">Python, ML, statistics, and AI workflows</div>
                  </td>
                  <td className="px-6 py-4 text-center">6 months</td>
                  <td className="px-6 py-4 text-center">₹30,000</td>
                  <td className="px-6 py-4 text-center">
                    <Badge variant="info">Intermediate</Badge>
                  </td>
                  <td className="px-6 py-4 text-center text-sm">
                    Data Scientist, Data Analyst, ML Engineer
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">Python Programming</div>
                    <div className="text-sm text-gray-600">Foundation programming with Python</div>
                  </td>
                  <td className="px-6 py-4 text-center">2-3 months</td>
                  <td className="px-6 py-4 text-center">TBD</td>
                  <td className="px-6 py-4 text-center">
                    <Badge variant="primary">Beginner</Badge>
                  </td>
                  <td className="px-6 py-4 text-center text-sm">
                    Python Developer, Automation Engineer
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Start Your Coding Journey?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Join our next batch and transform your career with industry-relevant skills.
            Limited seats available!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              href="/contact"
              variant="primary"
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100"
            >
              Enroll Now
            </Button>
            <Button 
              href="https://wa.me/917037905464?text=Hi, I want to know more about course schedules and batches"
              variant="secondary"
              size="lg"
              className="border-white text-white hover:bg-white hover:text-blue-600"
            >
              Ask About Batches
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

