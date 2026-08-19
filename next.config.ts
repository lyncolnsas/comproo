import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['routeros-client', 'node-routeros', 'source-map-support'],
};

export default nextConfig;

