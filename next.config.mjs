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

  // Don't fail build on prerender errors - serve pages on-demand instead
  experimental: {
    // In Next.js 15.5, this prevents the build from failing on prerender errors
    // and instead serves those pages dynamically
    missingSuspenseWithCSRBailout: false,
  },

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.simpleicons.org' },
      { protocol: 'https', hostname: 'cdn.jsdelivr.net' },
      { protocol: 'https', hostname: 'raw.githubusercontent.com' },
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https:",
              "font-src 'self' data: https:",
              "frame-src 'self' https://mission-control-six-zeta.vercel.app https://app.clickup.com https://*.vercel.app https://*.genspark.ai https://*.manus.app",
              "frame-ancestors 'self' https://command.insightprofit.live https://*.insightprofit.live",
              "connect-src 'self' https:",
              "media-src 'self' blob: data: https:",
              "worker-src blob:",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

export default withNextra(nextConfig);
