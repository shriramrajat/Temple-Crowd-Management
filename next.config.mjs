/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    turbo: {
      resolveAlias: {
        // Exclude bcryptjs from client bundle in Turbopack
        'bcryptjs': false,
      },
      resolveExtensions: ['.tsx', '.ts', '.jsx', '.js', '.mjs', '.json'],
    },
  },
  webpack: (config, { isServer }) => {
    // Fix for "global is not defined" error in webpack mode
    if (!isServer) {
      // Exclude server-only modules from client bundle
      config.resolve.alias = {
        ...config.resolve.alias,
        'bcryptjs': false,
      };
      
      config.resolve.fallback = {
        ...config.resolve.fallback,
        crypto: false,
        stream: false,
        buffer: false,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
}

export default nextConfig
