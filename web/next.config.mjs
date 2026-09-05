/** @type {import('next').NextConfig} */
const nextConfig = {
  // Produces a self-contained server in .next/standalone so the Docker
  // runner stage can run the app without the full node_modules tree.
  output: "standalone",
};

export default nextConfig;
