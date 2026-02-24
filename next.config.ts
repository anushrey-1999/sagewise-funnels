import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "3845",
        pathname: "/assets/**",
      },
      {
        protocol: "https",
        hostname: "via.placeholder.com",
      },
      // Vercel Blob (public store URLs look like https://<id>.public.blob.vercel-storage.com/<path>)
      {
        protocol: "https",
        hostname: "**.public.blob.vercel-storage.com",
      },
      // Some setups may use this hostname variant.
      {
        protocol: "https",
        hostname: "**.blob.vercel-storage.com",
      },
    ],
  },
};

export default nextConfig;
