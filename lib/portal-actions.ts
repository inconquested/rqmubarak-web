"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  ABSENSI_STATUS,
  KELAS_JENJANG,
  MUTABAAH_JENIS,
  MUTABAAH_NILAI,
  PERAN_PENGGUNA,
} from "@/lib/portal";

/* Guard + helper */

async function requirePemilik() {
  const session = await createClient();
  const {
    data: { user },
  } = await session.auth.getUser();
  if (!user) redirect("/portal/login");
  // pengguna.id = auth.uid() (schema_real.sql §7). Baca via service_role karena
  // policy RLS hanya mengizinkan baris sendiri untuk SELECT — pemilik butuh global.
  const db = createAdminClient();
  const { data: me } = await db
    .from("pengguna")
    .select("id,peran,status")
    .eq("id", user.id)
    .maybeSingle();
  if (!me || me.peran !== "pemilik" || me.status !== "aktif")
    throw new Error("Hanya akun pemilik yang boleh mengubah data.");
  return { db, me: me as { id: string; peran: string; status: string } };
}

function back(returnTo: string, params: string): never {
  revalidatePath("/portal", "layout");
  redirect(`${returnTo}${params}`);
}

function fail(returnTo: string, msg: string): never {
  back(returnTo, `?error=${encodeURIComponent(msg)}`);
}

function ok(returnTo: string, msg = "Tersimpan."): never {
  back(returnTo, `?ok=${encodeURIComponent(msg)}`);
}

const str = (fd: FormData, k: string) => (fd.get(k)?.toString() ?? "").trim();
const numOrNull = (fd: FormData, k: string) => {
  const v = str(fd, k);
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};
const idOrNull = (fd: FormData) => str(fd, "id") || null;

export async function signOut() {
  const db = await createClient();
  await db.auth.signOut();
  redirect("/portal/login");
}

/* Master: kelas */

export async function upsertKelas(fd: FormData) {
  const returnTo = "/portal/kelas";
  const { db } = await requirePemilik();
  const jenjang = str(fd, "jenjang");
  const nama_kelas = str(fd, "nama_kelas") || null;
  if (!(KELAS_JENJANG as readonly string[]).includes(jenjang))
    fail(returnTo, "Jenjang tidak valid.");
  const payload = { jenjang, nama_kelas, jadwal_mulai: str(fd, "jadwal_mulai") || null };
  const id = idOrNull(fd);
  const { error } = id
    ? await db.from("kelas").update(payload).eq("id", id)
    : await db.from("kelas").insert(payload);
  if (error) fail(returnTo, error.message);
  ok(returnTo, id ? "Kelas diperbarui." : "Kelas ditambahkan.");
}

export async function deleteKelas(fd: FormData) {
  const returnTo = "/portal/kelas";
  const { db } = await requirePemilik();
  const id = str(fd, "id");
  if (!id) fail(returnTo, "ID tidak valid.");
  // ON DELETE CASCADE: santri + penugasan terkait ikut terhapus.
  const { error } = await db.from("kelas").delete().eq("id", id);
  if (error) fail(returnTo, error.message);
  ok(returnTo, "Kelas dihapus (cascade ke santri & penugasan).");
}

/* Master: pengguna */

/* Master: pengguna — akun Auth dibuat/dikelola langsung di sini via Admin API.
   id baris = Auth UID (kontrak schema_real.sql §7), jadi tanpa input UID manual. */

