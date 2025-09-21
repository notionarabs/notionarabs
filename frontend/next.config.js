/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: __dirname,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
    ],
    qualities: [25, 50, 75, 100],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NODE_ENV === 'production'
      ? 'https://notion-arabs.onrender.com/api'
      : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'),
  },
}

module.exports = nextConfig
