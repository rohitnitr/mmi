import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: false, // Disable to prevent Supabase navigator.locks double-acquire
  turbopack: {},
}

export default nextConfig
