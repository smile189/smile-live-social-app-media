/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. Am eliminat experimental.appDir deoarece este activat implicit în v16
  images: {
    // 2. Am înlocuit 'domains' (deprecated) cu 'remotePatterns' (standard modern)
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'commondatastorage.googleapis.com',
      },
    ],
  },
};

module.exports = nextConfig;
