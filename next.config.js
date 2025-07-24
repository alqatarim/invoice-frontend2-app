/** @type {import('next').NextConfig} */
const path = require('path');
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
  webpack: (config) => {
    // merge in custom aliases for Option+Click resolution
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@': path.resolve(__dirname, 'src'),
      '@core': path.resolve(__dirname, 'src/@core'),
      '@layouts': path.resolve(__dirname, 'src/@layouts'),
      '@menu': path.resolve(__dirname, 'src/@menu'),
      '@assets': path.resolve(__dirname, 'src/assets'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@configs': path.resolve(__dirname, 'src/configs'),
      '@views': path.resolve(__dirname, 'src/views'),
      '@reducers': path.resolve(__dirname, 'src/reducers'),
    };
    return config;
  },
  // Add Turbopack configuration
  // experimental: {
  //   turbo: {
  //     rules: {
  //       // Specify any custom Turbopack rules here
  //     },
  //   },
  // },
}

module.exports = nextConfig;
