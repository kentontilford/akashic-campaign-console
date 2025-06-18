/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  swcMinify: true,
  experimental: {
    // Enable incremental cache
    incrementalCacheHandlerPath: require.resolve('./cache-handler.js'),
    // Reduce memory usage during builds
    workerThreads: false,
    cpus: 1,
    serverComponentsExternalPackages: ['@prisma/client', 'prisma'],
  },
  // Disable source maps in production to reduce memory usage
  productionBrowserSourceMaps: false,
  // Enable build cache
  eslint: {
    ignoreDuringBuilds: true, // Skip ESLint during build to save memory
  },
  typescript: {
    ignoreBuildErrors: false, // Keep type checking but optimize it
  },
  // Webpack configuration for caching
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Enable filesystem cache
    config.cache = {
      type: 'filesystem',
      buildDependencies: {
        config: [__filename],
      },
      compression: 'gzip',
      hashAlgorithm: 'md5',
      store: 'pack',
      version: '1.0',
    };
    
    // Optimize for memory usage
    config.optimization = {
      ...config.optimization,
      moduleIds: 'deterministic',
      splitChunks: {
        chunks: 'all',
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
          lib: {
            test: /[\\/]node_modules[\\/]/,
            name: 'lib',
            priority: 30,
            minChunks: 1,
            reuseExistingChunk: true,
          },
          commons: {
            name: 'commons',
            minChunks: 2,
            priority: 20,
          },
        },
      },
    };
    
    return config;
  },
}

export default nextConfig