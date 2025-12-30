/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,

  // Environment variables available to the client
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  },

  // GitHub Pages configuration for static export
  output: process.env.GITHUB_PAGES ? 'export' : 'standalone',
  basePath: process.env.GITHUB_PAGES ? '/Hackathon-2-Five-Phases' : '',
  trailingSlash: true,

  // Image optimization for static export
  images: {
    unoptimized: process.env.GITHUB_PAGES ? true : false,
  },

  // Experimental features (Next.js 15+)
  experimental: {
    // Enable server actions for form handling
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
}

module.exports = nextConfig