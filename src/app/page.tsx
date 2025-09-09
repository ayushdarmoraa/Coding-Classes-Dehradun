import type { Metadata } from "next";
import { getCourses } from "@/lib/courses";
import CourseCard from "@/components/features/CourseCard";
import TestimonialCard from "@/components/features/TestimonialCard";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import HomeFAQ from "@/components/faq/HomeFAQ";

const RAW_BASE = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
const BASE = RAW_BASE.replace(/^http:\/\//, "https://");
// NEW: force apex (strip leading "www.")
const APEX = BASE.replace(/^https:\/\/www\./, "https://");

export const metadata: Metadata = {
  title: "Coding Courses in Dehradun & Online in India",
  description:
    "Join DCA for Full-Stack, Data Science, Python & Java—live in Dehradun and online across India. Small batches, projects, recordings & mentor support.",
  // ✅ Canonical to apex (trailing slash)
  alternates: { canonical: APEX + "/" },
  openGraph: {
    title: "Coding Courses in Dehradun & Online in India",
    description:
      "Join DCA for Full-Stack, Data Science, Python & Java—live in Dehradun and online across India. Small batches, projects, recordings & mentor support.",
    // ✅ OG url to apex + add image
    url: APEX + "/",
    type: "website",
    siteName: "Doon Coding Academy",
  },
  twitter: {
    // ✅ Large image card + image fallback
    card: "summary_large_image",
    title: "Coding Courses in Dehradun & Online in India",
    description:
      "Join DCA for Full-Stack, Data Science, Python & Java—live in Dehradun and online across India. Small batches, projects, recordings & mentor support.",
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
            Coding Courses in Dehradun &amp; Online in India
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


  {/* FAQ (Home) — compact accordion, one-open-at-a-time */}
  <HomeFAQ />

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

      {/* Why Online with DCA (Home) */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Online with DCA (Live + Projects)
            </h2>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto">
              Learn from anywhere in India without losing the structure and accountability of a classroom.
              Our live sessions run on a fixed cohort schedule and every class is recorded the same day,
              so you can revise at your pace. Dedicated mentor hours keep your doubts unblocked, while a
              tight-knit peer community helps you stay consistent and ship work that employers notice.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6 h-full">
              <h3 className="text-xl font-semibold mb-2">Live classes + recordings</h3>
              <p className="text-gray-600">
                Attend interactive lectures with Q&amp;A and get full recordings with timestamps and
                resources so you never fall behind—even if you miss a session.
              </p>
            </Card>

            <Card className="p-6 h-full">
              <h3 className="text-xl font-semibold mb-2">Mentor hours &amp; code reviews</h3>
              <p className="text-gray-600">
                Book evening IST office hours for 1:1 help. Get actionable feedback on assignments,
                pull-requests, and project architecture to level up quickly.
              </p>
            </Card>

            <Card className="p-6 h-full">
              <h3 className="text-xl font-semibold mb-2">Structured cohort flow</h3>
              <p className="text-gray-600">
                Weekly goals, sprints, and demo-days keep momentum high. Clear rubrics define what
                “good” looks like for every module.
              </p>
            </Card>

            <Card className="p-6 h-full">
              <h3 className="text-xl font-semibold mb-2">Hands-on, portfolio projects</h3>
              <p className="text-gray-600">
                Build real apps and data notebooks from scratch. Repo-first learning with GitHub issues,
                PRs, and reviews—exactly how modern teams work.
              </p>
            </Card>

            <Card className="p-6 h-full">
              <h3 className="text-xl font-semibold mb-2">Accountability &amp; community</h3>
              <p className="text-gray-600">
                Small batches, stand-ups, peer reviews, and challenge streaks keep you consistent.
                Learn together, grow faster.
              </p>
            </Card>

            <Card className="p-6 h-full">
              <h3 className="text-xl font-semibold mb-2">Tools &amp; support</h3>
              <p className="text-gray-600">
                GitHub Classroom, Notion roadmaps, Kaggle/CodeSandbox, Zoom. Seamless onboarding and
                quick tech support so the focus stays on learning.
              </p>
            </Card>
          </div>

          <p className="text-lg text-gray-700 max-w-4xl mx-auto mt-8 text-center">
            Prefer a campus vibe? You can attend hybrid sessions in Dehradun when convenient—your cohort
            progress and support remain the same.
          </p>

          <div className="text-center mt-10">
            <Button href="/courses" size="lg" variant="primary" className="mr-3">
              Explore Courses
            </Button>
            <Button href="/contact" size="lg" variant="ghost">
              Talk to a Mentor
            </Button>
          </div>
        </div>
      </section>

      {/* Snapshot: Modes, Duration, Fees & Outcomes */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
            Snapshot: Modes, Duration, Fees & Outcomes
          </h2>
          <p className="text-gray-600 mb-6">
            Compare tracks at a glance. All cohorts include live sessions, recordings,
            mentor hours, and project reviews to keep you progressing every week.
          </p>

          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <th className="px-4 py-3 font-semibold">Course</th>
                  <th className="px-4 py-3 font-semibold">Mode</th>
                  <th className="px-4 py-3 font-semibold">Duration</th>
                  <th className="px-4 py-3 font-semibold">Fees</th>
                  <th className="px-4 py-3 font-semibold">Placement rate</th>
                  <th className="px-4 py-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="px-4 py-3">Full-Stack Development (MERN + Gen AI)</td>
                  <td className="px-4 py-3">Online / Hybrid</td>
                  <td className="px-4 py-3">6 months</td>
                  <td className="px-4 py-3">
                    ₹25,000 <span className="text-gray-500 text-xs">(₹5,000/month)</span>
                  </td>
                  <td className="px-4 py-3">85%</td>
                  <td className="px-4 py-3 text-right">
                    <Button href="/courses/full-stack" size="sm">View</Button>
                  </td>
                </tr>

                <tr>
                  <td className="px-4 py-3">Data Science &amp; AI</td>
                  <td className="px-4 py-3">Online / Hybrid</td>
                  <td className="px-4 py-3">6 months</td>
                  <td className="px-4 py-3">
                    ₹30,000 <span className="text-gray-500 text-xs">(₹6,000/month)</span>
                  </td>
                  <td className="px-4 py-3">85%</td>
                  <td className="px-4 py-3 text-right">
                    <Button href="/courses/data-science" size="sm">View</Button>
                  </td>
                </tr>

                <tr>
                  <td className="px-4 py-3">Python Programming</td>
                  <td className="px-4 py-3">Online / Hybrid</td>
                  <td className="px-4 py-3">4 months</td>
                  <td className="px-4 py-3">
                    ₹12,000 <span className="text-gray-500 text-xs">(₹4,000/month)</span>
                  </td>
                  <td className="px-4 py-3">85%</td>
                  <td className="px-4 py-3 text-right">
                    <Button href="/courses/python" size="sm">View</Button>
                  </td>
                </tr>

                <tr>
                  <td className="px-4 py-3">Java Programming</td>
                  <td className="px-4 py-3">Online / Hybrid</td>
                  <td className="px-4 py-3">4 months</td>
                  <td className="px-4 py-3">
                    ₹12,000 <span className="text-gray-500 text-xs">(₹4,000/month)</span>
                  </td>
                  <td className="px-4 py-3">85%</td>
                  <td className="px-4 py-3 text-right">
                    <Button href="/courses/java" size="sm">View</Button>
                  </td>
                </tr>
              </tbody>
            </table>
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

