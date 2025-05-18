const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'b2cstorage.s3.ap-southeast-2.amazonaws.com',
        port: '',
        pathname: '/**', // Allow all paths under this hostname
      },
    ],
  },
};
export default nextConfig;
