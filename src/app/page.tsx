import type { Metadata } from "next";
import { getCourses } from "@/lib/courses";
import CourseCard from "@/components/features/CourseCard";
import TestimonialCard from "@/components/features/TestimonialCard";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

const SITE_DESC =
  process.env.NEXT_PUBLIC_SITE_DESCRIPTION ||
  "Leading coding institute in Dehradun — Full Stack with Gen AI, Data Science, Python, Java.";
const RAW_BASE = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
const BASE = RAW_BASE.replace(/^http:\/\//, "https://");

export const metadata: Metadata = {
  title: "Doon Coding Academy | Best Coding, Data Science & AI Courses in Dehradun",
  description:
    "Join Doon Coding Academy for top-rated Full Stack, Data Science, Python, and Java courses in Dehradun. Small batches, hands-on projects, affordable fees, and career support.",
  alternates: { canonical: BASE + "/" },
  openGraph: {
    title: "Doon Coding Academy | Best Coding, Data Science & AI Courses in Dehradun",
    description:
      "Learn Full Stack (MERN + Gen AI), Data Science, Python, and Java in Dehradun. Real projects, expert mentors, and placement support.",
    url: BASE + "/",
    type: "website",
    siteName: "Doon Coding Academy",
  },
  twitter: {
    card: "summary",
    title: "Doon Coding Academy | Best Coding, Data Science & AI Courses in Dehradun",
    description:
      "Top-rated coding, data science, and AI courses in Dehradun. Small batches, hands-on projects, and career support.",
  },
};

const testimonials = [
  {
    name: "Priya Sharma",
    role: "Software Developer",
    company: "TechCorp",
    quote: "The Full Stack course with Gen AI was exactly what I needed to transition into tech. The instructors are amazing and the projects are industry-relevant."
  },
  {
    name: "Rahul Gupta",
    role: "Data Analyst",
    company: "DataFlow Solutions",
    quote: "Best investment I made for my career. The Data Science course gave me practical skills that I use every day at work."
  },
  {
    name: "Anjali Verma",
    role: "Frontend Developer",
    company: "StartupXYZ",
    quote: "Small batch sizes mean personalized attention. I got my first tech job within 3 months of completing the course!"
  }
];

const stats = [
  { number: "500+", label: "Students Trained" },
  { number: "85%", label: "Placement Rate" },
  { number: "15", label: "Max Batch Size" },
  { number: "6+", label: "Years Experience" }
];

export default function HomePage() {
  const courses = getCourses();
  const featuredCourses = courses.filter(course => 
    ['full-stack', 'data-science', 'python'].includes(course.slug)
  );

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
  <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white pt-10 pb-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <Badge variant="success" className="mb-6 bg-green-500 text-white">
            🚀 Now with Gen AI Integration
          </Badge>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            Code Your Future.<br />
            <span className="text-blue-200">Launch Your Career</span><br />
            <span className="text-yellow-300">with AI-Powered Courses</span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed text-blue-100">
            Transform your career with industry-focused coding courses in Dehradun. 
            Learn Full-Stack Development, Data Science, and AI from experienced professionals.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              href="/courses" 
              variant="primary"
              size="lg"
              className="bg-yellow-400 text-blue-900 font-semibold hover:bg-yellow-500"
            >
              Explore Courses
            </Button>
            <Button 
              href="https://wa.me/917037905464?text=Hi, I want to know more about your courses"
              size="lg"
              className="bg-transparent border-2 border-white text-white font-semibold hover:bg-white hover:text-blue-600 transition"
            >
              Chat on WhatsApp
            </Button>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-yellow-300 mb-2">
                  {stat.number}
                </div>
                <div className="text-blue-200 text-sm md:text-base">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Signals */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Doon Coding Academy?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We focus on practical skills, real projects, and career outcomes that matter.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Industry-Focused</h3>
              <p className="text-gray-600">
                Curriculum designed with industry professionals. Learn skills that employers actually need.
              </p>
            </Card>
            
            <Card className="p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">👥</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Small Batches</h3>
              <p className="text-gray-600">
                Maximum 15 students per batch ensures personalized attention and better learning outcomes.
              </p>
            </Card>
            
            <Card className="p-8 text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">AI Integration</h3>
              <p className="text-gray-600">
                Stay ahead with Gen AI tools and techniques integrated into our Full-Stack program.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Popular Courses
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose from our carefully crafted programs designed to get you job-ready.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {featuredCourses.map((course, index) => (
              <CourseCard 
                key={course.id} 
                course={course} 
                featured={index === 0}
              />
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Button href="/courses" variant="secondary" size="lg">
              View All Courses
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Students Say
            </h2>
            <p className="text-xl text-gray-600">
              Real success stories from our graduates
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard key={index} {...testimonial} />
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Button href="/testimonials" variant="ghost">
              Read More Success Stories
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Start Your Tech Journey?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Join hundreds of students who have transformed their careers with us.
            Next batch starts soon!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              href="/courses"
              size="lg"
              className="bg-yellow-400 text-blue-900 font-semibold hover:bg-yellow-500 transition"
            >
              Explore Courses
            </Button>
            <Button
              href="https://wa.me/917037905464?text=Hi, I want to know more about your courses"
              size="lg"
              className="!bg-transparent border-2 border-white text-white font-semibold hover:bg-white hover:text-blue-600 transition"
            >
              Chat on WhatsApp
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

