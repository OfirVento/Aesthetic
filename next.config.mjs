/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath: "/Aesthetic",
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  },
};

export default nextConfig;
