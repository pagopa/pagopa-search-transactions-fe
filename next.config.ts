import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  /*async rewrites() {
    return [
      {
        source: "/api/be/:path*",
        destination: "http://localhost:8080/:path*",
      },
    ];
  },*/
};

export default nextConfig;
