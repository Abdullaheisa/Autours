/** @type {import('next').NextConfig} */
const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

const nextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizeCss: true, // 🚀 يمنع الـ Render-blocking للـ CSS
  },
  images: {
    // 🚀 السطر السحري لضغط الصور وتقليل مساحتها لأقصى درجة
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
      { protocol: 'https', hostname: 'i.pravatar.cc', pathname: '/**' },
      { protocol: 'https', hostname: 'www.autours.net', pathname: '/**' },
      { protocol: 'https', hostname: 'api.autours.net', pathname: '/**' },
      { protocol: 'https', hostname: 'autours.net', pathname: '/**' },
      { protocol: 'http', hostname: 'autours.net', pathname: '/**' },
      { protocol: 'https', hostname: 'via.placeholder.com', pathname: '/**' },
      { protocol: 'http', hostname: '127.0.0.1', port: '8000', pathname: '/**' },
      { protocol: 'http', hostname: 'localhost', port: '8000', pathname: '/**' },
      { protocol: 'https', hostname: 'flagcdn.com', pathname: '/**' },
    ],
  },
  // 🚀 إضافة الـ Rewrites لحل مشكلة الـ CORS
  async rewrites() {
    return [
      {
        source: '/sitemap',
        destination: '/sitemap.xml',
      },
      // Rule 1: endpoints that already have /api/ in them (e.g. /api/blogs, /api/auth/login)
      // /api/backend/api/something → backendUrl/api/something  (no double /api/)
      {
        source: '/api/backend/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
      // Rule 2: endpoints WITHOUT /api/ prefix (e.g. /get/locations, /get/countries)
      // /api/backend/get/locations → backendUrl/api/get/locations
      {
        source: '/api/backend/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
      {
        source: '/api/external/:path*', // أي طلب بيبدأ بـ /api/external
        destination: `${backendUrl}/api/external/:path*`, // هيتحول للرابط ده في السيرفر مباشرة
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
