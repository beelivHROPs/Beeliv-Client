import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Don't advertise the framework in the X-Powered-By response header —
  // project-lead direction: keep the tech stack from being fingerprinted
  // via a plain response-header check.
  poweredByHeader: false,
  // images.unsplash.com: stock photos for the homepage hero's avatar stack
  // (components/shared/AvatarStack.tsx) — real, commercially-licensed
  // (Unsplash License) stock photos, not real Beeliv people. Flagged in
  // that component's own comment as needing replacement before any real
  // client-facing use.
  images: {
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },
};

export default nextConfig;
