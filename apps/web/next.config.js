const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

const isProd = process.env.NODE_ENV === 'production';
const repoName = 'PTTracker'; // Change to your repo name
const isNetlify = process.env.NETLIFY === 'true';

module.exports = withPWA({
  reactStrictMode: true,
  transpilePackages: ['@pt/shared'],

  // Static export for GitHub Pages
  output: 'export',

  // Base path for GitHub Pages (repo name)
  // Comment out if using custom domain or user/org pages
  basePath: isProd && !isNetlify ? `/${repoName}` : '',

  // Asset prefix for GitHub Pages
  assetPrefix: isProd && !isNetlify ? `/${repoName}/` : '',

  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },

  // Trailing slash for static hosting
  trailingSlash: true,
});
