"use server";

import { fail, idOrNull, ok, requirePemilik, str, type AdminDb } from "./shared";

/* Master: mading (refs/schema.sql — tabel "MadingKonten", case-sensitive) */

const MADING_BUCKET = "mading";

/** Terima blob yang SUDAH dikompres di client. Buat bucket publik bila belum ada. */
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
    const { error } = await db.storage.createBucket(MADING_BUCKET, { public: true });
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

/** Hapus berkas yatim di bucket sendiri (best-effort, abaikan gagal). */
async function removeMadingFile(db: AdminDb, url: string | null) {
  if (!url) return;
  const i = url.indexOf(`/${MADING_BUCKET}/`);
  if (i < 0) return; // URL luar — bukan milik kita.
  await db.storage.from(MADING_BUCKET).remove([url.slice(i + MADING_BUCKET.length + 2)]);
}

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
    const prev = await db.from("MadingKonten").select("thumb_url").eq("id", id).maybeSingle();
    const { error } = await db.from("MadingKonten").update(payload).eq("id", id);
    if (error) fail(returnTo, error.message);
    if (prev.data?.thumb_url && prev.data.thumb_url !== payload.thumb_url)
      await removeMadingFile(db, prev.data.thumb_url);
    ok(returnTo, "Konten mading diperbarui.");
  }
  const { error } = await db.from("MadingKonten").insert(payload);
  if (error) fail(returnTo, error.message);
  ok(returnTo, "Konten mading ditambahkan.");
}

export async function deleteMading(fd: FormData) {
  const returnTo = "/portal/mading";
  const { db } = await requirePemilik();
  const id = str(fd, "id");
  if (!id) fail(returnTo, "ID tidak valid.");
  const prev = await db.from("MadingKonten").select("thumb_url").eq("id", id).maybeSingle();
  const { error } = await db.from("MadingKonten").delete().eq("id", id);
  if (error) fail(returnTo, error.message);
  await removeMadingFile(db, prev.data?.thumb_url ?? null);
  ok(returnTo, "Konten mading dihapus.");
}
