/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  eslint: {
    // TODO: Address all ESLint issues to enable ESLint checks during build.
    // Temporarily disable ESLint during builds to fix deployment.
    // Run `npm run lint` to see issues.
    ignoreDuringBuilds: true,
  },
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'prisma'],
    outputFileTracingIncludes: {
      '/api/**/*': ['./node_modules/@prisma/client/**/*'],
    },
  },
  // Image optimization for Vercel
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Vercel-specific optimizations
  poweredByHeader: false,
  compress: true,

  // Optional: Further memory optimization for builds if NODE_OPTIONS is not enough.
  // Uncomment and adjust as needed.
  // productionBrowserSourceMaps: false, // Reduces memory by not generating browser source maps
  // experimental: {
  //   ...nextConfig.experimental, // Preserve other experimental flags
  //   cpus: 2, // Limits the number of CPUs Next.js build can use. Adjust based on your build environment.
  // },
}

export default nextConfig