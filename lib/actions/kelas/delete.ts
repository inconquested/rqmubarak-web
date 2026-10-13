"use server";

import { fail, ok, requirePemilik, str } from "../shared";

export async function deleteKelas(fd: FormData) {
  const returnTo = "/portal/kelas";
  const { db } = await requirePemilik();
  const id = str(fd, "id");
  if (!id) fail(returnTo, "ID tidak valid.");
  // ON DELETE CASCADE: related santri + assignments are deleted too.
  const { error } = await db.from("kelas").delete().eq("id", id);
  if (error) fail(returnTo, error.message);
  ok(returnTo, "Kelas dihapus (cascade ke santri & penugasan).");
}
