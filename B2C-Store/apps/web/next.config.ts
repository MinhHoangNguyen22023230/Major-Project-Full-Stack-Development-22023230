import type { NextConfig } from "next";

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'iili.io', // Allow images from iili.io
        port: '', // No specific port
        pathname: '/**', // Allow all paths under this hostname
      },
    ],
  },
};
export default nextConfig;
