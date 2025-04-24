import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.travelapi.com',
        port: '', // Keep empty unless a specific port is needed
        pathname: '/lodging/**', // Allow any path under /lodging/
      },
    ],
  },
};

export default nextConfig;
