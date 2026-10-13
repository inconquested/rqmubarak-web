"use server";

import { ABSENSI_STATUS } from "@/lib/portal";
import { fail, idOrNull, ok, requirePemilik, str } from "../shared";

/* Transaction: absensi (one row per student per day — match the app's upsert behavior) */

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
  const payload = {
    santri_id,
    pengajar_id,
    tanggal: `${tanggal}T00:00:00`,
    status,
  };
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
