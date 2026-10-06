"use server";

import { MUTABAAH_JENIS, MUTABAAH_NILAI } from "@/lib/portal";
import { fail, idOrNull, numOrNull, ok, requirePemilik, str } from "./shared";

/* Transaksi: setoran (mutabaah — tanpa kolom tanggal di skema) */

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
  const payload = {
    santri_id,
    pengajar_id: str(fd, "pengajar_id") || null,
    quran_juz: juz,
    quran_surat: numOrNull(fd, "quran_surat"),
    from_ayat: numOrNull(fd, "from_ayat"),
    to_ayat: numOrNull(fd, "to_ayat"),
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

export async function deleteMutabaah(fd: FormData) {
  const returnTo = "/portal/setoran";
  const { db } = await requirePemilik();
  const id = str(fd, "id");
  if (!id) fail(returnTo, "ID tidak valid.");
  const { error } = await db.from("mutabaah").delete().eq("id", id);
  if (error) fail(returnTo, error.message);
  ok(returnTo, "Baris setoran dihapus.");
}
