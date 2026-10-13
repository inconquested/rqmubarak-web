"use server";

import { fail, idOrNull, ok, requirePemilik, str } from "../shared";
import { removeMadingFile } from "./_storage";

export async function upsertMading(fd: FormData) {
  const returnTo = "/portal/mading";
  const { db } = await requirePemilik();
  const judul = str(fd, "judul");
  if (!judul) fail(returnTo, "Judul wajib diisi.");
  const payload = {
    penulis: str(fd, "penulis") || null,
    judul,
    deskripsi: str(fd, "deskripsi") || null,
    konten: str(fd, "konten") || null,
    thumb_url: str(fd, "thumb_url") || null,
  };
  const id = idOrNull(fd);
  if (id) {
    const prev = await db
      .from("MadingKonten")
      .select("thumb_url")
      .eq("id", id)
      .maybeSingle();
    const { error } = await db
      .from("MadingKonten")
      .update(payload)
      .eq("id", id);
    if (error) fail(returnTo, error.message);
    if (prev.data?.thumb_url && prev.data.thumb_url !== payload.thumb_url)
      await removeMadingFile(db, prev.data.thumb_url);
    ok(returnTo, "Konten mading diperbarui.");
  }
  const { error } = await db.from("MadingKonten").insert(payload);
  if (error) fail(returnTo, error.message);
  ok(returnTo, "Konten mading ditambahkan.");
}
