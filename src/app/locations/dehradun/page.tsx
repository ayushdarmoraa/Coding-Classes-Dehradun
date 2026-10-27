import type { Metadata } from "next";
import Link from "next/link";
import { breadcrumbLd } from "@/lib/seo";
const GBP_URL =
  process.env.NEXT_PUBLIC_GBP_URL || "https://maps.app.goo.gl/Rj1U1jwERHwkfB8Y9";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { getCourses } from "@/lib/courses";
import { testimonials } from "@/lib/testimonials";

const SERVICE_AREAS = [
  "Herbertpur",
  "Vikasnagar",
  "Prem Nagar",
  "Clement Town",
  "Dehradun city",
  "Nearby regions",
];

const LOCAL_FAQ = [
  {
    q: "Do you offer offline classes in Herbertpur/Dehradun?",
    a: "Yes. On-campus courses are available in Herbertpur (Dehradun district).",
  },
  {
    q: "How big are the batches?",
    a: "Contact us for current class-size details.",
  },
  {
    q: "What are the class timings?",
    a: "Weekday and weekend options are available. See the Courses page or contact us for the current schedule.",
  },
];

export const metadata: Metadata = {
  title: "Coding Classes in Dehradun | Doon Coding Academy",
  description:
    "Explore Full-Stack, Data Science, Python, and Java courses at Doon Coding Academy in Herbertpur, Dehradun.",
  alternates: { canonical: "https://dooncodingacademy.in/locations/dehradun" },
  openGraph: {
    title: "Coding Classes in Dehradun | Doon Coding Academy",
    description:
      "Explore Full-Stack, Data Science, Python, and Java courses at Doon Coding Academy in Herbertpur, Dehradun.",
    url: "https://dooncodingacademy.in/locations/dehradun",
    type: "website",
    siteName: "Doon Coding Academy",
  },
  twitter: {
    card: "summary_large_image",
    title: "Coding Classes in Dehradun | Doon Coding Academy",
    description:
      "Explore Full-Stack, Data Science, Python, and Java courses at Doon Coding Academy in Herbertpur, Dehradun.",
  },
};

const localFeatures = [
  {
    icon: "🏢",
    title: "Herbertpur Campus",
    description: "Find the campus location and directions on this page."
  },
  {
    icon: "📚",
    title: "Course Options",
    description: "Explore Full-Stack, Data Science, Python, and Java courses."
  },
  {
    icon: "🏫",
    title: "On-Campus Courses",
    description: "Review course details for learning at the Herbertpur campus."
  },
  {
    icon: "💻",
    title: "Online Courses",
    description: "Browse online course options for learners outside Dehradun."
  }
];

const nearbyAreas = [
  "Herbertpur", "Vikasnagar", "Clement Town", "Rajpur", "Mussoorie Road",
  "Sahastradhara Road", "Patel Nagar", "Race Course", "Ballupur", "Jakhan"
];

