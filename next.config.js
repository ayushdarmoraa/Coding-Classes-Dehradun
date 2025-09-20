/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep font optimization on (harmless with system fonts, useful if any webfonts reappear)
  optimizeFonts: true,

  // Experimental CSS optimization to reduce render-blocking by inlining/optimizing critical CSS
  experimental: {
    optimizeCss: true,
  },

  // Prefer modern image formats where available
  images: {
    formats: ["image/avif", "image/webp"],
  },

  async headers() {
    return [
      // Long-term cache for Next.js build assets
      {
        source: "/_next/static/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      // Cache optimized images
      {
        source: "/_next/image",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      // Cache public images (if updated, filenames should change)
      {
        source: "/images/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      // Optionally cache other static assets
      {
        source: "/favicon.ico",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
  async redirects() {
    return [];
  },
};

export default nextConfig;


