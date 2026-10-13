import type { NextConfig } from "next";

/** Supabase host from env (build-time). Wildcard fallback when env is missing. */
const supabaseHost = (() => {
  try {
    const u = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
    return new URL(u).hostname || undefined;
  } catch {
    return undefined;
  }
})();

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      ...(supabaseHost
        ? [
            {
              protocol: "https" as const,
              hostname: supabaseHost,
              pathname: "/storage/v1/object/public/**",
            },
          ]
        : [{ protocol: "https" as const, hostname: "*.supabase.co" }]),
    ],
  },
  async headers() {
    return [
      {
        // Public logo: no content hash, so set immutable manually.
        source: "/logo-notext.svg",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
