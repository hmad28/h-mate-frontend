const path = require("path"); // Tambahkan import path

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Untuk deployment ke Vercel atau production
  env: {
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
  },

  // Fix workspace root warning
  outputFileTracingRoot: path.join(__dirname, "../../"),
};

module.exports = nextConfig;
