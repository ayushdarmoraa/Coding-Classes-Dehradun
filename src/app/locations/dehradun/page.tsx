import type { Metadata } from "next";
import Link from "next/link";
import { breadcrumbLd } from "@/lib/seo";
const GBP_URL =
  process.env.NEXT_PUBLIC_GBP_URL || "https://maps.app.goo.gl/Rj1U1jwERHwkfB8Y9";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { trackLeadClick, trackEnrollClick } from "@/lib/analytics";
import Badge from "@/components/ui/Badge";
import { getCourses } from "@/lib/courses";

export const metadata: Metadata = {
  title: "Coding Classes in Dehradun (On-Campus & Hybrid)",
  description:
    "Join DCA in Dehradun for Full-Stack, Data Science, Python & Java. Small batches, mentor hours, real projects, and placement support—plus online cohorts for non-locals.",
  alternates: { canonical: "https://dooncodingacademy.in/locations/dehradun" },
  openGraph: {
    title: "Coding Classes in Dehradun (On-Campus & Hybrid)",
    description:
      "Join DCA in Dehradun for Full-Stack, Data Science, Python & Java. Small batches, mentor hours, real projects, and placement support—plus online cohorts for non-locals.",
    url: "https://dooncodingacademy.in/locations/dehradun",
    type: "website",
    siteName: "Doon Coding Academy",
  },
  twitter: {
    card: "summary_large_image",
    title: "Coding Classes in Dehradun (On-Campus & Hybrid)",
    description:
      "Join DCA in Dehradun for Full-Stack, Data Science, Python & Java. Small batches, mentor hours, real projects, and placement support—plus online cohorts for non-locals.",
  },
};

const localFeatures = [
  {
    icon: "🏢",
    title: "Growing IT Sector",
    description: "Dehradun's IT industry is expanding with 600+ software jobs available locally"
  },
  {
    icon: "🎓",
    title: "Educational Hub",
    description: "Located in Uttarakhand's educational capital with numerous colleges and institutes"
  },
  {
    icon: "🚗",
    title: "Easy Accessibility",
    description: "Conveniently located in Herbertpur, easily accessible from all parts of Dehradun"
  },
  {
    icon: "💼",
    title: "Local Job Market",
    description: "Strong placement network with local companies and startups in Dehradun region"
  }
];

const nearbyAreas = [
  "Herbertpur", "Vikasnagar", "Clement Town", "Rajpur", "Mussoorie Road",
  "Sahastradhara Road", "Patel Nagar", "Race Course", "Ballupur", "Jakhan"
];

const localCompanies = [
  "DAStek Softwares Pvt Ltd", "IT Bytes", "Infinite Computer Solutions",
  "Dr. Design Pvt. Ltd", "Kushub Media Solution", "J P Research India"
];

