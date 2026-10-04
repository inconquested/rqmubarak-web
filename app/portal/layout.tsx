import type { Metadata } from "next";

/** Cangkang tipis: noindex untuk seluruh /portal*. Guard sesi + peran ada di (protected)/layout. */
export const metadata: Metadata = {
  title: "Portal Pemilik",
  robots: { index: false, follow: false, noarchive: true },
};

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-dvh bg-[#fbfdfb] text-[#1d2b21]">{children}</div>;
}
