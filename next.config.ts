// // next.config.ts
// import { NextConfig } from 'next';

// const config: NextConfig = {
//   reactStrictMode: true,
//   experimental: {
//     serverActions: {
//       allowedOrigins: ['localhost:3000']
//     },
//     serverComponentsExternalPackages: ['bcryptjs'],
//   },
//   async headers() {
//     return [
//       {
//         source: '/api/:path*',
//         headers: [
//           { key: 'Access-Control-Allow-Credentials', value: 'true' },
//           { key: 'Access-Control-Allow-Origin', value: '*' },
//           { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
//           { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
//         ],
//       },
//     ];
//   },
//   images: {
//     domains: ['localhost'],
//   },
// };

// export default config;
// next.config.ts
import { NextConfig } from 'next';

const config: NextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:5002']
    }
  },
  // แก้ไขจาก serverComponentsExternalPackages เป็น serverExternalPackages
  serverExternalPackages: ['bcryptjs'],
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ],
      },
    ];
  },
  images: {
    domains: ['localhost'],
    // เพิ่ม remotePatterns สำหรับการใช้งานภาพในโหมด production
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // กำหนด port สำหรับ production
  env: {
    PORT: '5002',
  },
  // เพิ่ม output: 'standalone' เพื่อสร้าง build ที่เหมาะสำหรับ production
  output: 'standalone',
  rules: {
    "@typescript-eslint/no-explicit-any": "off", // หรือเปลี่ยนเป็น "warn" เพื่อให้เตือนแต่ไม่ error
    "@typescript-eslint/no-unused-vars": "off", // หรือเปลี่ยนเป็น "warn"
  }
};

export default config;