export default function DehradunLocationPage() {
  const crumbs = breadcrumbLd([
    { name: "Home", url: "https://dooncodingacademy.in/" },
    { name: "Dehradun", url: "https://dooncodingacademy.in/locations/dehradun" },
  ]);
  const courses = getCourses();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-8">
            <Badge variant="success" className="mb-4 bg-green-500 text-white">
              📍 Located in Herbertpur, Dehradun
            </Badge>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Best Coding Classes in Dehradun
            </h1>
            
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-blue-100">
              Transform your career with industry-focused coding education right here in Uttarakhand&#39;s capital. 
              Join Dehradun&#39;s premier coding academy with proven placement success.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                href="/contact"
                variant="primary"
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-100"
                onClick={() =>
                  trackEnrollClick({
                    page_type: "location_page",
                    course_slug: "full-stack",
                    city: "dehradun",
                    variant: "visit_campus_hero",
                  })
                }
              >
                Visit Our Campus
              </Button>
              <Button
                href="https://wa.me/917037905464?text=Hi, I want to visit your Dehradun campus"
                variant="secondary"
                size="lg"
                className="border-white text-white hover:bg-white hover:text-blue-600"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackLeadClick("whatsapp", { page_type: "location_page", city: "dehradun" })}
              >
                Get Directions
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Why Dehradun */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Coding Classes in Dehradun?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Dehradun is emerging as a significant IT hub in North India, offering excellent opportunities 
              for aspiring developers and tech professionals.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {localFeatures.map((feature, index) => (
              <Card key={index} className="p-6 text-center h-full">
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Campus Location */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Our Herbertpur Campus
              </h2>
              
              <div className="space-y-4 mb-8">
                <p className="mb-2">
                  <a
                    href={GBP_URL}
                    target="_blank"
                    rel="noopener"
                    className="text-blue-700 hover:underline"
                  >
                    Open in Google Maps (Directions)
                  </a>
                </p>
                <div className="flex items-start space-x-3">
                  <span className="text-blue-600 text-xl">📍</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">Address</h3>
                    <p className="text-gray-600">Near DR School, Herbertpur, Dehradun, PIN 248142</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <span className="text-blue-600 text-xl">🚌</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">Transportation</h3>
                    <p className="text-gray-600">Well-connected by local buses and easily accessible by private transport</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <span className="text-blue-600 text-xl">🏫</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">Facilities</h3>
                    <p className="text-gray-600">Modern classrooms, high-speed internet, and state-of-the-art computer lab</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <span className="text-blue-600 text-xl">🕒</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">Timings</h3>
                    <p className="text-gray-600">Flexible batch timings: Morning (9 AM - 12 PM), Evening (6 PM - 9 PM), Weekend batches available</p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  href="https://maps.google.com/?q=Near+DR+School+Herbertpur+Dehradun"
                  variant="primary"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackLeadClick("directions", { page_type: "location_page", city: "dehradun" })}
                >
                  View on Google Maps
                </Button>
                <Button
                  href="/contact"
                  variant="secondary"
                  onClick={() =>
                    trackEnrollClick({
                      page_type: "location_page",
                      course_slug: "full-stack",
                      city: "dehradun",
                      variant: "schedule_visit",
                    })
                  }
                >
                  Schedule Campus Visit
                </Button>
              </div>
            </div>
            
            <Card className="p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Areas We Serve in Dehradun
              </h3>
              
              <div className="grid grid-cols-2 gap-3">
                {nearbyAreas.map((area, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <span className="text-green-500">✓</span>
                    <span className="text-gray-700 text-sm">{area}</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-blue-800 text-sm">
                  <strong>Special Offer:</strong> Students from Herbertpur and nearby areas get 10% discount on course fees!
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Local Lander: Dehradun SEO Block */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Learn Coding in Dehradun (On-Campus & Hybrid)
          </h2>

          <p className="text-lg text-gray-700 mb-5">
            Dehradun is a great place to get job-ready tech skills. At Doon Coding Academy (near DR School, Herbertpur),
            you’ll learn in <strong>small batches</strong> with <strong>mentor support</strong>, real-world projects, and a
            schedule that works for students and working professionals alike. Prefer the classroom? Join our <strong>on-campus</strong> sessions.
            Need flexibility? Use our <strong>hybrid</strong> option—attend in person when you can and keep progressing with
            recorded sessions, doubt-clearing hours, and weekly project reviews.
          </p>

          <div className="grid md:grid-cols-3 gap-8 mb-10">
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Where You’ll Study</h3>
              <p className="text-gray-700">
                Our campus environment stays focused and practical: short theory blocks, lots of hands-on coding,
                and immediate feedback from instructors. You’ll build portfolio projects and practice interviews
                so you’re ready for real roles in web development and data.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Getting Here</h3>
              <p className="text-gray-700">
                We serve nearby areas like Herbertpur, Vikasnagar, Selaqui, Premnagar, and Dehradun city.
                Public transport and shared rides are common on the main routes, and there’s convenient local
                access around the campus area.
              </p>
              <ul className="mt-3 list-disc list-inside text-gray-700 space-y-1">
                <li>Weekday timings typically <strong>10:00–19:00</strong> (check current batch schedule).</li>
                <li>Hybrid option for commuters—skip the travel when needed and stay on track.</li>
                <li>Mentor hours and project check-ins keep you progressing every week.</li>
              </ul>
            </div>

            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">How the Hybrid Model Works</h3>
              <p className="text-gray-700">
                Every cohort includes live sessions (in person or online), session <strong>recordings</strong>,
                structured <strong>doubt support</strong>, and <strong>project reviews</strong>. You’ll never be stuck:
                show your code, get feedback, and move to the next milestone.
              </p>
              <ul className="mt-3 list-disc list-inside text-gray-700 space-y-1">
                <li>Live + recordings for revision and catch-up.</li>
                <li>Clear weekly outcomes and checkpoints.</li>
                <li>Interview prep and placement guidance near graduation.</li>
              </ul>
            </div>
          </div>

          <h3 className="text-2xl font-semibold text-gray-900 mb-3">Courses You Can Join On-Campus</h3>
          <p className="text-gray-700 mb-4">
            Pick the track that fits your goals. All programs include practical projects and mentor support:
            <Link href="/courses/full-stack" className="text-blue-700 hover:underline font-medium"> Full-Stack (MERN + Gen AI)</Link>,
            <Link href="/courses/data-science" className="text-blue-700 hover:underline font-medium"> Data Science &amp; AI</Link>,
            <Link href="/courses/python" className="text-blue-700 hover:underline font-medium"> Python</Link>, and
            <Link href="/courses/java" className="text-blue-700 hover:underline font-medium"> Java</Link>.
          </p>
          <ul className="grid md:grid-cols-2 gap-6 text-gray-700 mb-8">
            <li className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <strong>Full-Stack (6 months)</strong> — Modern front-end + back-end with real deployments, teamwork, and
              Gen-AI aids for productivity.
            </li>
            <li className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <strong>Data Science (6 months)</strong> — Python, data wrangling, visualization, and foundations for ML workflows.
            </li>
            <li className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <strong>Python (4 months)</strong> — Beginner-friendly path into programming and automation.
            </li>
            <li className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <strong>Java (4 months)</strong> — Strong OOP base used widely in enterprise development.
            </li>
          </ul>

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Not in Dehradun?</h3>
            <p className="text-gray-700">
              Join our <strong>online cohorts</strong>—live classes with recordings, mentor hours, community, and the same
              project-driven approach, designed for learners across India. It’s the best of structured guidance with
              flexible access.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/courses"
              className="inline-flex items-center justify-center rounded-lg px-6 py-3 text-base font-medium bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md hover:shadow-lg"
            >
              Explore On-Campus Courses
            </Link>
            <Link
              href="/online-courses"
              className="inline-flex items-center justify-center rounded-lg px-6 py-3 text-base font-medium border-2 border-blue-600 text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              See Online Cohorts (Live + Projects)
            </Link>
          </div>
        </div>
      </section>

      {/* Local Job Market */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Thriving Tech Job Market in Dehradun
            </h2>
            <p className="text-xl text-gray-600">
              Our graduates are working at leading companies across Dehradun and Uttarakhand
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <Card className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">600+</div>
              <div className="text-gray-600">Software Jobs Available</div>
              <div className="text-sm text-gray-500 mt-1">in Dehradun region</div>
            </Card>
            
            <Card className="p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">₹3-8L</div>
              <div className="text-gray-600">Average Salary Range</div>
              <div className="text-sm text-gray-500 mt-1">for entry-level developers</div>
            </Card>
            
            <Card className="p-6 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">85%</div>
              <div className="text-gray-600">Placement Rate</div>
              <div className="text-sm text-gray-500 mt-1">within 6 months</div>
            </Card>
          </div>
          
          <Card className="p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
              Our Placement Partners in Dehradun Region
            </h3>
            
            <div className="grid md:grid-cols-3 gap-4">
              {localCompanies.map((company, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-blue-600">🏢</span>
                  <span className="text-gray-700 text-sm font-medium">{company}</span>
                </div>
              ))}
            </div>
            
            <div className="text-center mt-6">
              <p className="text-gray-600 text-sm mb-4">
                And many more companies across Uttarakhand, Delhi NCR, and remote opportunities
              </p>
              <Button href="/testimonials" variant="ghost">
                Read Success Stories
              </Button>
            </div>
          </Card>
        </div>
      </section>

      {/* Courses Available */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Coding Courses Available in Dehradun
            </h2>
            <p className="text-xl text-gray-600">
              Industry-focused curriculum designed for Dehradun&#39;s growing tech market
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {courses.slice(0, 4).map((course) => (
              <Card key={course.id} className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {course.title}
                </h3>
                <p className="text-gray-600 mb-4">
                  {course.description}
                </p>
                
                <div className="flex items-center justify-between mb-4">
                  <Badge variant="info">{course.duration}</Badge>
                  <span className="font-semibold text-blue-600">{course.price}</span>
                </div>
                
                <div className="flex gap-3">
                  <Button 
                    href={`/courses/${course.slug}`}
                    variant="primary"
                    size="sm"
                    className="flex-1"
                  >
                    View Details
                  </Button>
                  <Button
                    href={`https://wa.me/917037905464?text=Hi, I'm interested in ${course.title} course in Dehradun`}
                    variant="secondary"
                    size="sm"
                    className="flex-1"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() =>
                      trackLeadClick("whatsapp", {
                        page_type: "location_page",
                        city: "dehradun",
                        course_slug: course.slug,
                      })
                    }
                  >
                    Enquire Now
                  </Button>
                </div>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <Button href="/courses" variant="ghost" size="lg">
              View All Courses
            </Button>
          </div>
        </div>
      </section>

      {/* Local Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Success Stories from Dehradun
            </h2>
            <p className="text-xl text-gray-600">
              Local students who transformed their careers with us
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
                  R
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Rohit Sharma</div>
                  <div className="text-sm text-gray-600">Software Developer at DAStek Softwares</div>
                  <div className="text-xs text-gray-500">From Herbertpur, Dehradun</div>
                </div>
              </div>
              <p className="text-gray-700 italic">
                &quot;Being a local student, I was looking for quality coding education without leaving Dehradun. 
                Doon Coding Academy provided exactly that. The instructors understand the local job market 
                and prepared me well for interviews with Dehradun-based companies.&quot;
              </p>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
                  P
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Priya Negi</div>
                  <div className="text-sm text-gray-600">Data Analyst at IT Bytes</div>
                  <div className="text-xs text-gray-500">From Clement Town, Dehradun</div>
                </div>
              </div>
              <p className="text-gray-700 italic">
                &quot;The Data Science course helped me transition from a non-tech background to a rewarding 
                career in analytics. The small batch size meant I got personal attention, and the 
                placement support was excellent for finding opportunities in Dehradun.&quot;
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Start Your Tech Career in Dehradun
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Join Dehradun&#39;s leading coding academy and become part of Uttarakhand&#39;s growing tech ecosystem. 
            Next batch starts soon at our Herbertpur campus!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              href="/contact"
              variant="primary"
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100"
              onClick={() =>
                trackEnrollClick({
                  page_type: "location_page",
                  course_slug: "full-stack",
                  city: "dehradun",
                  variant: "visit_campus_footer",
                })
              }
            >
              Visit Our Campus
            </Button>
            <Button
              href="https://wa.me/917037905464?text=Hi, I want to enroll in coding classes in Dehradun"
              variant="secondary"
              size="lg"
              className="border-white text-white hover:bg-white hover:text-blue-600"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() =>
                trackLeadClick("whatsapp", { page_type: "location_page", city: "dehradun" })
              }
            >
              Enroll Now
            </Button>
          </div>
          
          <div className="mt-8 text-blue-200 text-sm">
            <p>📍 Near DR School, Herbertpur, Dehradun | 📞 +91 7037905464</p>
          </div>
        </div>
      </section>

      <script
        id="breadcrumbs-dehradun"
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbs) }}
      />
    </div>
  );
}

