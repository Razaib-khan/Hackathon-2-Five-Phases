/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,

  // Export static HTML for GitHub Pages
  output: 'export',

  // Base path for GitHub Pages (repository name)
  basePath: '/Hackathon-2-Five-Phases',

  // Environment variables available to the client
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  },

  // Experimental features (Next.js 15+)
  experimental: {
    // Enable server actions for form handling
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },

  // Disable server-side rendering for static export
  trailingSlash: true,
  images: {
    unoptimized: true, // Required for GitHub Pages
  },
}

module.exports = nextConfig
