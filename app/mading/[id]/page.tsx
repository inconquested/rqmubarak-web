import { House } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Logo } from "@/components/landing/logo";
import { getMading, MadingArticle } from "@/components/mading-article";
import { site, siteUrl } from "@/lib/site";

/** Artikel publik — di luar /portal, tanpa login. */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const row = await getMading(id);
  if (!row) return { title: "Mading tidak ditemukan" };
  const title = row.judul ?? "Mading";
  const description =
    row.deskripsi ?? row.konten?.slice(0, 160) ?? site.description;
  const penulis = row.penulis_ref?.nama_lengkap ?? row.penulis ?? undefined;
  return {
    title,
    description,
    authors: penulis ? [{ name: penulis }] : undefined,
    alternates: { canonical: `/mading/${row.id}` },
    openGraph: {
      type: "article",
      url: `${siteUrl}/mading/${row.id}`,
      siteName: site.name,
      title,
      description,
      authors: penulis ? [penulis] : undefined,
      publishedTime: row.created_at,
      modifiedTime: row.updated_at ?? undefined,
      images: row.thumb_url
        ? [{ url: row.thumb_url, alt: title }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: row.thumb_url ? [row.thumb_url] : undefined,
    },
  };
}

export default async function MadingArtikelPublikPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const row = await getMading(id);
  if (!row) notFound();

  return (
    <main id="konten" className="w-full px-4 py-6 sm:py-10">
      <a
        href="#konten-utama"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-full focus:bg-[#1d2b21] focus:px-4 focus:py-2 focus:text-[13px] focus:font-medium focus:text-white"
      >
        Lewati ke konten utama
      </a>
      <nav
        aria-label="Navigasi situs"
        className="mx-auto mb-8 flex max-w-2xl items-center justify-between"
      >
        <a href="/" aria-label={`${site.name} — beranda`}>
          <Logo />
        </a>
        <a
          href="/"
          className="inline-flex h-8 items-center gap-1.5 rounded-full border border-[#d8e2d6] bg-white px-3 text-[13px] font-medium text-[#4b5b4f] transition-colors hover:bg-[#eef4ec]"
        >
          <House aria-hidden className="size-3.5" />
          Beranda
        </a>
      </nav>

      <div id="konten-utama" tabIndex={-1} className="scroll-mt-4 outline-none">
        <MadingArticle row={row} backHref="/" backLabel="Beranda" />
      </div>

      <footer className="mx-auto mt-12 max-w-2xl border-t border-[#d8e2d6] pt-5 text-center text-[12px] text-[#6b7a6e]">
        © {new Date().getFullYear()} {site.name} · {site.tagline}
      </footer>
    </main>
  );
}