export default function DehradunLocationPage() {
  const crumbs = breadcrumbLd([
    { name: "Home", url: "https://dooncodingacademy.in/" },
    { name: "Dehradun", url: "https://dooncodingacademy.in/locations/dehradun" },
  ]);
  const courses = getCourses();

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-8">
            <Badge variant="success" className="mb-4 bg-green-500 text-white">
              📍 Located in Herbertpur (Dehradun district)
            </Badge>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Coding Classes in Dehradun
            </h1>
            
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-blue-100">
              Explore Full-Stack, Data Science, Python, and Java courses at our Herbertpur campus.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                href="/contact"
                variant="primary"
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-100"
                event="cta_enroll_click"
                eventParams={{ page_type: "location_page", course_slug: "full-stack", city: "dehradun", variant: "visit_campus_hero" }}
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
                event="lead_contact_click"
                eventParams={{ channel: "whatsapp", page_type: "location_page", city: "dehradun" }}
              >
                Get Directions
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Course and campus information */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Explore DCA in Dehradun
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Review the available course options and Herbertpur campus information.
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
                    <p className="text-gray-600">Near DR School, Herbertpur (Dehradun district), PIN 248142</p>
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
                  event="lead_contact_click"
                  eventParams={{ channel: "directions", page_type: "location_page", city: "dehradun" }}
                >
                  View on Google Maps
                </Button>
                <Button
                  href="/contact"
                  variant="secondary"
                  event="cta_enroll_click"
                  eventParams={{ page_type: "location_page", course_slug: "full-stack", city: "dehradun", variant: "schedule_visit" }}
                >
                  Schedule Campus Visit
                </Button>
              </div>

              {/* Lightweight Map Embed */}
              <div className="mt-6 aspect-video overflow-hidden rounded-xl ring-1 ring-gray-200">
                <iframe
                  title="Doon Coding Academy map (Herbertpur, Dehradun district)"
                  src="https://www.google.com/maps?q=Near+DR+School,+Herbertpur+(Dehradun+district)&output=embed"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="h-full w-full"
                />
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
              
              <div className="mt-6 rounded-lg bg-blue-50 p-4">
                <p className="text-blue-800 text-sm">
                  Explore course pages for current program and fee details, or contact us with questions.
                </p>
                <div className="mt-3 flex gap-3">
                  <Link href="/courses" className="text-sm font-medium text-blue-700 hover:underline">
                    Explore courses
                  </Link>
                  <Link href="/contact" className="text-sm font-medium text-blue-700 hover:underline">
                    Contact us
                  </Link>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Local Lander: Dehradun SEO Block */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Coding Courses in Dehradun
          </h2>

          <p className="text-lg text-gray-700 mb-5">
            At Doon Coding Academy near DR School in Herbertpur, explore Full-Stack, Data Science, Python, and Java course
            options and campus details. On-campus courses are available in Dehradun.
          </p>

          <section className="mt-8">
            <h2 className="text-xl md:text-2xl font-semibold">Service Areas</h2>
            <p className="mt-2 text-gray-700">
              We serve students across {SERVICE_AREAS.slice(0, -1).join(", ")} and {SERVICE_AREAS.at(-1)}.
            </p>
          </section>

          <section className="mt-10">
            <h2 className="text-xl md:text-2xl font-semibold">FAQs (Dehradun)</h2>
            <div className="mt-3 space-y-3">
              {LOCAL_FAQ.map((item) => (
                <details key={item.q} className="rounded-xl border p-4">
                  <summary className="cursor-pointer font-medium">{item.q}</summary>
                  <p className="mt-2 text-gray-700">{item.a}</p>
                </details>
              ))}
            </div>
          </section>

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
                <li>The campus is in Herbertpur, near DR School.</li>
                <li>Contact us for current class schedules.</li>
              </ul>
            </div>

            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Online Course Options</h3>
              <p className="text-gray-700">
                Browse the available online programs and review their course details.
              </p>
              <Link href="/online-courses" className="mt-3 inline-block text-blue-700 hover:underline">
                View online courses
              </Link>
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
              Review our online course options and program details.
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
                    event="lead_contact_click"
                    eventParams={{ channel: "whatsapp", page_type: "location_page", city: "dehradun", course_slug: course.slug }}
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

      {testimonials.length > 0 && (
        <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Learner Experiences
            </h2>
            <p className="text-xl text-gray-600">
              Verified learner experiences shared with permission
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.author} className="p-6">
                <p className="text-gray-700 italic">&quot;{testimonial.text}&quot;</p>
                <p className="mt-4 font-semibold text-gray-900">{testimonial.author}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Explore Coding Courses in Dehradun
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Review the available programs and contact us for current enrollment details.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              href="/contact"
              variant="primary"
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100"
              event="cta_enroll_click"
              eventParams={{ page_type: "location_page", course_slug: "full-stack", city: "dehradun", variant: "visit_campus_footer" }}
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
              event="lead_contact_click"
              eventParams={{ channel: "whatsapp", page_type: "location_page", city: "dehradun" }}
            >
              Enroll Now
            </Button>
          </div>
          
          <div className="mt-8 text-blue-200 text-sm">
            <p>📍 Near DR School, Herbertpur (Dehradun district) | 📞 +91 7037905464</p>
          </div>
        </div>
      </section>

      <script
        id="breadcrumbs-dehradun"
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbs) }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: LOCAL_FAQ.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          }),
        }}
      />
    </main>
  );
}
