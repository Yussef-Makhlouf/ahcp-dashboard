/** @type {import('next').NextConfig} */
const nextConfig = {
  // إعدادات البيئة
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://ulaahcprp.cloud/api',

  },
  
  // إعدادات CORS محسنة
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT,HEAD' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Cache-Control, Pragma, Expires' },
          { key: 'Access-Control-Expose-Headers', value: 'Content-Length, Content-Type, Content-Disposition' },
          { key: 'Access-Control-Max-Age', value: '86400' },
        ],
      },
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
  
  // إعدادات إضافية محسنة
  reactStrictMode: process.env.NODE_ENV === 'development', // Enable in development, disable in production
  poweredByHeader: false, // إخفاء X-Powered-By header
  
  // Production optimizations
  compress: true,
  productionBrowserSourceMaps: false, // Disable source maps in production for security
  
  // إعدادات Turbopack
  turbopack: {
    root: './',
  },
  
  // تحسين الأداء
  experimental: {
    optimizeCss: true,
  },
  
  // إعدادات الصور
  images: {
    domains: ['localhost', '127.0.0.1'],
    formats: ['image/webp', 'image/avif'],
  },
  
  // إعدادات TypeScript
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // إعدادات ESLint
  eslint: {
    ignoreDuringBuilds: true,
  },
trailingSlash: true,

};

module.exports = nextConfig;
