import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Script from "next/script";
import { Inter, Poppins } from "next/font/google";

// Self-hosted Google Fonts via next/font (preloaded; font-display: swap)
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "600", "700"], // Only Regular, Semi-bold, Bold
  variable: "--font-inter",
});
const poppins = Poppins({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "600", "700"], // Only Regular, Semi-bold, Bold
  variable: "--font-poppins",
});

// Build a single, normalized site URL we can reuse everywhere (force https, strip trailing slash, drop www)
const rawBase = (process.env.NEXT_PUBLIC_SITE_URL || "https://dooncodingacademy.in").replace(/\/$/, "");
const siteUrl = rawBase
  .replace(/^http:\/\//, "https://")
  .replace(/^https:\/\/www\./, "https://");

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
  images: [{ url: "/images/og-image.png", width: 1200, height: 630 }],
  },

  // NEW: Twitter defaults
  twitter: {
    card: "summary_large_image",
  images: ["/images/og-image.png"],
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
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <head>
        {/* Fonts are self-hosted via next/font - NO preconnect needed */}
      </head>
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

            {/* GA4 delegated click tracking (normalized) */}
            <Script id="ga4-delegated-clicks" strategy="afterInteractive">
              {`
                (function () {
                  function gtagSafe() {
                    if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
                    window.gtag.apply(null, arguments);
                  }

                  function pageTypeFromPath(path) {
                    if (path === '/' || path === '') return 'home';
                    if (path.startsWith('/online-courses/')) return 'online_course';
                    if (path === '/online-courses') return 'online_course';
                    if (path.startsWith('/courses/')) return 'course';
                    if (path === '/courses') return 'course';
                    if (path.startsWith('/blog/')) return 'blog';
                    if (path === '/blog') return 'blog';
                    if (path.startsWith('/vs/')) return 'vs';
                    if (path.startsWith('/locations/')) return 'locations';
                    return 'home';
                  }

                  function courseSlugFromPath(path) {
                    // /courses/[slug] OR /online-courses/[slug]
                    var m = path.match(/^\/(?:online-courses|courses)\/([^\/]+)/);
                    return m ? m[1] : undefined;
                  }

                  function cityFromPath(path) {
                    // Dehradun for onsite pages and the location page
                    if (path.startsWith('/locations/dehradun')) return 'Dehradun';
                    if (path.startsWith('/courses/')) return 'Dehradun'; // onsite courses
                    return undefined; // online and others
                  }

                  function isTel(href) {
                    return href && href.toLowerCase().startsWith('tel:');
                  }
                  function isWhatsApp(href) {
                    if (!href) return false;
                    var h = href.toLowerCase();
                    return h.includes('wa.me') || h.includes('api.whatsapp.com') || h.startsWith('whatsapp:');
                  }
                  function isDirections(href) {
                    if (!href) return false;
                    var h = href.toLowerCase();
                    return h.includes('maps.app.goo.gl') || h.includes('google.com/maps');
                  }
                  function isEnroll(anchor) {
                    if (!anchor) return false;
                    var href = (anchor.getAttribute('href') || '').toLowerCase();
                    if (href.startsWith('/contact')) return true;
                    var txt = (anchor.textContent || '').toLowerCase();
                    return /enroll|consult/.test(txt);
                  }

                  function paramsBase() {
                    var path = (location && location.pathname) || '/';
                    return {
                      page_type: pageTypeFromPath(path),
                      course_slug: courseSlugFromPath(path),
                      city: cityFromPath(path)
                    };
                  }

                  // Remove previous listener if hot reloading
                  if (window.__ga4DelegatedClickHandler) {
                    document.removeEventListener('click', window.__ga4DelegatedClickHandler, true);
                  }

                  window.__ga4DelegatedClickHandler = function (e) {
                    try {
                      var el = e.target;
                      // Find closest anchor
                      var a = el && (el.closest ? el.closest('a') : null);
                      if (!a) return;

                      var href = a.getAttribute('href') || '';

                      // Precedence: tel -> whatsapp -> directions -> enroll
                      var base = paramsBase();

                      if (isTel(href)) {
                        gtagSafe('event', 'lead_contact_click', Object.assign({ channel: 'phone' }, base));
                        return;
                      }

                      if (isWhatsApp(href)) {
                        gtagSafe('event', 'lead_contact_click', Object.assign({ channel: 'whatsapp' }, base));
                        return;
                      }

                      if (isDirections(href)) {
                        gtagSafe('event', 'lead_contact_click', Object.assign({ channel: 'directions' }, base));
                        return;
                      }

                      if (isEnroll(a)) {
                        gtagSafe('event', 'cta_enroll_click', base);
                        return;
                      }
                    } catch (_) {}
                  };

                  document.addEventListener('click', window.__ga4DelegatedClickHandler, true);
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

        {/* Close mobile menu after navigation / interactions (guarded, passive) */}
        <Script
          id="close-mobile-menu"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function () {
              try {
                function closeMenu() {
                  var cb = document.getElementById('nav-toggle');
                  if (cb && 'checked' in cb && cb.checked) cb.checked = false;
                }
                function onDocClick(e) {
                  var el = e.target;
                  if (!(el instanceof Element)) return;
                  var anchor = el.closest && el.closest('a');
                  if (!anchor) return;
                  if (anchor.closest('header') || anchor.closest('#mobile-menu')) closeMenu();
                }
                document.addEventListener('click', onDocClick, { capture: true, passive: true });
                window.addEventListener('popstate', closeMenu);
                window.addEventListener('hashchange', closeMenu);
                document.addEventListener('keydown', function (e) {
                  if (e.key === 'Escape') closeMenu();
                });
              } catch (_) {}
            })();`,
          }}
        />

        {/* LocalBusiness JSON-LD for Local SEO (non-blocking) */}
        <Script
          id="localbusiness-schema"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify((() => {
              const base = siteUrl.replace(/\/$/, "");
              const sameAs = [
                process.env.NEXT_PUBLIC_FACEBOOK_URL || undefined,
                process.env.NEXT_PUBLIC_INSTAGRAM_URL || undefined,
                process.env.NEXT_PUBLIC_LINKEDIN_URL || undefined,
                process.env.NEXT_PUBLIC_YOUTUBE_URL || undefined,
              ].filter(Boolean);
              // Ensure key profiles are always present
              const staticProfiles = [
                'https://instagram.com/dooncodingacademy/',
                'https://maps.app.goo.gl/zCsj8wk4CCttrune6'
              ];
              for (const profile of staticProfiles) {
                if (!sameAs.includes(profile)) sameAs.push(profile);
              }
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
                    dayOfWeek: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
                    opens: "09:30",
                    closes: "18:30"
                  }
                ],
                foundingDate: "2019",
                founder: {
                  "@type": "Person",
                  name: "Ayush Darmora",
                  jobTitle: "Founder & Instructor"
                },
                geo: {
                  "@type": "GeoCoordinates",
                  latitude: 30.43859,
                  longitude: 77.74087
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
