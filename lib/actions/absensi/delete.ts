"use server";

import { fail, ok, requirePemilik, str } from "../shared";

export async function deleteAbsensi(fd: FormData) {
  const returnTo = "/portal/absensi";
  const { db } = await requirePemilik();
  const id = str(fd, "id");
  if (!id) fail(returnTo, "ID tidak valid.");
  const { error } = await db.from("absensi").delete().eq("id", id);
  if (error) fail(returnTo, error.message);
  ok(returnTo, "Baris absensi dihapus.");
}
