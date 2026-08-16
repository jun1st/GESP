/** @type {import('next').NextConfig} */
// 站点只部署到 Vercel，永远使用根路径，不再支持 GitHub Pages。
const isVercel = process.env.VERCEL === '1';
const nextConfig = {
  trailingSlash: true,
  basePath: '',
  env: {
    NEXT_PUBLIC_BASE_PATH: ''
  }
};

export default nextConfig;
