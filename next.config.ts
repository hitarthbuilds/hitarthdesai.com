import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async redirects() {
    return [
      // Canonical host: www → apex, as the Netlify site did.
      { source: "/:path*", has: [{ type: "host", value: "www.hitarthdesai.com" }], destination: "https://hitarthdesai.com/:path*", permanent: true },
    ];
  },
};

export default nextConfig;
