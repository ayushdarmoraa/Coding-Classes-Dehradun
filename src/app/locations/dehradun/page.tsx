import type { Metadata } from "next";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { getCourses } from "@/lib/courses";

export const metadata: Metadata = {
  title: "Best Coding Classes in Dehradun - Doon Coding Academy Herbertpur",
  description: "Top-rated coding classes in Dehradun, Uttarakhand. Learn Full-Stack Development, Data Science, Python & Java at our Herbertpur campus. Expert instructors, job placement assistance.",
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/locations/dehradun`,
  },
  openGraph: {
    title: "Best Coding Classes in Dehradun - Doon Coding Academy",
    description: "Top-rated coding classes in Dehradun, Uttarakhand. Learn Full-Stack Development, Data Science, Python & Java at our Herbertpur campus.",
    url: "/locations/dehradun",
    type: "website",
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
              Transform your career with industry-focused coding education right here in Uttarakhand's capital. 
              Join Dehradun's premier coding academy with proven placement success.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                href="/contact" 
                variant="primary"
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-100"
              >
                Visit Our Campus
              </Button>
              <Button 
                href="https://wa.me/917037905464?text=Hi, I want to visit your Dehradun campus"
                variant="secondary"
                size="lg"
                className="border-white text-white hover:bg-white hover:text-blue-600"
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
                >
                  View on Google Maps
                </Button>
                <Button 
                  href="/contact"
                  variant="secondary"
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
              Industry-focused curriculum designed for Dehradun's growing tech market
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
                "Being a local student, I was looking for quality coding education without leaving Dehradun. 
                Doon Coding Academy provided exactly that. The instructors understand the local job market 
                and prepared me well for interviews with Dehradun-based companies."
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
                "The Data Science course helped me transition from a non-tech background to a rewarding 
                career in analytics. The small batch size meant I got personal attention, and the 
                placement support was excellent for finding opportunities in Dehradun."
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
            Join Dehradun's leading coding academy and become part of Uttarakhand's growing tech ecosystem. 
            Next batch starts soon at our Herbertpur campus!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              href="/contact"
              variant="primary"
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100"
            >
              Visit Our Campus
            </Button>
            <Button 
              href="https://wa.me/917037905464?text=Hi, I want to enroll in coding classes in Dehradun"
              variant="secondary"
              size="lg"
              className="border-white text-white hover:bg-white hover:text-blue-600"
            >
              Enroll Now
            </Button>
          </div>
          
          <div className="mt-8 text-blue-200 text-sm">
            <p>📍 Near DR School, Herbertpur, Dehradun | 📞 +91 7037905464</p>
          </div>
        </div>
      </section>
    </div>
  );
}

