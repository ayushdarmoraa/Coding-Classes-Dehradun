/** @type {import("next").NextConfig} */
const nextConfig = {
  images: {
    formats: ["image/webp", "image/avif"],
    minimumCacheTTL: 31536000, // 1 year
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },

  async redirects() {
    return [
  // Force HTTPS on apex (www handled at edge via vercel.json)
      {
        source: "/:path*",
        has: [{ type: "header", key: "x-forwarded-proto", value: "http" }],
        destination: "https://dooncodingacademy.in/:path*",
        statusCode: 301,
      },
    ];
  },

  compress: true,
};

module.exports = nextConfig;


