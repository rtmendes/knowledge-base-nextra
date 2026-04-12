import nextra from "nextra";
import { withSentryConfig } from "@sentry/nextjs";

const withNextra = nextra({
  latex: false,
  defaultShowCopyCode: true,
});

const nextConfig = withNextra({
  typescript: {
    ignoreBuildErrors: true,
  },
});

export default withSentryConfig(nextConfig, {
  silent: true,
  sourcemaps: { disable: true },
});
