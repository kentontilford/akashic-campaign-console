/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  swcMinify: true,
  experimental: {
    // Reduce memory usage during builds
    workerThreads: false,
    cpus: 1,
    // Reduce memory pressure during builds
    isrMemoryCacheSize: 0,
    serverComponentsExternalPackages: ['@prisma/client', 'prisma'],
  },
  // Disable source maps in production to reduce memory usage
  productionBrowserSourceMaps: false,
  // Reduce webpack memory usage
  webpack: (config, { isServer }) => {
    config.optimization = {
      ...config.optimization,
      // Reduce memory usage during builds
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          commons: {
            name: 'commons',
            chunks: 'all',
            minChunks: 2,
          },
        },
      },
    };
    return config;
  },
}

export default nextConfig