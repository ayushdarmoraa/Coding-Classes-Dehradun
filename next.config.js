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
      // 1) Collapse any www (http or https) to apex HTTPS in a single hop
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.dooncodingacademy.in" }],
        destination: "https://dooncodingacademy.in/:path*",
        statusCode: 301,
      },
      // 2) Force HTTPS on apex
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


