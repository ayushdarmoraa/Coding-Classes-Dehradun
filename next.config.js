/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep font optimization on (harmless with system fonts, useful if any webfonts reappear)
  optimizeFonts: true,

  // Experimental CSS optimization to reduce render-blocking by inlining/optimizing critical CSS
  experimental: {
    optimizeCss: true,
  },

  async headers() {
    return [
      {
        source: "/:path*",
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


