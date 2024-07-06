// @ts-check

const path = require("path");

const withNextIntl = require("next-intl/plugin")();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  experimental: {
    outputFileTracingRoot: path.join(__dirname, "../"),
  },
  images: {
    dangerouslyAllowSVG: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "assets.kabila.app",
      },
    ],
  },
};

module.exports = withNextIntl(config);
