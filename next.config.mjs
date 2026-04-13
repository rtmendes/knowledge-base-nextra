import nextra from "nextra";

const withNextra = nextra({
  latex: false,
  defaultShowCopyCode: true,
});

const nextConfig = withNextra({
  typescript: {
    ignoreBuildErrors: true,
  },
});

export default nextConfig;
