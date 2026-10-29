/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    // Project Timeline's bundle files are content-hashed: cache them for a year (ADR-012).
    const immutable = [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }];
    return [
      { source: "/project-timeline/assets/:path*", headers: immutable },
      { source: "/project-timeline/fonts/:path*", headers: immutable },
    ];
  },
};

export default nextConfig;
