import type { Metadata } from "next";
import "./globals.css";
import HeaderClient from "@/components/layout/HeaderClient";
import Footer from "@/components/layout/Footer";
import Script from "next/script";
import { getCourses } from "@/lib/courses";
import { formatINR } from "@/lib/pricing";
import { PUBLISHED_LAB_ANALYTICS_METADATA } from "@/lib/lab/analytics-metadata";
import { Figtree, JetBrains_Mono, Outfit } from "next/font/google";
import MotionProvider from "@/components/motion/MotionProvider";
import FloatingWhatsApp from "@/components/layout/FloatingWhatsApp";
import StickyCtaBar from "@/components/layout/StickyCtaBar";
import RevealOnScroll from "@/components/motion/RevealOnScroll";

const outfit = Outfit({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-outfit",
});
const figtree = Figtree({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-figtree",
});
const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains-mono",
});

const PUBLISHED_LAB_PATHS = PUBLISHED_LAB_ANALYTICS_METADATA.map(
  ({ track, slug }) => `/lab/${track}/${slug}`,
);

// Using system fonts for maximum performance

// Site-wide metadata: force https + non-www canonical via metadataBase, standardize brand
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://dooncodingacademy.in").replace(/\/$/, "").replace(/^http:\/\//, "https://").replace(/^https:\/\/www\./, "https://");
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "Doon Coding Academy";
const SITE_DESC =
  process.env.NEXT_PUBLIC_SITE_DESCRIPTION ||
  "Leading coding institute in Dehradun – Full Stack with Gen AI, Data Science, Python, Java.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESC,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESC,
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESC,
  },
  verification: process.env.NEXT_PUBLIC_GSC_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GSC_VERIFICATION }
    : undefined,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${figtree.variable} ${jetBrainsMono.variable}`}
    >
      <head>
      </head>
      <body className="font-sans">
        <MotionProvider>
          <HeaderClient />
          {children}
          <Footer />
          <FloatingWhatsApp />
          <StickyCtaBar />
          <RevealOnScroll />
        </MotionProvider>

        {/* GA4 (gated by env var; no-op if env is missing) */}
        {process.env.NEXT_PUBLIC_GA_ID ? (
          <>
            <Script id="ga4-loader" strategy="afterInteractive">
              {`
                // Load GA on browser idle (with fallback) to avoid competing with LCP
                (function(){
                  function loadGA(){
                    try {
                      var s = document.createElement('script');
                      s.async = true;
                      s.src = 'https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}';
                      (document.body || document.head || document.documentElement).appendChild(s);
                    } catch(_) {}
                  }
                  if ('requestIdleCallback' in window) {
                    try { (window as any).requestIdleCallback(loadGA, { timeout: 4000 }); } catch (_) { setTimeout(loadGA, 3000); }
                  } else {
                    setTimeout(loadGA, 3000);
                  }
                })();
              `}
            </Script>
            <Script id="ga4-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                // Initialize GA slightly later to align with loader timing
                setTimeout(function(){
                  try {
                    gtag('js', new Date());
                    gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', { anonymize_ip: true, transport_type: 'beacon' });
                  } catch(_) {}
                }, 3200);
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
                    var normalizedLabPath = path.replace(/\/+$/, '') || '/';
                    if (normalizedLabPath === '/lab') return 'lab_index';
                    if (publishedLabPaths.indexOf(normalizedLabPath) !== -1) return 'lab_challenge';
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

                  var publishedLabPaths = ${JSON.stringify(PUBLISHED_LAB_PATHS)};

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
                      if (a.getAttribute('data-event')) return;

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
              "@id": `${SITE_URL.replace(/\/$/, "")}/#website`,
              name: process.env.NEXT_PUBLIC_SITE_NAME || "Doon Coding Academy",
              url: SITE_URL,
              potentialAction: {
                "@type": "SearchAction",
                target: `${SITE_URL.replace(/\/$/, "")}/blog?q={search_term_string}`,
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
              "@id": `${SITE_URL.replace(/\/$/, "")}/#organization`,
              name: process.env.NEXT_PUBLIC_SITE_NAME || "Doon Coding Academy",
              url: SITE_URL,
              email: "dooncodingacademy@gmail.com",
              foundingDate: "2019-01-01",
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
              const base = SITE_URL.replace(/\/$/, "");
              const coursePrices = getCourses().map((course) => course.pricing.packageRate);
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
                telephone: process.env.NEXT_PUBLIC_PHONE ? `+${process.env.NEXT_PUBLIC_PHONE.replace(/\D/g, '')}` : "+917037905464",
                email: process.env.CONTACT_EMAIL || "dooncodingacademy@gmail.com",
                hasMap: process.env.NEXT_PUBLIC_GBP_URL || "https://maps.app.goo.gl/Rj1U1jwERHwkfB8Y9",
                priceRange: `${formatINR(Math.min(...coursePrices))}–${formatINR(Math.max(...coursePrices))}`,
                paymentAccepted: "Cash, UPI, Debit Card, Credit Card, Net Banking, Wallets (Paytm, PhonePe, GPay), EMI",
                address: {
                  "@type": "PostalAddress",
                  streetAddress: process.env.NEXT_PUBLIC_ADDRESS_STREET || "Ambala - Dehradun Rd, near D.R School, Herbertpur",
                  addressLocality: process.env.NEXT_PUBLIC_ADDRESS_LOCALITY || "Dehradun",
                  addressRegion: process.env.NEXT_PUBLIC_ADDRESS_REGION || "Uttarakhand",
                  postalCode: process.env.NEXT_PUBLIC_POSTAL_CODE || "248142",
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
