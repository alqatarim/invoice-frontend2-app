/** @type {import('next').NextConfig} */
const path = require('path');
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['localhost'],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  async rewrites() {
    return []
  },
  experimental: {
    // Minimal Turbopack configuration
    turbo: {
      resolveAlias: {
        '@': path.resolve(__dirname, 'src'),
        '@core': path.resolve(__dirname, 'src/@core'),
        '@layouts': path.resolve(__dirname, 'src/@layouts'),
        '@menu': path.resolve(__dirname, 'src/@menu'),
        '@assets': path.resolve(__dirname, 'src/assets'),
        '@components': path.resolve(__dirname, 'src/components'),
        '@configs': path.resolve(__dirname, 'src/configs'),
        '@views': path.resolve(__dirname, 'src/views'),
        '@reducers': path.resolve(__dirname, 'src/reducers'),
      },
    },
    // Optimize package imports
    optimizePackageImports: ['@mui/material', '@mui/icons-material', '@iconify/react'],
  },
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Only apply webpack config when NOT using Turbopack
    if (process.env.TURBOPACK) {
      return config;
    }

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

    // Development optimizations
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: /node_modules/,
      };
    }

    // Performance optimizations
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: 10,
            chunks: 'all',
          },
          mui: {
            test: /[\\/]node_modules[\\/]@mui[\\/]/,
            name: 'mui',
            priority: 20,
            chunks: 'all',
          },
          apex: {
            test: /[\\/]node_modules[\\/](react-apexcharts|apexcharts)[\\/]/,
            name: 'apex-charts',
            priority: 20,
            chunks: 'all',
          },
        },
      },
    };

    return config;
  },
  // Compiler optimizations (disabled for Turbopack compatibility)
  // compiler: {
  //   removeConsole: process.env.NODE_ENV === 'production',
  // },
  // Output optimizations
  output: 'standalone',
}

module.exports = nextConfig;
