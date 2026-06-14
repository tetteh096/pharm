import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-XSS-Protection", value: "1; mode=block" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // unsafe-inline/eval needed for Next.js + Turbopack
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data: https://fonts.gstatic.com",
      "connect-src 'self' https:",
      "frame-src 'self' https://www.google.com https://maps.google.com https://www.openstreetmap.org",
      "frame-ancestors 'none'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  reactCompiler: true,

  // Always load the generated client from node_modules (not a stale Turbopack copy in .next).
  serverExternalPackages: ["@prisma/client", "@prisma/adapter-pg", "pg"],

  // Remove the X-Powered-By: Next.js header — no need to advertise the stack
  poweredByHeader: false,

  async headers() {
    // While SEO_BLOCK_INDEX is set, this deployment isn't on the final domain
    // yet — send X-Robots-Tag: noindex on every route so search engines keep
    // the temporary URL out of the index entirely. Remove the env var once the
    // real domain is live. (This header is the authoritative de-index signal;
    // robots.txt disallow alone can still leave URL-only entries indexed.)
    const blockIndex =
      process.env.SEO_BLOCK_INDEX === "1" || process.env.SEO_BLOCK_INDEX === "true";

    const headers = blockIndex
      ? [
          ...securityHeaders,
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ]
      : securityHeaders;

    return [
      {
        // Apply security headers to all routes
        source: "/(.*)",
        headers,
      },
    ];
  },
};

export default nextConfig;
