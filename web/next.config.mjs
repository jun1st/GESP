/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  // GitHub Pages 站点位于 https://jun1st.github.io/GESP/，
  // 部署时由 workflow 传入 NEXT_PUBLIC_BASE_PATH=/GESP；本地开发保持根路径。
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || ''
};

export default nextConfig;
