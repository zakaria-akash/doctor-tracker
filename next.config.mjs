/** @type {import('next').NextConfig} */
const nextConfig = {
  // Cache Components streams a static shell; partial prefetching reuses that shell for navigation.
  cacheComponents: true,
  partialPrefetching: true,
  // React Compiler handles component memoization where it is safe to do so.
  reactCompiler: true,
  poweredByHeader: false,
  async redirects() {
    // A temporary redirect leaves room to change the app's default page later.
    return [{ source: "/", destination: "/dashboard", permanent: false }];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          // Nginx should forward streamed Suspense chunks without buffering them.
          { key: "X-Accel-Buffering", value: "no" },
        ],
      },
    ];
  },
  turbopack: {
    rules: {
      // Tailwind v4 is compiled here; adding a PostCSS pass would process it twice.
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
