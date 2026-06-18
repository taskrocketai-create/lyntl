import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'lyntl.taskrocket.org', 'lyntl.com'],
    },
  },
}

export default nextConfig
