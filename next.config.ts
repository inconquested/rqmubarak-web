import type { NextConfig } from "next";

/** Host Supabase dari env (build-time). Fallback wildcard bila env belum ada. */
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
        // Logo publik: konten-hash tidak ada, beri immutable manual.
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
