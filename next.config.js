/** @type {import('next').NextConfig} */
const nextConfig = {
  // Note: For mobile app, we load from live website (cognaapp.com)
  // so we don't need static export. Reverting to normal Next.js config.
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
}

module.exports = nextConfig
