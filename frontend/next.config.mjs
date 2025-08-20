/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export async function rewrites() {
  return [{ source: '/api/:path*', destination: process.env.API_PROXY_TARGET ?? 'http://api:8000/api/:path*' }];
}

export default nextConfig
