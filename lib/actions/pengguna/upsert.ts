"use server";

import { PERAN_PENGGUNA } from "@/lib/portal";
import { fail, idOrNull, ok, requirePemilik, str } from "../shared";

/* Master data: users — Auth accounts are created/managed here directly via the Admin API.
   row id = Auth UID (schema_real.sql §7 contract), so no manual UID input. */

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
  if (!["aktif", "nonaktif"].includes(status))
    fail(returnTo, "Status tidak valid.");
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
      if (error)
        fail(returnTo, `Gagal memperbarui akun login: ${error.message}`);
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
    fail(
      returnTo,
      `Gagal membuat akun login: ${authErr?.message ?? "unknown"}`,
    );
  const { error } = await db
    .from("pengguna")
    .insert({ id: data.user.id, ...payload });
  if (error) {
    await db.auth.admin.deleteUser(data.user.id); // roll back the orphaned account
    fail(returnTo, error.message);
  }
  ok(
    returnTo,
    "Pengguna + akun login dibuat. Tugaskan kelasnya di menu Mengajar.",
  );
}
