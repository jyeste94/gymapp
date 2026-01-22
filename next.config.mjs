/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: { reactCompiler: true },
  output: 'export',
  images: { unoptimized: true },
};
export default nextConfig;
