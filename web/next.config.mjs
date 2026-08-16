/** @type {import('next').NextConfig} */
// Vercel 部署永远使用根路径：即使误配了 NEXT_PUBLIC_BASE_PATH=/GESP（GitHub Pages 遗留）
// 也会强制忽略，避免全站 404。GitHub Pages 历史部署仍需显式传 /GESP。
const isVercel = process.env.VERCEL === '1';
const nextConfig = {
  trailingSlash: true,
  basePath: isVercel ? '' : process.env.NEXT_PUBLIC_BASE_PATH || '',
  env: {
    NEXT_PUBLIC_BASE_PATH: isVercel ? '' : process.env.NEXT_PUBLIC_BASE_PATH || ''
  }
};

export default nextConfig;
