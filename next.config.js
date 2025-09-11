/** @type {import('next').NextConfig} */
const nextConfig = {
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
    // Empty on purpose: www→apex is handled at the edge via vercel.json
    // Vercel enforces apex http→https (308).
    return [];
  },
};

export default nextConfig;


