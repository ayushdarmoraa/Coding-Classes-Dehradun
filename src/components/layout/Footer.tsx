/* eslint-disable @next/next/no-html-link-for-pages */
export default function Footer() {
  const phone = process.env.NEXT_PUBLIC_PHONE || "+91 7037905464";
  const email = process.env.CONTACT_EMAIL || "dooncodingacademy@gmail.com";
  const telHref = `tel:${phone.replace(/\s+/g, "")}`;
  const street = process.env.NEXT_PUBLIC_ADDRESS_STREET || "Ambala - Dehradun Rd, near D.R School, Herbertpur";
  const locality = process.env.NEXT_PUBLIC_ADDRESS_LOCALITY || "Dehradun";
  const region = process.env.NEXT_PUBLIC_ADDRESS_REGION || "Uttarakhand";
  const postal = process.env.NEXT_PUBLIC_POSTAL_CODE || "248142";
  return (
    <footer className="bg-gray-900 text-gray-300 py-10 mt-10">
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Brand + Address */}
        <div>
          <h3 className="text-xl font-bold text-white mb-2">Doon Coding Academy</h3>
          <p className="text-sm">
            {street}<br />
            {locality}, {region} {postal}, India
          </p>
          <p className="mt-2 text-sm">
            <a href={telHref} aria-label={`Call us at ${phone}`} className="hover:text-white">📞 {phone}</a>
          </p>
          <p className="text-sm">
            <a href={`mailto:${email}`} aria-label={`Email ${email}`} className="hover:text-white">✉️ {email}</a>
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-lg font-semibold text-white mb-2">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="/about" className="hover:text-white">About</a></li>
            <li><a href="/courses" className="hover:text-white">Courses</a></li>
            <li><a href="/locations" className="hover:text-white">Locations</a></li>
            <li><a href="/blog" className="hover:text-white">Blog</a></li>
            <li><a href="/contact" className="hover:text-white">Contact</a></li>
          </ul>
        </div>

        {/* Socials */}
        <div>
          <h4 className="text-lg font-semibold text-white mb-2">Connect With Us</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="https://wa.me/917037905464" target="_blank" rel="noopener noreferrer" className="hover:text-white" aria-label="Chat on WhatsApp (opens in a new tab)">WhatsApp</a></li>
            <li><a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-white" aria-label="Open Facebook (opens in a new tab)">Facebook</a></li>
            <li><a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-white" aria-label="Open Instagram (opens in a new tab)">Instagram</a></li>
          </ul>
        </div>
      </div>

      {/* GBP Review Link */}
      <div className="mt-4 text-center">
        <a
          href="https://g.page/r/CTASnGJ45opuEBM/review"
          target="_blank"
          rel="noopener noreferrer"
          className="underline text-sm text-gray-600"
        >
          ⭐ Review us on Google
        </a>
      </div>

      {/* Bottom */}
      <div className="mt-8 border-t border-gray-700 pt-4 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} Doon Coding Academy. All rights reserved.
      </div>
    </footer>
  );
}


