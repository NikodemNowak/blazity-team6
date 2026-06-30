import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root to this app dir. A stray lockfile higher up
  // (e.g. C:\Users\nikod\package-lock.json) makes Next infer the wrong root,
  // which can break .env.local loading and asset resolution.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
