import Link from "next/link";

export default function Footer() {
  const phone = process.env.NEXT_PUBLIC_PHONE || "+91 7037905464";
  const email = process.env.CONTACT_EMAIL || "dooncodingacademy@gmail.com";
  const telHref = `tel:${phone.replace(/\s+/g, "")}`;
  const street = process.env.NEXT_PUBLIC_ADDRESS_STREET || "Ambala - Dehradun Rd, near D.R School, Herbertpur";
  const locality = process.env.NEXT_PUBLIC_ADDRESS_LOCALITY || "Dehradun";
  const region = process.env.NEXT_PUBLIC_ADDRESS_REGION || "Uttarakhand";
  const postal = process.env.NEXT_PUBLIC_POSTAL_CODE || "248142";

  return (
    <footer className="mt-10 bg-gray-950 text-gray-300">
      <div className="container mx-auto px-6 py-10">
        <div className="mb-8 max-w-xl">
          <p className="text-xl font-bold text-white">Doon Coding Academy</p>
          <p className="mt-2 text-sm leading-6 text-gray-400">
            Learn. Debug. Build. Prove.
          </p>
        </div>

        <nav aria-label="Footer navigation" className="grid grid-cols-1 gap-8 border-t border-gray-800 pt-8 sm:grid-cols-2 lg:grid-cols-4">
          <section aria-labelledby="footer-learn">
            <h2 id="footer-learn" className="text-sm font-semibold uppercase tracking-wide text-white">Learn</h2>
            <ul className="mt-4 space-y-3 text-sm">
              <li><Link href="/courses" className="hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">Courses</Link></li>
              <li><Link href="/online-courses" className="hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">Online Courses</Link></li>
              <li><Link href="/lab" className="hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">DCA Lab</Link></li>
            </ul>
          </section>

          <section aria-labelledby="footer-resources">
            <h2 id="footer-resources" className="text-sm font-semibold uppercase tracking-wide text-white">Resources</h2>
            <ul className="mt-4 space-y-3 text-sm">
              <li><Link href="/blog" className="hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">Guides</Link></li>
              <li><Link href="/faq" className="hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">FAQ</Link></li>
            </ul>
          </section>

          <section aria-labelledby="footer-academy">
            <h2 id="footer-academy" className="text-sm font-semibold uppercase tracking-wide text-white">Academy</h2>
            <ul className="mt-4 space-y-3 text-sm">
              <li><Link href="/about" className="hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">About</Link></li>
              <li><Link href="/locations/dehradun" className="hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">Dehradun Campus</Link></li>
              <li><Link href="/contact" className="hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">Contact</Link></li>
            </ul>
            <address className="mt-5 text-sm not-italic leading-6 text-gray-400">
              {street}<br />
              {locality}, {region} {postal}, India
            </address>
          </section>

          <section aria-labelledby="footer-connect">
            <h2 id="footer-connect" className="text-sm font-semibold uppercase tracking-wide text-white">Connect</h2>
            <ul className="mt-4 space-y-3 text-sm">
              <li><a href="https://wa.me/917037905464" target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp (opens in a new tab)" className="hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">WhatsApp</a></li>
              <li><a href={telHref} aria-label={`Call us at ${phone}`} className="hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">{phone}</a></li>
              <li><a href={`mailto:${email}`} aria-label={`Email ${email}`} className="hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">{email}</a></li>
            </ul>
          </section>
        </nav>

        <div className="mt-8 border-t border-gray-800 pt-6 text-center">
          <a
            href="https://g.page/r/CTASnGJ45opuEBM/review"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-300 underline hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          >
            Review us on Google
          </a>
          <p className="mt-4 text-sm text-gray-400">
            © {new Date().getFullYear()} Doon Coding Academy. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
