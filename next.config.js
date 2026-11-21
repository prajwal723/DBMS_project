/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true
  },
  turbopack: {
    root: __dirname,
  },
  experimental: {
    agentUpgrade: 'security',
  },
};

module.exports = nextConfig;

