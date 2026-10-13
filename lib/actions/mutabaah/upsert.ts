"use server";

import { MUTABAAH_JENIS, MUTABAAH_NILAI } from "@/lib/portal";
import { quranSurah } from "@/lib/quran";
import { fail, idOrNull, numOrNull, ok, requirePemilik, str } from "../shared";

/* Transaction: deposits (mutabaah — no date column in schema) */

export async function upsertMutabaah(fd: FormData) {
  const returnTo = "/portal/setoran";
  const { db } = await requirePemilik();
  const santri_id = str(fd, "santri_id");
  const jenis = str(fd, "jenis") || "ziyadah";
  const nilai = str(fd, "nilai") || "jayyid";
  if (!santri_id) fail(returnTo, "Santri wajib dipilih.");
  if (!(MUTABAAH_JENIS as readonly string[]).includes(jenis))
    fail(returnTo, "Jenis tidak valid.");
  if (!(MUTABAAH_NILAI as readonly string[]).includes(nilai))
    fail(returnTo, "Nilai tidak valid.");
  const juz = numOrNull(fd, "quran_juz");
  if (juz !== null && (juz < 1 || juz > 30)) fail(returnTo, "Juz 1–30.");
  const surat = numOrNull(fd, "quran_surat");
  const surah = surat !== null ? quranSurah(surat) : undefined;
  if (surat !== null && !surah) fail(returnTo, "No. surah 1–114.");
  const fromAyat = numOrNull(fd, "from_ayat");
  const toAyat = numOrNull(fd, "to_ayat");
  if (surah) {
    // shortcut: upper juz bound unchecked (needs juzAkhir); lower bound is certain —
    // this surah's verses cannot fall before the juz it starts in.
    if (juz !== null && juz < surah.juzAwal)
      fail(returnTo, `${surah.latin} mulai juz ${surah.juzAwal}.`);
    if (fromAyat !== null && (fromAyat < 1 || fromAyat > surah.totalAyat))
      fail(returnTo, `Dari ayat ${surah.latin}: 1–${surah.totalAyat}.`);
    if (toAyat !== null && (toAyat < 1 || toAyat > surah.totalAyat))
      fail(returnTo, `Sampai ayat ${surah.latin}: 1–${surah.totalAyat}.`);
    if (fromAyat !== null && toAyat !== null && fromAyat > toAyat)
      fail(returnTo, "Dari ayat tidak boleh lebih dari sampai ayat.");
  }
  const payload = {
    santri_id,
    pengajar_id: str(fd, "pengajar_id") || null,
    quran_juz: juz,
    quran_surat: surat,
    from_ayat: fromAyat,
    to_ayat: toAyat,
    jenis,
    nilai,
  };
  const id = idOrNull(fd);
  const { error } = id
    ? await db.from("mutabaah").update(payload).eq("id", id)
    : await db.from("mutabaah").insert(payload);
  if (error) fail(returnTo, error.message);
  ok(returnTo, "Setoran tersimpan.");
}
