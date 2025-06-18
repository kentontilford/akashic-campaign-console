/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  output: 'standalone',
  swcMinify: false, // Disable SWC minification
  compress: false, // Disable compression
  optimizeFonts: false, // Disable font optimization
  images: {
    unoptimized: true, // Disable image optimization
  },
  experimental: {
    workerThreads: false,
    cpus: 1,
    serverComponentsExternalPackages: ['@prisma/client', 'prisma'],
  },
  productionBrowserSourceMaps: false,
  poweredByHeader: false,
  generateEtags: false,
  webpack: (config, { isServer, dev }) => {
    // Disable all webpack optimizations for production build
    if (!dev) {
      config.optimization = {
        minimize: false, // Disable minification
        splitChunks: false, // Disable code splitting
        runtimeChunk: false,
        usedExports: false,
        sideEffects: false,
      };
      
      // Reduce parallelism
      config.parallelism = 1;
      
      // Disable caching
      config.cache = false;
    }
    
    return config;
  },
}

export default nextConfig