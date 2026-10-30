import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // the old demo tree is gone; its links open AYOP's tree instead
  async redirects() {
    return [{ source: '/t/demo/:path*', destination: '/t/ayop/:path*', permanent: false }];
  },
};

export default nextConfig;
