/** @type {import('next').NextConfig} */
import withPWA from 'next-pwa';

const withPWACfg = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https" as const,
        hostname: "drive.google.com",
        port: undefined,
        pathname: "/uc/**",
      },
    ],
  },
};

export default withPWACfg(nextConfig);
