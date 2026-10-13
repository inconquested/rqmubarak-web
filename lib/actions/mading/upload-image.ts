"use server";

import { requirePemilik } from "../shared";
import { MADING_BUCKET } from "./_storage";

/* Master data: mading (refs/schema.sql — "MadingKonten" table, case-sensitive) */

/** Accept a blob ALREADY compressed on the client. Create the public bucket if missing. */
export async function uploadMadingImage(
  fd: FormData,
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  const { db } = await requirePemilik();
  const file = fd.get("file");
  if (!(file instanceof File) || file.size === 0)
    return { ok: false, error: "Berkas kosong." };
  if (!file.type.startsWith("image/"))
    return { ok: false, error: "Berkas harus gambar." };
  if (file.size > 2 * 1024 * 1024)
    return { ok: false, error: "Gambar masih di atas 2MB." };
  const { data: buckets } = await db.storage.listBuckets();
  if (!buckets?.some((b) => b.name === MADING_BUCKET)) {
    const { error } = await db.storage.createBucket(MADING_BUCKET, {
      public: true,
    });
    if (error) return { ok: false, error: "Gagal menyiapkan penyimpanan." };
  }
  const name = `${crypto.randomUUID()}.webp`;
  const { error } = await db.storage
    .from(MADING_BUCKET)
    .upload(name, file, { contentType: "image/webp", upsert: false });
  if (error) return { ok: false, error: error.message };
  const { data } = db.storage.from(MADING_BUCKET).getPublicUrl(name);
  return { ok: true, url: data.publicUrl };
}
