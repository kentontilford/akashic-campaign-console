/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  swcMinify: true,
  experimental: {
    // Reduce memory usage during builds
    workerThreads: false,
    cpus: 1,
  },
  // Disable source maps in production to reduce memory usage
  productionBrowserSourceMaps: false,
}

export default nextConfig