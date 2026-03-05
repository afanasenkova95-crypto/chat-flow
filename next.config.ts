import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['@campstudio/camp-ui-kit'],
  serverExternalPackages: ['pdf-parse', 'pdfjs-dist', '@napi-rs/canvas'],
  images: {
    unoptimized: true,
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(woff|woff2|ttf|eot)$/,
      type: "asset/resource",
    });
    return config;
  },
};

export default nextConfig;
