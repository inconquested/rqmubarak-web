import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DeleteButton } from "@/components/portal/delete-button";
import { Combobox, DatePicker, EnumSelect } from "@/components/portal/fields";
import { Empty, Field, FormNotice, PageHeader, StatusBadge } from "@/components/portal/ui";
import { ABSENSI_STATUS, dayKey, fmtTanggal, rangeTanggal } from "@/lib/portal";
import { deleteAbsensi, upsertAbsensi } from "@/lib/portal-actions";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Absensi, Kelas, Pengguna, Santri } from "@/lib/portal";

export default async function AbsensiPage({
  searchParams,
}: {
  searchParams: Promise<{
    ok?: string; error?: string; edit?: string;
    dari?: string; sampai?: string; kelas?: string; status?: string;
  }>;
}) {
  const sp = await searchParams;
  const def = rangeTanggal(30);
  const dari = sp.dari || def.from;
  const sampai = sp.sampai || def.to;
  const db = createAdminClient();

  let q = db
    .from("absensi")
    .select("*,santri:santri_id(id,nama,kelas_id)")
    .gte("tanggal", dari)
    .lt("tanggal", `${sampai}T23:59:59`)
    .order("tanggal", { ascending: false })
    .limit(500);
  if (sp.status) q = q.eq("status", sp.status);
  const [res, santriRes, kelasRes, pengajarRes] = await Promise.all([
    q,
    db.from("santri").select("id,nama,kelas_id").order("nama").limit(1000),
    db.from("kelas").select("id,nama_kelas").order("nama_kelas"),
    db.from("pengguna").select("id,nama_lengkap").eq("status", "aktif").order("nama_lengkap"),
  ]);
  type Row = Absensi & { santri: Pick<Santri, "id" | "nama" | "kelas_id"> | null };
  const semua = (res.data ?? []) as unknown as Row[];
  const rows = sp.kelas ? semua.filter((r) => r.santri?.kelas_id === sp.kelas) : semua;
  const santri = (santriRes.data ?? []) as Pick<Santri, "id" | "nama" | "kelas_id">[];
  const kelas = (kelasRes.data ?? []) as Pick<Kelas, "id" | "nama_kelas">[];
  const pengajar = (pengajarRes.data ?? []) as Pick<Pengguna, "id" | "nama_lengkap">[];
  const editing = sp.edit ? semua.find((r) => r.id === sp.edit) : undefined;
  const ringkas = ABSENSI_STATUS.map((s) => ({
    s,
    n: rows.filter((r) => r.status === s).length,
  }));

  return (
    <div className="space-y-5">
      <PageHeader
        title="Rekap Absensi"
        description="Saring per tanggal, kelas, dan status. Satu santri satu baris per hari — simpan ulang menimpa hari yang sama."
      />
      <FormNotice ok={sp.ok} error={sp.error} />

      <Card className="p-4 sm:p-5">
        <form method="get" className="grid grid-cols-2 items-end gap-3 sm:flex sm:flex-wrap">
          <Field label="Dari" className="col-span-1">
            <DatePicker name="dari" defaultValue={dari} allowClear className="w-full sm:w-auto" />
          </Field>
          <Field label="Sampai" className="col-span-1">
            <DatePicker name="sampai" defaultValue={sampai} allowClear className="w-full sm:w-auto" />
          </Field>
          <Field label="Kelas">
            <EnumSelect
              name="kelas"
              defaultValue={sp.kelas ?? ""}
              allowEmpty
              options={kelas.map((k) => ({ value: k.id, label: k.nama_kelas ?? "Tanpa nama" }))}
              className="w-full sm:w-40"
            />
          </Field>
          <Field label="Status">
            <EnumSelect
              name="status"
              defaultValue={sp.status ?? ""}
              allowEmpty
              options={ABSENSI_STATUS}
              className="w-full sm:w-32"
            />
          </Field>
          <Button variant="outline" size="sm" type="submit" className="col-span-2 sm:col-span-1">Saring</Button>
        </form>
        <p className="mt-3 text-[13px] capitalize text-[#6b7a6e]">
          {rows.length} baris · {ringkas.map((r) => `${r.s}: ${r.n}`).join(" · ")}
        </p>
      </Card>

      <Card className="p-4 sm:p-5">
        <h2 className="font-display text-[15px] font-semibold">
          {editing ? "Ubah absensi" : "Catat absensi"}
        </h2>
        <form action={upsertAbsensi} className="mt-3 grid gap-3 sm:grid-cols-3">
          {editing ? <input type="hidden" name="id" value={editing.id} /> : null}
          <Field label="Santri">
            <Combobox
              name="santri_id"
              required
              defaultValue={editing?.santri_id ?? ""}
              placeholder="Pilih santri"
              searchPlaceholder="Cari santri…"
              options={santri.map((s) => ({ value: s.id, label: s.nama }))}
            />
          </Field>
          <Field label="Tanggal">
            <DatePicker
              name="tanggal"
              defaultValue={editing ? dayKey(editing.tanggal) : new Date().toISOString().slice(0, 10)}
            />
          </Field>
          <Field label="Status">
            <EnumSelect name="status" defaultValue={editing?.status ?? "hadir"} options={ABSENSI_STATUS} />
          </Field>
          <Field label="Pengajar pencatat" className="sm:col-span-3">
            <Combobox
              name="pengajar_id"
              required
              defaultValue={editing?.pengajar_id ?? ""}
              placeholder="Pilih pengajar"
              searchPlaceholder="Cari pengajar…"
              options={pengajar.map((p) => ({ value: p.id, label: p.nama_lengkap }))}
              className="sm:max-w-xs"
            />
          </Field>
          <div className="flex items-end gap-2 sm:col-span-3">
            <Button type="submit" size="sm">Simpan</Button>
            {editing ? (
              <a href="/portal/absensi">
                <Button variant="outline" size="sm" type="button">Batal</Button>
              </a>
            ) : null}
          </div>
        </form>
      </Card>

      <Card className="p-4 sm:p-5">
        {rows.length ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Santri</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="whitespace-nowrap">{fmtTanggal(dayKey(r.tanggal))}</TableCell>
                  <TableCell className="font-medium">
                    {r.santri_id ? (
                      <a href={`/portal/santri/${r.santri_id}`} className="underline decoration-[#bccfba] underline-offset-2">
                        {r.santri?.nama ?? "—"}
                      </a>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell><StatusBadge status={r.status ?? "—"} /></TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex gap-1">
                      <a href={`/portal/absensi?dari=${dari}&sampai=${sampai}&edit=${r.id}`}>
                        <Button variant="ghost" size="sm" type="button">Ubah</Button>
                      </a>
                      <form action={deleteAbsensi}>
                        <input type="hidden" name="id" value={r.id} />
                        <DeleteButton message="Hapus baris absensi ini?" />
                      </form>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Empty text="Tidak ada absensi pada filter ini." />
        )}
      </Card>
    </div>
  );
}
