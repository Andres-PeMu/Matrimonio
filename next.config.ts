import type { NextConfig } from 'next';
const localImages =
  process.env.NODE_ENV === 'development' &&
  process.env.NEXT_PUBLIC_SUPABASE_URL?.startsWith('http://127.0.0.1:54321');
const config: NextConfig = {
  turbopack: { root: process.cwd() },
  experimental: { serverActions: { bodySizeLimit: '5mb' } },
  images: {
    dangerouslyAllowLocalIP: Boolean(localImages),
    remotePatterns: [
      ...(localImages
        ? [
            {
              protocol: 'http' as const,
              hostname: '127.0.0.1',
              port: '54321',
              pathname: '/storage/v1/object/public/wedding-media/**',
            },
          ]
        : []),
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/wedding-media/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};
export default config;
