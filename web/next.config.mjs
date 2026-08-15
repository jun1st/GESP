/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  // 兼容早期 GitHub Pages（https://jun1st.github.io/GESP/）部署：传入 NEXT_PUBLIC_BASE_PATH=/GESP；
  // Vercel 部署保持根路径（默认空）。
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || ''
};

export default nextConfig;
