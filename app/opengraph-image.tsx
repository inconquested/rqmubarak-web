import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `${site.name} — ${site.tagline}`;

async function font(weight: 500 | 700): Promise<ArrayBuffer> {
  const res = await fetch(
    `https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-${weight}-normal.woff`,
  );
  if (!res.ok) throw new Error(`Gagal memuat font ${weight}`);
  return res.arrayBuffer();
}

export default async function OgImage() {
  const [medium, bold] = await Promise.all([font(500), font(700)]);
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        padding: "96px",
        background:
          "linear-gradient(135deg, #dde8da 0%, #f2f7f1 60%, #ffffff 100%)",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <div style={{ fontSize: 32, fontWeight: 500, color: "#4b5b4f" }}>
        {site.name}
      </div>
      <div
        style={{
          marginTop: 16,
          fontSize: 84,
          fontWeight: 700,
          lineHeight: 1.05,
          letterSpacing: "-0.03em",
          color: "#1a241d",
        }}
      >
        Menjadi Keluarga Allah Dengan Al-Qur&rsquo;an
      </div>
      <div style={{ marginTop: 24, fontSize: 30, color: "#6b7a6e" }}>
        Halaqah anak hingga dewasa &bull; Mutaba&rsquo;ah digital
      </div>
    </div>,
    {
      ...size,
      fonts: [
        { name: "Inter", data: medium, weight: 500 },
        { name: "Inter", data: bold, weight: 700 },
      ],
    },
  );
}