export async function upsertPengguna(fd: FormData) {
  const returnTo = "/portal/pengguna";
  const { db } = await requirePemilik();
  const nama_lengkap = str(fd, "nama_lengkap");
  const email = str(fd, "email").toLowerCase();
  const password = fd.get("password")?.toString() ?? "";
  const peran = str(fd, "peran");
  const status = str(fd, "status");
  if (!nama_lengkap) fail(returnTo, "Nama wajib diisi.");
  if (!(PERAN_PENGGUNA as readonly string[]).includes(peran))
    fail(returnTo, "Peran tidak valid.");
  if (!["aktif", "nonaktif"].includes(status)) fail(returnTo, "Status tidak valid.");
  const payload = {
    nama_lengkap,
    email: email || null,
    no_telepon: str(fd, "no_telepon") || null,
    peran,
    status,
  };
  const id = idOrNull(fd);
  if (id) {
    if (email) {
      const { error } = await db.auth.admin.updateUserById(id, {
        email,
        ...(password ? { password } : {}),
      });
      if (error) fail(returnTo, `Gagal memperbarui akun login: ${error.message}`);
    } else if (password) {
      const { error } = await db.auth.admin.updateUserById(id, { password });
      if (error) fail(returnTo, `Gagal mengganti kata sandi: ${error.message}`);
    }
    const { error } = await db.from("pengguna").update(payload).eq("id", id);
    if (error) fail(returnTo, error.message);
    ok(returnTo, "Pengguna diperbarui.");
  }
  if (!email) fail(returnTo, "Email wajib diisi untuk akun baru.");
  if (password.length < 6) fail(returnTo, "Kata sandi minimal 6 karakter.");
  const { data, error: authErr } = await db.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { nama_lengkap },
  });
  if (authErr || !data.user)
    fail(returnTo, `Gagal membuat akun login: ${authErr?.message ?? "unknown"}`);
  const { error } = await db.from("pengguna").insert({ id: data.user.id, ...payload });
  if (error) {
    await db.auth.admin.deleteUser(data.user.id); // rollback akun yatim
    fail(returnTo, error.message);
  }
  ok(returnTo, "Pengguna + akun login dibuat. Tugaskan kelasnya di menu Mengajar.");
}

export async function deletePengguna(fd: FormData) {
  const returnTo = "/portal/pengguna";
  const { db, me } = await requirePemilik();
  const id = str(fd, "id");
  if (!id) fail(returnTo, "ID tidak valid.");
  if (id === me.id) fail(returnTo, "Akun sendiri tidak boleh dihapus.");
  const { error: authErr } = await db.auth.admin.deleteUser(id);
  if (authErr) fail(returnTo, `Gagal menghapus akun login: ${authErr.message}`);
  // ON DELETE CASCADE: penugasan + absensi + mutabaah ikut terhapus.
  const { error } = await db.from("pengguna").delete().eq("id", id);
  if (error) fail(returnTo, error.message);
  ok(returnTo, "Pengguna + akun login dihapus.");
}

/* Master: santri */

export async function upsertSantri(fd: FormData) {
  const returnTo = "/portal/santri";
  const { db } = await requirePemilik();
  const nama = str(fd, "nama");
  if (!nama) fail(returnTo, "Nama santri wajib diisi.");
  const payload = {
    nama,
    no_telepon: str(fd, "no_telepon") || null,
    alamat: str(fd, "alamat") || null,
    kelas_id: str(fd, "kelas_id") || null,
  };
  const id = idOrNull(fd);
  const { error } = id
    ? await db.from("santri").update(payload).eq("id", id)
    : await db.from("santri").insert(payload);
  if (error) fail(returnTo, error.message);
  ok(returnTo, id ? "Data santri diperbarui." : "Santri ditambahkan.");
}

export async function deleteSantri(fd: FormData) {
  const returnTo = "/portal/santri";
  const { db } = await requirePemilik();
  const id = str(fd, "id");
  if (!id) fail(returnTo, "ID tidak valid.");
  const { error } = await db.from("santri").delete().eq("id", id);
  if (error) fail(returnTo, error.message);
  ok(returnTo, "Santri dihapus beserta riwayatnya.");
}

/* Master: mengajar */

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

export async function deleteMengajar(fd: FormData) {
  const returnTo = "/portal/mengajar";
  const { db } = await requirePemilik();
  const id = str(fd, "id");
  if (!id) fail(returnTo, "ID tidak valid.");
  const { error } = await db.from("mengajar").delete().eq("id", id);
  if (error) fail(returnTo, error.message);
  ok(returnTo, "Penugasan dihapus.");
}

/* Transaksi: absensi (satu baris per santri per hari — samakan perilaku upsert aplikasi) */

