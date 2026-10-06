"use server";

import { KELAS_JENJANG } from "@/lib/portal";
import { fail, idOrNull, ok, requirePemilik, str } from "./shared";

/* Master: kelas */

export async function upsertKelas(fd: FormData) {
  const returnTo = "/portal/kelas";
  const { db } = await requirePemilik();
  const jenjang = str(fd, "jenjang");
  const nama_kelas = str(fd, "nama_kelas") || null;
  if (!(KELAS_JENJANG as readonly string[]).includes(jenjang))
    fail(returnTo, "Jenjang tidak valid.");
  const payload = { jenjang, nama_kelas, jadwal_mulai: str(fd, "jadwal_mulai") || null };
  const id = idOrNull(fd);
  const { error } = id
    ? await db.from("kelas").update(payload).eq("id", id)
    : await db.from("kelas").insert(payload);
  if (error) fail(returnTo, error.message);
  ok(returnTo, id ? "Kelas diperbarui." : "Kelas ditambahkan.");
}

export async function deleteKelas(fd: FormData) {
  const returnTo = "/portal/kelas";
  const { db } = await requirePemilik();
  const id = str(fd, "id");
  if (!id) fail(returnTo, "ID tidak valid.");
  // ON DELETE CASCADE: santri + penugasan terkait ikut terhapus.
  const { error } = await db.from("kelas").delete().eq("id", id);
  if (error) fail(returnTo, error.message);
  ok(returnTo, "Kelas dihapus (cascade ke santri & penugasan).");
}
