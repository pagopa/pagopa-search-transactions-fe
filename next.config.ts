import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  output: 'standalone',
  assetPrefix: '/pagopa-search-transactions-fe',
};

export default nextConfig;
