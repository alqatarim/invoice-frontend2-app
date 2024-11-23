/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    // domains: ['example.com'],
    domains: ['localhost'],
    formats: ['image/webp']

  },
  async rewrites() {
    return []
  },
  // Add Turbopack configuration
  experimental: {
    turbo: {
      rules: {
        // Specify any custom Turbopack rules here
      },
    },
  },
}

module.exports = nextConfig;
