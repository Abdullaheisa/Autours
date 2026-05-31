/** @type {import('next').NextConfig} */
const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
      { protocol: 'https', hostname: 'i.pravatar.cc', pathname: '/**' },
      { protocol: 'https', hostname: 'www.autours.net', pathname: '/**' },
      { protocol: 'https', hostname: 'via.placeholder.com', pathname: '/**' },
      { protocol: 'http', hostname: '127.0.0.1', port: '8000', pathname: '/**' },
      { protocol: 'http', hostname: 'localhost', port: '8000', pathname: '/**' },
    ],
  },
  // 🚀 إضافة الـ Rewrites لحل مشكلة الـ CORS
  async rewrites() {
    return [
      {
        source: '/api/backend/:path*', // أي طلب بيبدأ بـ /api/backend
        destination: `${backendUrl}/:path*`, // هيتحول للرابط ده في السيرفر بدون إضافة /api/
      },
      {
        source: '/api/external/:path*', // أي طلب بيبدأ بـ /api/external
        destination: `${backendUrl}/api/external/:path*`, // هيتحول للرابط ده في السيرفر مباشرة
      },
    ];
  },
};

module.exports = nextConfig;