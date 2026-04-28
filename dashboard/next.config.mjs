/** @type {import('next').NextConfig} */
const nextConfig = {
  // dashboard 在 /dashboard，需要读取上一级 output 目录
  // outputFileTracingRoot 让 Vercel 部署时也能打包到 output/ 目录
  outputFileTracingRoot: process.cwd() + "/..",
  experimental: {},
};

export default nextConfig;
