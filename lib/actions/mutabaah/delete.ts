"use server";

import { fail, ok, requirePemilik, str } from "../shared";

export async function deleteMutabaah(fd: FormData) {
  const returnTo = "/portal/setoran";
  const { db } = await requirePemilik();
  const id = str(fd, "id");
  if (!id) fail(returnTo, "ID tidak valid.");
  const { error } = await db.from("mutabaah").delete().eq("id", id);
  if (error) fail(returnTo, error.message);
  ok(returnTo, "Baris setoran dihapus.");
}
