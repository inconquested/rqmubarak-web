"use server";

import { fail, ok, requirePemilik, str } from "../shared";

/* Master data: teaching assignments */

export async function upsertMengajar(fd: FormData) {
  const returnTo = "/portal/mengajar";
  const { db } = await requirePemilik();
  const pengajar_id = str(fd, "pengajar_id");
  const kelas_id = str(fd, "kelas_id") || null;
  if (!pengajar_id) fail(returnTo, "Pengajar wajib dipilih.");
  const { error } = await db.from("mengajar").insert({ pengajar_id, kelas_id });
  if (error) fail(returnTo, "Penugasan tidak valid.");
  ok(returnTo, "Penugasan ditambahkan.");
}
