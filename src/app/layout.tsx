import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Script from "next/script";

// Build a single, normalized site URL we can reuse everywhere
const rawBase = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
const siteUrl = rawBase.replace(/^http:\/\//, "https://");

export const metadata: Metadata = {
  // Global canonical base for all routes (remains env-driven)
  metadataBase: new URL(siteUrl),

  // ↓ Updated defaults
  title: { default: "DCA – Coding & Data Science Courses", template: "%s | DCA" },
  description:
    process.env.NEXT_PUBLIC_SITE_DESCRIPTION ||
    "Leading coding institute in Dehradun — Full Stack with Gen AI, Data Science, Python, Java.",

  // NEW: Open Graph defaults
  openGraph: {
    type: "website",
    siteName: "Doon Coding Academy",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },

  // NEW: Twitter defaults
  twitter: {
    card: "summary_large_image",
    // creator: "@your_handle" // (optional) add if/when you have one
  },

  // GSC verification (unchanged)
  verification: process.env.NEXT_PUBLIC_GSC_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GSC_VERIFICATION }
    : undefined,

  // IMPORTANT: do NOT set a root-level canonical here.
  // Per-page files can define `alternates.canonical` when needed.
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Header />
        {children}
        <Footer />

        {/* GA4 (gated by env var; no-op if env is missing) */}
        {process.env.NEXT_PUBLIC_GA_ID ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', { anonymize_ip: true, transport_type: 'beacon' });
              `}
            </Script>

            {/* Delegated click tracking for key CTAs: tel, WhatsApp, Directions, Enroll/Consultation */}
            <Script id="ga4-delegated-clicks" strategy="afterInteractive">
              {`
                (function () {
                  function findAnchor(el) {
                    while (el && el !== document.body) {
                      if (el.tagName === 'A') return el;
                      el = el.parentElement;
                    }
                    return null;
                  }
                  function track(type, href, text) {
                    if (!window.gtag) return;
                    window.gtag('event', type, {
                      event_category: 'engagement',
                      link_url: href || '',
                      link_text: (text || '').trim().slice(0, 100)
                    });
                  }
                  document.addEventListener('click', function (e) {
                    var a = findAnchor(e.target);
                    if (!a) return;
                    var href = (a.getAttribute('href') || '').trim();
                    var txt = (a.textContent || a.getAttribute('aria-label') || '').trim();

                    if (href.startsWith('tel:')) {
                      track('tel_click', href, txt); return;
                    }
                    if (href.includes('wa.me') || href.includes('api.whatsapp.com') || href.startsWith('whatsapp:')) {
                      track('whatsapp_click', href, txt); return;
                    }
                    if (href.includes('maps.app.goo.gl') || href.includes('google.com/maps')) {
                      track('directions_click', href, txt); return;
                    }
                    if (href.includes('/contact') || /enroll|consult/i.test(txt)) {
                      track('enroll_click', href, txt); return;
                    }
                  }, true);
                })();
              `}
            </Script>
          </>
        ) : null}

        {/* WebSite + SearchAction (schema.org) */}
        <Script
          id="website-searchaction"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "@id": `${siteUrl.replace(/\/$/, "")}/#website`,
              name: process.env.NEXT_PUBLIC_SITE_NAME || "Doon Coding Academy",
              url: siteUrl,
              potentialAction: {
                "@type": "SearchAction",
                target: `${siteUrl.replace(/\/$/, "")}/blog?q={search_term_string}`,
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />

        {/* Organization (EducationalOrganization) schema.org */}
        <Script
          id="org-schema"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "EducationalOrganization",
              "@id": `${siteUrl.replace(/\/$/, "")}/#organization`,
              name: process.env.NEXT_PUBLIC_SITE_NAME || "Doon Coding Academy",
              url: siteUrl,
              email: "dooncodingacademy@gmail.com",
              foundingDate: "2019-01-01",
              founder: {
                "@type": "Person",
                name: "Ayush Darmora",
                jobTitle: "Founder & Instructor",
              },
              // Social profiles (env-gated, filtered for presence)
              sameAs: [
                process.env.NEXT_PUBLIC_FACEBOOK_URL || undefined,
                process.env.NEXT_PUBLIC_INSTAGRAM_URL || undefined,
                process.env.NEXT_PUBLIC_LINKEDIN_URL || undefined,
                process.env.NEXT_PUBLIC_YOUTUBE_URL || undefined,
              ].filter(Boolean),
              contactPoint: {
                "@type": "ContactPoint",
                telephone: "+917037905464",
                contactType: "customer support",
                areaServed: "IN",
                availableLanguage: ["en", "hi"],
              },
              address: {
                "@type": "PostalAddress",
                streetAddress: "Near DR School, Herbertpur",
                addressLocality: "Dehradun",
                addressRegion: "Uttarakhand",
                postalCode: "248142",
                addressCountry: "IN",
              },
            }),
          }}
        />

        {/* Close mobile menu after navigation / interactions */}
        <Script
          id="close-mobile-menu"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function () {
              function closeMenu() {
                var cb = document.getElementById('nav-toggle');
                if (cb && cb.checked) cb.checked = false;
              }
              document.addEventListener('click', function (e) {
                var el = e.target;
                if (!(el instanceof Element)) return;
                var anchor = el.closest('a');
                if (!anchor) return;
                if (anchor.closest('header') || anchor.closest('#mobile-menu')) closeMenu();
              }, true);
              window.addEventListener('popstate', closeMenu);
              window.addEventListener('hashchange', closeMenu);
              document.addEventListener('keydown', function (e) {
                if (e.key === 'Escape') closeMenu();
              });
            })();`,
          }}
        />

        {/* LocalBusiness JSON-LD for Local SEO */}
    <script
          id="localbusiness-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify((() => {
      // Use the normalized apex siteUrl computed above
      const base = siteUrl.replace(/\/$/, "");
              const sameAs = [
                process.env.NEXT_PUBLIC_FACEBOOK_URL || undefined,
                process.env.NEXT_PUBLIC_INSTAGRAM_URL || undefined,
                process.env.NEXT_PUBLIC_LINKEDIN_URL || undefined,
                process.env.NEXT_PUBLIC_YOUTUBE_URL || undefined,
              ].filter(Boolean);

              return {
                "@context": "https://schema.org",
                "@type": "LocalBusiness",
                "@id": `${base}/#localbusiness`,
                name: "Doon Coding Academy",
                url: base,
                image: [`${base}/images/Doon-Coding-Academy-Logo.png`],
                ...(sameAs.length ? { sameAs } : {}),
                telephone: process.env.NEXT_PUBLIC_CONTACT_PHONE || "+917037905464",
                email: "dooncodingacademy@gmail.com",
                hasMap: process.env.NEXT_PUBLIC_GBP_URL || "https://maps.app.goo.gl/Rj1U1jwERHwkfB8Y9",
                priceRange: "₹2000–₹30000",
                paymentAccepted: "Cash, UPI, Debit Card, Credit Card, Net Banking, Wallets (Paytm, PhonePe, GPay), EMI",
                address: {
                  "@type": "PostalAddress",
                  streetAddress: "Near DR School, Herbertpur",
                  addressLocality: "Dehradun",
                  addressRegion: "Uttarakhand",
                  postalCode: "248142",
                  addressCountry: "IN"
                },
                areaServed: [
                  { "@type": "Place", "name": "Dakpathar" },
                  { "@type": "Place", "name": "Herbertpur" },
                  { "@type": "Place", "name": "Paonta-Sahib" },
                  { "@type": "Place", "name": "Vikasnagar" },
                  { "@type": "Place", "name": "Sehespur" },
                  { "@type": "Place", "name": "Selaqui" },
                  { "@type": "Place", "name": "Suddhowala" },
                  { "@type": "Place", "name": "Premnagar" },
                  { "@type": "City",  "name": "Dehradun" }
                ],
                openingHoursSpecification: [
                  {
                    "@type": "OpeningHoursSpecification",
                    dayOfWeek: ["Wednesday","Thursday","Friday","Saturday","Sunday"],
                    opens: "10:00",
                    closes: "19:00"
                  }
                ],
                foundingDate: "2019",
                founder: {
                  "@type": "Person",
                  name: "Ayush Darmora",
                  jobTitle: "Founder & Instructor"
                },
                knowsAbout: [
                  "Full-Stack Development",
                  "Gen AI",
                  "Data Science",
                  "Python",
                  "Java",
                  "Coding Classes in Dehradun"
                ]
              };
            })())
          }}
        />
      </body>
    </html>
  );
}
