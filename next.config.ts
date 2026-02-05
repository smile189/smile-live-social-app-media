/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: [
      "images.pexels.com",
      "images.unsplash.com",
      "commondatastorage.googleapis.com",
    ],
  },
};

module.exports = nextConfig;
