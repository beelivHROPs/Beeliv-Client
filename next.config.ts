import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
