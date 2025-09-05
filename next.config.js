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
  // ✅ Add redirects to enforce single host + https
  async redirects() {
    return [
      // Force www -> non-www
      {
        source: "/:path*",
        has: [
          { type: "header", key: "host", value: "www\\.dooncodingacademy\\.in" },
        ],
        destination: "https://dooncodingacademy.in/:path*",
        permanent: true,
      },
      // Optional: ensure http -> https
      {
        source: "/:path*",
        has: [
          { type: "header", key: "x-forwarded-proto", value: "http" },
        ],
        destination: "https://dooncodingacademy.in/:path*",
        permanent: true,
      },
    ];
  },

  // ADD THIS BLOCK
  async redirects() {
    return [
      // www → non-www
      {
        source: "/:path*",
        has: [{ type: "header", key: "host", value: "www\\.dooncodingacademy\\.in" }],
        destination: "https://dooncodingacademy.in/:path*",
        permanent: true,
      },
      // http → https (belt-and-suspenders)
      {
        source: "/:path*",
        has: [{ type: "header", key: "x-forwarded-proto", value: "http" }],
        destination: "https://dooncodingacademy.in/:path*",
        permanent: true,
      },
    ];
  },

  compress: true,
};

module.exports = nextConfig;


