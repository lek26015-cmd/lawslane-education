import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // placehold.co เสิร์ฟ placeholder เป็น SVG จึงยังต้องเปิดไว้
    // แต่ต้องคู่กับ 2 ค่าด้านล่างเสมอ ไม่งั้น SVG ที่ถูกอัปโหลดมาจะรันสคริปต์ได้
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: '*.firebasestorage.app',
      }
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          // CSP เริ่มที่โหมด Report-Only ก่อน เพื่อให้เก็บ violation จากการใช้งานจริง
          // ได้ก่อนบังคับใช้ — เมื่อยืนยันว่าไม่มีอะไรพัง ให้เปลี่ยน key เป็น
          // 'Content-Security-Policy' (แอปหลักบังคับใช้เต็มแล้ว ดู Lawslane/next.config.ts)
          {
            key: 'Content-Security-Policy-Report-Only',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://apis.google.com https://www.gstatic.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' blob: data: https://*.lawslane.com https://imagedelivery.net https://*.r2.dev https://*.googleapis.com https://*.firebaseapp.com https://firebasestorage.googleapis.com https://*.firebasestorage.app https://placehold.co https://images.unsplash.com https://i.pravatar.cc https://*.googleusercontent.com",
              "font-src 'self' https://fonts.gstatic.com",
              "connect-src 'self' https://*.lawslane.com https://*.r2.dev https://*.workers.dev https://*.googleapis.com https://*.firebaseapp.com https://*.firebaseio.com https://imagedelivery.net",
              "frame-src 'self' https://*.firebaseapp.com https://auth.lawslane.com",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "object-src 'none'",
            ].join('; '),
          },
        ],
      },
    ];
  },
  async redirects() {
    // หลังยกส่วนที่ซ้ำไป admin.lawslane.com (แผนรวมหลังบ้าน Module 2)
    // บทความ/หนังสือ/ผู้ใช้/แดชบอร์ด เคยมีสองที่เขียนลง collection เดียวกัน
    return [
      {
        source: '/education-admin/articles/:path*',
        destination: 'https://admin.lawslane.com/content',
        permanent: false,
      },
      {
        source: '/education-admin/books/:path*',
        destination: 'https://admin.lawslane.com/books',
        permanent: false,
      },
      {
        source: '/education-admin/users/:path*',
        destination: 'https://admin.lawslane.com/customers',
        permanent: false,
      },
      {
        // การเงิน + การจัดส่ง รวมเป็นหน้าเดียวที่ admin/orders (Module 3)
        // ทั้งคู่ทำงานกับ collection `orders` เดียวกับที่ admin อ่านอยู่แล้ว
        source: '/education-admin/finance/:path*',
        destination: 'https://admin.lawslane.com/orders',
        permanent: false,
      },
      {
        source: '/education-admin/shipping/:path*',
        destination: 'https://admin.lawslane.com/orders',
        permanent: false,
      },
      {
        // แดชบอร์ดเดิมถูกลบ — ส่งไปหน้าแรกที่ยังเหลืออยู่ในรีโปนี้
        source: '/education-admin',
        destination: '/education-admin/courses',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
