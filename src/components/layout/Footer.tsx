import Link from "next/link";
import { getPublishedProjects } from "@/lib/projects";
import { SITE } from "@/lib/site-config";

export default function Footer() {
  const projectsAvailable = getPublishedProjects().length > 0;
  const phone = SITE.phone;
  const email = SITE.email;
  const telHref = `tel:${phone.replace(/\s+/g, "")}`;
  const street = process.env.NEXT_PUBLIC_ADDRESS_STREET || "Ambala - Dehradun Rd, near D.R School, Herbertpur";
  const locality = process.env.NEXT_PUBLIC_ADDRESS_LOCALITY || "Dehradun";
  const region = process.env.NEXT_PUBLIC_ADDRESS_REGION || "Uttarakhand";
  const postal = process.env.NEXT_PUBLIC_POSTAL_CODE || "248142";

  return (
    <footer className="dca-footer mt-10 border-t border-brand-soft text-ink-2">
      <div className="container py-12 md:py-14">
        <div className="dca-footer__grid">
          <div className="dca-footer__brand">
            <p className="font-display text-xl font-bold text-ink">Doon Coding Academy</p>
            <p className="mt-2 text-sm leading-6 text-ink-2">
              Learn. Debug. Build. Prove.
            </p>
          </div>

          <nav aria-label="Footer navigation" className="dca-footer__links">
          <section aria-labelledby="footer-learn">
            <h2 id="footer-learn" className="dca-footer__heading">Learn</h2>
            <ul className="mt-4 space-y-3 text-sm">
              <li><Link href="/courses" className="dca-footer__link">Courses</Link></li>
              <li><Link href="/online-courses" className="dca-footer__link">Online Courses</Link></li>
              <li><Link href="/lab" className="dca-footer__link">DCA Lab</Link></li>
            </ul>
          </section>

          <section aria-labelledby="footer-resources">
            <h2 id="footer-resources" className="dca-footer__heading">Resources</h2>
            <ul className="mt-4 space-y-3 text-sm">
              <li><Link href="/blog" className="dca-footer__link">Guides</Link></li>
              {projectsAvailable && (
                <li><Link href="/projects" className="dca-footer__link">Projects</Link></li>
              )}
              <li><Link href="/faq" className="dca-footer__link">FAQ</Link></li>
            </ul>
          </section>

          <section aria-labelledby="footer-academy">
            <h2 id="footer-academy" className="dca-footer__heading">Academy</h2>
            <ul className="mt-4 space-y-3 text-sm">
              <li><Link href="/about" className="dca-footer__link">About</Link></li>
              <li><Link href="/locations/dehradun" className="dca-footer__link">Dehradun Campus</Link></li>
              <li><Link href="/contact" className="dca-footer__link">Contact</Link></li>
            </ul>
            <address className="mt-5 text-sm not-italic leading-6 text-ink-2">
              {street}<br />
              {locality}, {region} {postal}, India
            </address>
          </section>

          <section aria-labelledby="footer-connect">
            <h2 id="footer-connect" className="dca-footer__heading">Connect</h2>
            <ul className="mt-4 space-y-3 text-sm">
              <li><a href={SITE.whatsappUrl} target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp (opens in a new tab)" className="dca-footer__link">WhatsApp</a></li>
              <li><a href={telHref} aria-label={`Call us at ${phone}`} className="dca-footer__link">{phone}</a></li>
              <li><a href={`mailto:${email}`} aria-label={`Email ${email}`} className="dca-footer__link">{email}</a></li>
            </ul>
          </section>
          </nav>
        </div>

      </div>
      <div className="dca-footer__waveband">
        <div className="dca-footer__wave-drift dca-footer__wave-drift--bob">
          <svg className="dca-footer__wave dca-footer__wave--back" viewBox="0 0 2880 160" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <linearGradient id="footer-wave-back" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#0A1A38" />
                <stop offset="52%" stopColor="#5B21B6" />
                <stop offset="100%" stopColor="#2F7BF0" />
              </linearGradient>
            </defs>
            <path d="M0 80 C240 10 480 150 720 80 S1200 150 1440 80 S1920 150 2160 80 S2640 150 2880 80 V160 H0 Z" fill="url(#footer-wave-back)" />
          </svg>
        </div>
        <div className="dca-footer__wave-drift">
          <svg className="dca-footer__wave dca-footer__wave--middle" viewBox="0 0 2880 160" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <linearGradient id="footer-wave-middle" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#0A1A38" />
                <stop offset="52%" stopColor="#5B21B6" />
                <stop offset="100%" stopColor="#2F7BF0" />
              </linearGradient>
            </defs>
            <path d="M0 80 C240 10 480 150 720 80 S1200 150 1440 80 S1920 150 2160 80 S2640 150 2880 80 V160 H0 Z" fill="url(#footer-wave-middle)" />
          </svg>
        </div>
        <div className="dca-footer__wave-drift">
          <svg className="dca-footer__wave dca-footer__wave--front" viewBox="0 0 2880 160" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <linearGradient id="footer-wave-front" x1="1" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0A1A38" />
                <stop offset="52%" stopColor="#5B21B6" />
                <stop offset="100%" stopColor="#2F7BF0" />
              </linearGradient>
            </defs>
            <path d="M0 80 C240 10 480 150 720 80 S1200 150 1440 80 S1920 150 2160 80 S2640 150 2880 80 V160 H0 Z" fill="url(#footer-wave-front)" />
          </svg>
        </div>
        <div className="dca-footer__wave-content">
          <a
            href="https://g.page/r/CTASnGJ45opuEBM/review"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-white underline underline-offset-4 hover:text-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            Review us on Google
          </a>
          <p className="mt-3 text-sm text-white">
            © {new Date().getFullYear()} Doon Coding Academy. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
