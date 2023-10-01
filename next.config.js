/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, options) => {
    // config.module.rules.push({
    //   test: /\.mid$/,
    //   type: "asset/resource",
    // });
    config.resolve.fallback = { fs: false, path: false };

    return config;
  },
};

module.exports = nextConfig;
