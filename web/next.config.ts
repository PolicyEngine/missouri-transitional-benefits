import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // react-plotly.js / plotly.js-dist-min are large; let Next handle them as
  // client-only via the "use client" directive on consuming components.
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
