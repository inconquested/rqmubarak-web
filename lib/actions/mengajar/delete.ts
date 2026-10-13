"use server";

import { fail, ok, requirePemilik, str } from "../shared";

export async function deleteMengajar(fd: FormData) {
  const returnTo = "/portal/mengajar";
  const { db } = await requirePemilik();
  const id = str(fd, "id");
  if (!id) fail(returnTo, "ID tidak valid.");
  const { error } = await db.from("mengajar").delete().eq("id", id);
  if (error) fail(returnTo, error.message);
  ok(returnTo, "Penugasan dihapus.");
}
