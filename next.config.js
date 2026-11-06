/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  poweredByHeader: false,
  // The QA gate runs `next build` while a dev server serves the same checkout.
  // Both write a routes-manifest and the dev server returns 500 on every route
  // once the gate clobbers it. Let the gate build into its own directory so the
  // two never share state. Default keeps `next dev` and production unchanged.
  distDir: process.env.MASTRION_DIST_DIR || '.next',
};

module.exports = nextConfig;
