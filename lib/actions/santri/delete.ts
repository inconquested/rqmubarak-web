"use server";

import { fail, ok, requirePemilik, str } from "../shared";

export async function deleteSantri(fd: FormData) {
  const returnTo = "/portal/santri";
  const { db } = await requirePemilik();
  const id = str(fd, "id");
  if (!id) fail(returnTo, "ID tidak valid.");
  const { error } = await db.from("santri").delete().eq("id", id);
  if (error) fail(returnTo, error.message);
  ok(returnTo, "Santri dihapus beserta riwayatnya.");
}
