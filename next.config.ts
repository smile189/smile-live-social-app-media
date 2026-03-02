/** @type {import('next').NextConfig} */
const nextConfig = {
  // Am scos experimental.appDir pentru că Next.js 16 îl are deja inclus standard
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co', // Permite TOATE pozele din proiectul tău Supabase
      },
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
      {
        protocol: 'https',
        hostname: 'api.dicebear.com', // Pentru avatarele default
      }
    ],
  },
};

module.exports = nextConfig;
