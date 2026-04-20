import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['three'],
  experimental: {
    optimizePackageImports: ['framer-motion', '@react-three/drei']
  },
  // Static export for GitHub Pages. `next build` will emit a fully static
  // site to `./out`, which the Actions workflow uploads as the Pages artifact.
  output: 'export',
  // GitHub Pages serves each route as a folder with an index.html — trailing
  // slashes are required to avoid 404s on deep-link / refresh.
  trailingSlash: true,
  // The Next Image Optimizer is a server-side feature; static export can only
  // serve raw image assets.
  images: { unoptimized: true }
};

export default withNextIntl(nextConfig);
