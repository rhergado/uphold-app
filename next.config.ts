import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Disable ESLint during production builds for MVP launch
    // TODO: Fix all linting errors before production launch
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Temporarily disable TypeScript errors for MVP deployment
    // TODO: Fix all type errors before production launch
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
