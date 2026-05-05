import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: false, // Disable to prevent Supabase navigator.locks double-acquire
  turbopack: {},
  // Force a new build ID so Vercel never serves stale cached bundles
  generateBuildId: async () => `mmi-build-${Date.now()}`,
}

export default nextConfig
