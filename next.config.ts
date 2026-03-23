import withPWA from "@ducanh2912/next-pwa";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Empty turbopack config to silence the warning about webpack config
  turbopack: {},
};

export default withPWA({
  customWorkerSrc: "src/worker",
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  fallbacks: {
    document: "/~offline",
  },
  register: true,
})(nextConfig);
