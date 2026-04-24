import nextra from "nextra";

const withNextra = nextra({
  latex: false,
  defaultShowCopyCode: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },

  // Allow external images (CDN logos, etc.)
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.simpleicons.org' },
      { protocol: 'https', hostname: 'cdn.jsdelivr.net' },
      { protocol: 'https', hostname: 'raw.githubusercontent.com' },
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },

  // Allow iframes and external resources for embedded interactive tools
  async headers() {
    return [
      {
        // Apply to all routes
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            // CSP: allow iframes from known interactive tool domains
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https:",
              "font-src 'self' data: https:",
              "frame-src 'self' https://mission-control-six-zeta.vercel.app https://app.clickup.com https://*.vercel.app https://*.genspark.ai https://*.manus.app",
              "connect-src 'self' https:",
              "media-src 'self' blob: data: https:",
              "worker-src blob:",
            ].join('; '),
          },
        ],
      },
      {
        // Serve interactive HTML files with permissive headers
        source: '/interactive/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:",
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
        ],
      },
    ];
  },
};

export default withNextra(nextConfig);
