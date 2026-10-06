"use server";

import { fail, idOrNull, ok, requirePemilik, str } from "./shared";

/* Master: santri */

export async function upsertSantri(fd: FormData) {
  const returnTo = "/portal/santri";
  const { db } = await requirePemilik();
  const nama = str(fd, "nama");
  if (!nama) fail(returnTo, "Nama santri wajib diisi.");
  const payload = {
    nama,
    no_telepon: str(fd, "no_telepon") || null,
    alamat: str(fd, "alamat") || null,
    kelas_id: str(fd, "kelas_id") || null,
  };
  const id = idOrNull(fd);
  const { error } = id
    ? await db.from("santri").update(payload).eq("id", id)
    : await db.from("santri").insert(payload);
  if (error) fail(returnTo, error.message);
  ok(returnTo, id ? "Data santri diperbarui." : "Santri ditambahkan.");
}

export async function deleteSantri(fd: FormData) {
  const returnTo = "/portal/santri";
  const { db } = await requirePemilik();
  const id = str(fd, "id");
  if (!id) fail(returnTo, "ID tidak valid.");
  const { error } = await db.from("santri").delete().eq("id", id);
  if (error) fail(returnTo, error.message);
  ok(returnTo, "Santri dihapus beserta riwayatnya.");
}
