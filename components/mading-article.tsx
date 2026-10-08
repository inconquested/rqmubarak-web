import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  History,
  Newspaper,
  PencilLine,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { fmtTanggal } from "@/lib/portal";
import type { MadingKonten } from "@/lib/portal";
import { createAdminClient } from "@/lib/supabase/admin";

/* Fetch server-side via service_role (kunci tak pernah ke klien) —
 * dipakai rute portal (pemilik) maupun rute publik. */
export async function getMading(id: string) {
  const { data } = await createAdminClient()
    .from("MadingKonten")
    .select("*,penulis_ref:penulis(id,nama_lengkap)")
    .eq("id", id)
    .maybeSingle();
  return data as unknown as MadingKonten | null;
}

function Meta({ icon: Icon, children }: { icon: LucideIcon; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <Icon aria-hidden className="size-3.5 text-[#6b7a6e]" />
      {children}
    </span>
  );
}

/* Artikel editorial: tombol kembali + lencana + judul + meta berikon +
 * sampul + ringkasan aksen + isi per paragraf. */
export function MadingArticle({
  row,
  backHref,
  backLabel,
  editHref,
}: {
  row: MadingKonten;
  backHref: string;
  backLabel: string;
  editHref?: string;
}) {
  const penulis = row.penulis_ref?.nama_lengkap ?? row.penulis ?? "Tanpa penulis";
  const diubah =
    row.updated_at && row.updated_at !== row.created_at
      ? fmtTanggal(row.updated_at.slice(0, 10))
      : null;
  const kata = (row.konten ?? "").split(/\s+/).filter(Boolean).length;
  const menit = Math.max(1, Math.ceil(kata / 200));
  const paragraf = (row.konten ?? "")
    .split(/\n{2,}|\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <article className="mx-auto max-w-2xl" aria-labelledby="judul-artikel">
      <header className="mt-6">
        <p className="inline-flex items-center gap-1.5 rounded-full bg-[#eef4ec] px-2.5 py-1 text-[12px] font-semibold text-[#2f6b3a]">
          <Newspaper aria-hidden className="size-3.5" />
          Mading
        </p>
        <h1
          id="judul-artikel"
          className="font-display mt-3 text-3xl font-medium tracking-tight text-balance text-[#1d2b21] sm:text-4xl"
        >
          {row.judul ?? "Tanpa judul"}
        </h1>
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-[13px] text-[#6b7a6e]">
          <Meta icon={UserRound}>{penulis}</Meta>
          <Meta icon={CalendarDays}>
            <time dateTime={row.created_at}>{fmtTanggal(row.created_at.slice(0, 10))}</time>
          </Meta>
          {diubah && row.updated_at ? (
            <Meta icon={History}>
              Diubah <time dateTime={row.updated_at}>{diubah}</time>
            </Meta>
          ) : null}
          <Meta icon={Clock3}>{menit} mnt baca</Meta>
        </div>
      </header>

      {row.thumb_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={row.thumb_url}
          alt={row.judul ?? "Sampul mading"}
          className="mt-6 aspect-video w-full rounded-2xl border border-[#d8e2d6] object-cover shadow-sm"
        />
      ) : (
        <hr className="mt-6 border-[#d8e2d6]" />
      )}

      {row.deskripsi ? (
        <p className="mt-6 border-l-[3px] border-[#2f6b3a] pl-4 text-[16px] leading-relaxed font-medium text-[#1d2b21]">
          {row.deskripsi}
        </p>
      ) : null}

      {paragraf.length ? (
        <div className="mt-6 space-y-5 text-[15px] leading-[1.8] text-[#33403a]">
          {paragraf.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      ) : (
        <p className="mt-6 text-[14px] text-[#6b7a6e]">Belum ada isi.</p>
      )}

      {editHref ? (
        <footer className="mt-10 flex justify-end border-t border-[#d8e2d6] pt-5">
          <a
            href={editHref}
            className="inline-flex h-8 items-center gap-1.5 rounded-full bg-[#1d2b21] px-3.5 text-[13px] font-medium text-white transition-colors hover:bg-[#2c4032]"
          >
            <PencilLine aria-hidden className="size-3.5" />
            Ubah
          </a>
        </footer>
      ) : null}
    </article>
  );
}
