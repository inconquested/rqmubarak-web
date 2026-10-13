"use server";

import { fail, ok, requirePemilik, str } from "../shared";
import { removeMadingFile } from "./_storage";

export async function deleteMading(fd: FormData) {
  const returnTo = "/portal/mading";
  const { db } = await requirePemilik();
  const id = str(fd, "id");
  if (!id) fail(returnTo, "ID tidak valid.");
  const prev = await db
    .from("MadingKonten")
    .select("thumb_url")
    .eq("id", id)
    .maybeSingle();
  const { error } = await db.from("MadingKonten").delete().eq("id", id);
  if (error) fail(returnTo, error.message);
  await removeMadingFile(db, prev.data?.thumb_url ?? null);
  ok(returnTo, "Konten mading dihapus.");
}
