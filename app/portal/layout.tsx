import type { Metadata } from "next";

/** Thin shell: noindex for all /portal*. Session + role guard lives in (protected)/layout. */
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
