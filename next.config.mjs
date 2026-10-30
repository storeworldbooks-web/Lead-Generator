/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for better error detection
  reactStrictMode: true,

  // Allow build to complete even with minor TypeScript errors
  typescript: {
    ignoreBuildErrors: false,
  },

  // ESLint settings
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Optimize images via Cloudflare Image Resizing
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'tile.openstreetmap.org' },
      { protocol: 'https', hostname: '*.basemaps.cartocdn.com' },
    ],
  },

  // Webpack configuration for Leaflet SSR compatibility
  webpack: (config, { isServer }) => {
    // Prevent leaflet from trying to use window/document on server
    if (isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        leaflet: false,
      };
    }
    return config;
  },

  // Security Headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self)',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com",
              "style-src 'self' 'unsafe-inline' https://unpkg.com",
              "img-src 'self' data: blob: https://*.tile.openstreetmap.org https://*.basemaps.cartocdn.com https://*.openstreetmap.org",
              "connect-src 'self' https://nominatim.openstreetmap.org https://overpass-api.de https://overpass.kumi.systems https://maps.mail.ru https://challenges.cloudflare.com",
              "frame-src 'none'",
              "font-src 'self'",
              "worker-src 'self' blob:",
            ].join('; '),
          },
        ],
      },
    ];
  },

  // Redirects
  async redirects() {
    return [
      {
        source: '/app',
        destination: '/',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