export async function upsertAbsensi(fd: FormData) {
  const returnTo = "/portal/absensi";
  const { db } = await requirePemilik();
  const santri_id = str(fd, "santri_id");
  const pengajar_id = str(fd, "pengajar_id");
  const tanggal = str(fd, "tanggal"); // YYYY-MM-DD
  const status = str(fd, "status");
  if (!santri_id || !pengajar_id || !tanggal)
    fail(returnTo, "Santri, pengajar, dan tanggal wajib diisi.");
  if (!(ABSENSI_STATUS as readonly string[]).includes(status))
    fail(returnTo, "Status tidak valid.");
  const id = idOrNull(fd);
  const payload = { santri_id, pengajar_id, tanggal: `${tanggal}T00:00:00`, status };
  if (id) {
    const { error } = await db.from("absensi").update(payload).eq("id", id);
    if (error) fail(returnTo, error.message);
    ok(returnTo, "Absensi diperbarui.");
  }
  const next = new Date(`${tanggal}T00:00:00`);
  next.setDate(next.getDate() + 1);
  const ada = await db
    .from("absensi")
    .select("id")
    .eq("santri_id", santri_id)
    .gte("tanggal", tanggal)
    .lt("tanggal", next.toISOString().slice(0, 10))
    .maybeSingle();
  const { error } = ada.data
    ? await db.from("absensi").update(payload).eq("id", ada.data.id)
    : await db.from("absensi").insert(payload);
  if (error) fail(returnTo, error.message);
  ok(returnTo, "Absensi tersimpan.");
}

export async function deleteAbsensi(fd: FormData) {
  const returnTo = "/portal/absensi";
  const { db } = await requirePemilik();
  const id = str(fd, "id");
  if (!id) fail(returnTo, "ID tidak valid.");
  const { error } = await db.from("absensi").delete().eq("id", id);
  if (error) fail(returnTo, error.message);
  ok(returnTo, "Baris absensi dihapus.");
}

/* Transaksi: setoran (mutabaah — tanpa kolom tanggal di skema) */

export async function upsertMutabaah(fd: FormData) {
  const returnTo = "/portal/setoran";
  const { db } = await requirePemilik();
  const santri_id = str(fd, "santri_id");
  const jenis = str(fd, "jenis") || "ziyadah";
  const nilai = str(fd, "nilai") || "jayyid";
  if (!santri_id) fail(returnTo, "Santri wajib dipilih.");
  if (!(MUTABAAH_JENIS as readonly string[]).includes(jenis))
    fail(returnTo, "Jenis tidak valid.");
  if (!(MUTABAAH_NILAI as readonly string[]).includes(nilai))
    fail(returnTo, "Nilai tidak valid.");
  const juz = numOrNull(fd, "quran_juz");
  if (juz !== null && (juz < 1 || juz > 30)) fail(returnTo, "Juz 1–30.");
  const payload = {
    santri_id,
    pengajar_id: str(fd, "pengajar_id") || null,
    quran_juz: juz,
    quran_surat: numOrNull(fd, "quran_surat"),
    from_ayat: numOrNull(fd, "from_ayat"),
    to_ayat: numOrNull(fd, "to_ayat"),
    jenis,
    nilai,
  };
  const id = idOrNull(fd);
  const { error } = id
    ? await db.from("mutabaah").update(payload).eq("id", id)
    : await db.from("mutabaah").insert(payload);
  if (error) fail(returnTo, error.message);
  ok(returnTo, "Setoran tersimpan.");
}

export async function deleteMutabaah(fd: FormData) {
  const returnTo = "/portal/setoran";
  const { db } = await requirePemilik();
  const id = str(fd, "id");
  if (!id) fail(returnTo, "ID tidak valid.");
  const { error } = await db.from("mutabaah").delete().eq("id", id);
  if (error) fail(returnTo, error.message);
  ok(returnTo, "Baris setoran dihapus.");
}

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
async function removeMadingFile(
  db: Awaited<ReturnType<typeof requirePemilik>>["db"],
  url: string | null,
) {
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
