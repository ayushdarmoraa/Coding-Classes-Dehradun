/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable font optimization (noop for next/font, but keeps Google Fonts link optimization on if present)
  optimizeFonts: true,

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


