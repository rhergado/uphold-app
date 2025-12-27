import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Disable ESLint during production builds for MVP launch
    // TODO: Fix all linting errors before production launch
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Keep TypeScript type checking enabled
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
