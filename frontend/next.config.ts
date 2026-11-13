import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // servidor próprio com só as dependências usadas, para a imagem Docker (frontend/Dockerfile)
  output: "standalone",
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  images: {
    // fotos da landing page servidas pelo Unsplash
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
    ],
  },
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
