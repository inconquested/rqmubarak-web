import type { SupabaseClient } from "@supabase/supabase-js";

/* Tipe baris tabel — cermin supabase/schema_real.sql (jangan diubah sepihak;
   aplikasi Kotlin memakai skema yang sama). */

export type Kelas = {
  id: string;
  jenjang: "reguler" | "intensif" | "dewasa";
  nama_kelas: string | null;
  jadwal_mulai: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type Pengguna = {
  id: string; // = auth.uid()
  nama_lengkap: string;
  no_telepon: string | null;
  email: string | null;
  peran: "pemilik" | "pengajar" | "tak_dikenal";
  status: "aktif" | "nonaktif";
  foto_url: string | null;
};

export type Santri = {
  id: string;
  nama: string;
  no_telepon: string | null;
  alamat: string | null;
  kelas_id: string | null;
  kelas?: Pick<Kelas, "id" | "nama_kelas" | "jenjang"> | null;
};

export type Mengajar = {
  id: string;
  pengajar_id: string;
  kelas_id: string | null;
  pengajar?: Pick<Pengguna, "id" | "nama_lengkap"> | null;
  kelas?: Pick<Kelas, "id" | "nama_kelas" | "jenjang"> | null;
};

export type AbsensiStatus = "hadir" | "sakit" | "izin" | "alpa";
export type Absensi = {
  id: string;
  santri_id: string | null;
  pengajar_id: string;
  tanggal: string; // timestamptz
  status: AbsensiStatus | null;
  santri?: Pick<Santri, "id" | "nama"> | null;
};

export type MutabaahJenis = "ziyadah" | "murajaah";
export type MutabaahNilai = "mumtaz" | "jayyid" | "maqbul";
export type Mutabaah = {
  id: string;
  santri_id: string;
  pengajar_id: string | null;
  quran_juz: number | null;
  quran_surat: number | null;
  from_ayat: number | null;
  to_ayat: number | null;
  jenis: MutabaahJenis | null;
  nilai: MutabaahNilai | null;
  santri?: Pick<Santri, "id" | "nama"> | null;
};

/** ref: refs/schema.sql — nama tabel case-sensitive ("MadingKonten"). */
export type MadingKonten = {
  id: string;
  penulis: string | null;
  judul: string | null;
  deskripsi: string | null;
  konten: string | null;
  thumb_url: string | null;
  created_at: string;
  updated_at: string | null;
  penulis_ref?: Pick<Pengguna, "id" | "nama_lengkap"> | null;
};

/* Konstanta form & navigasi (ejaan dikunci ikut skema: alpa, murajaah) */

export const KELAS_JENJANG = ["reguler", "intensif", "dewasa"] as const;
export const ABSENSI_STATUS: AbsensiStatus[] = ["hadir", "sakit", "izin", "alpa"];
export const MUTABAAH_JENIS: MutabaahJenis[] = ["ziyadah", "murajaah"];
export const MUTABAAH_NILAI: MutabaahNilai[] = ["mumtaz", "jayyid", "maqbul"];
export const PERAN_PENGGUNA = ["pemilik", "pengajar", "tak_dikenal"] as const;

export type Option = { value: string; label: string };

/** Mapper enum → opsi dropdown: value tetap lowercase apa adanya,
 *  label tampil kapital natural (tak_dikenal → Tak Dikenal). */
export function enumOptions(values: readonly string[]): Option[] {
  return values.map((v) => ({ value: v, label: humanize(v) }));
}

export const PORTAL_NAV = [
  { href: "/portal", label: "Monitoring" },
  { href: "/portal/absensi", label: "Rekap Absensi" },
  { href: "/portal/setoran", label: "Rekap Setoran" },
  { href: "/portal/santri", label: "Santri & Rapor" },
  { href: "/portal/kelas", label: "Kelas" },
  { href: "/portal/pengguna", label: "Pengguna" },
  { href: "/portal/mengajar", label: "Mengajar" },
  { href: "/portal/mading", label: "Mading" },
] as const;

/* Helper */

/** Ubah nilai enum snake_case jadi label natural: tak_dikenal → Tak Dikenal. */
export function humanize(v: string | null | undefined) {
  if (!v) return "—";
  return v
    .split("_")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

export function fmtTanggal(iso: string) {
  const d = new Date(iso.length > 10 ? iso : `${iso}T00:00:00`);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
}

/** Ambil kunci hari YYYY-MM-DD dari timestamptz. */
export function dayKey(ts: string) {
  return new Date(ts).toISOString().slice(0, 10);
}

export function rangeTanggal(days: number) {
  const to = new Date();
  const from = new Date();
  from.setDate(to.getDate() - (days - 1));
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  return { from: iso(from), to: iso(to) };
}

export function capaian(m: Pick<Mutabaah, "quran_juz" | "quran_surat" | "from_ayat" | "to_ayat">) {
  const parts: string[] = [];
  if (m.quran_juz) parts.push(`Juz ${m.quran_juz}`);
  if (m.quran_surat) parts.push(`QS ${m.quran_surat}`);
  if (m.from_ayat) parts.push(`:${m.from_ayat}${m.to_ayat ? `–${m.to_ayat}` : ""}`);
  return parts.length ? parts.join(" ") : "—";
}

type Db = SupabaseClient;

/**
 * Agregat dashboard. Catatan skema: absensi punya tanggal (timestamptz) tapi
 * TANPA kelas_id — pemetaan kelas lewat santri. Mutabaah TANPA kolom tanggal,
 * jadi statistik setoran selalu sepanjang waktu.
 */
export async function getDashboard(days: number, kelasId: string | null, db: Db) {
  const { from, to } = rangeTanggal(days);
  const [kelasRes, santriRes, absRes, mutRes] = await Promise.all([
    db.from("kelas").select("id,nama_kelas,jenjang").order("nama_kelas"),
    db.from("santri").select("id,nama,kelas_id").limit(1000),
    db
      .from("absensi")
      .select("status,tanggal,santri_id")
      .gte("tanggal", from)
      .lt("tanggal", to + "T23:59:59")
      .limit(2000),
    db.from("mutabaah").select("id,jenis,santri_id").limit(2000),
  ]);
  const kelas = (kelasRes.data ?? []) as Pick<Kelas, "id" | "nama_kelas" | "jenjang">[];
  const santri = (santriRes.data ?? []) as Pick<Santri, "id" | "nama" | "kelas_id">[];
  const kelasOf = new Map(santri.map((s) => [s.id, s.kelas_id]));
  let abs = (absRes.data ?? []) as Pick<Absensi, "status" | "tanggal" | "santri_id">[];
  let mut = (mutRes.data ?? []) as Pick<Mutabaah, "id" | "jenis" | "santri_id">[];
  const inKelas = (sid: string | null) => !kelasId || (sid && kelasOf.get(sid) === kelasId);
  abs = abs.filter((a) => inKelas(a.santri_id));
  mut = mut.filter((m) => inKelas(m.santri_id));

  const hadir = abs.filter((a) => a.status === "hadir").length;
  const tren: { tanggal: string; hadir: number; total: number }[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(`${from}T00:00:00`);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    const hari = abs.filter((a) => dayKey(a.tanggal) === key);
    tren.push({
      tanggal: key,
      hadir: hari.filter((a) => a.status === "hadir").length,
      total: hari.length,
    });
  }
  const perKelas = kelas.map((k) => {
    const ids = new Set(santri.filter((s) => s.kelas_id === k.id).map((s) => s.id));
    const a = abs.filter((x) => x.santri_id && ids.has(x.santri_id));
    return {
      ...k,
      santri: ids.size,
      absensi: a.length,
      hadir: a.filter((x) => x.status === "hadir").length,
    };
  });
  return {
    from,
    to,
    totalSantri: kelasId
      ? santri.filter((s) => s.kelas_id === kelasId).length
      : santri.length,
    totalKelas: kelas.length,
    absensi: abs.length,
    kehadiran: abs.length ? Math.round((hadir / abs.length) * 100) : 0,
    setoran: mut.length,
    santriAktif: new Set(mut.map((m) => m.santri_id)).size,
    tren,
    perKelas: kelasId ? perKelas.filter((k) => k.id === kelasId) : perKelas,
    perJenis: MUTABAAH_JENIS.map((j) => ({
      jenis: j,
      jumlah: mut.filter((m) => m.jenis === j).length,
    })),
  };
}
