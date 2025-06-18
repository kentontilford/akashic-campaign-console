/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  swcMinify: true,
  experimental: {
    // Reduce memory usage during builds
    workerThreads: false,
    cpus: 1,
    serverComponentsExternalPackages: ['@prisma/client', 'prisma'],
    // Enable output file tracing for smaller builds
    outputFileTracingRoot: undefined,
  },
  // Disable source maps in production
  productionBrowserSourceMaps: false,
  // Configure module resolution for dynamic imports
  modularizeImports: {
    '@heroicons/react/24/outline': {
      transform: '@heroicons/react/24/outline/{{member}}',
    },
    '@heroicons/react/24/solid': {
      transform: '@heroicons/react/24/solid/{{member}}',
    },
  },
  // Webpack configuration for dynamic imports
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Enable dynamic imports with smaller chunks
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        minSize: 20000,
        maxSize: 244000,
        cacheGroups: {
          default: false,
          vendors: false,
          framework: {
            name: 'framework',
            chunks: 'all',
            test: /[\\/]node_modules[\\/](react|react-dom|next)[\\/]/,
            priority: 40,
            enforce: true,
          },
          commons: {
            name: 'commons',
            minChunks: 2,
            priority: 20,
            maxSize: 244000,
          },
        },
      },
    };
    
    // Add plugins for better memory management
    if (!dev && !isServer) {
      config.plugins.push(
        new webpack.optimize.LimitChunkCountPlugin({
          maxChunks: 30,
        })
      );
    }
    
    return config;
  },
  // Reduce the number of pages built at build time
  generateBuildId: async () => {
    // Use a consistent build ID to improve caching
    return 'akashic-build-001';
  },
}

export default nextConfig