import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DeleteButton } from "@/components/portal/delete-button";
import { Combobox, EnumSelect } from "@/components/portal/fields";
import { OfflineForm } from "@/components/portal/offline";
import { Empty, Field, FormNotice, PageHeader, StatusBadge } from "@/components/portal/ui";
import { MUTABAAH_JENIS, MUTABAAH_NILAI, capaian, enumOptions, humanize } from "@/lib/portal";
import { deleteMutabaah, upsertMutabaah } from "@/lib/actions";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Mutabaah, Pengguna, Santri } from "@/lib/portal";

export default async function SetoranPage({
  searchParams,
}: {
  searchParams: Promise<{
    ok?: string; error?: string; edit?: string; jenis?: string; cari?: string;
  }>;
}) {
  const sp = await searchParams;
  const db = createAdminClient();

  let q = db
    .from("mutabaah")
    .select("*,santri:santri_id(id,nama)")
    .order("quran_juz", { ascending: false })
    .limit(500);
  if (sp.jenis) q = q.eq("jenis", sp.jenis);
  const [res, santriRes, usersRes] = await Promise.all([
    q,
    db.from("santri").select("id,nama").order("nama").limit(1000),
    db.from("pengguna").select("id,nama_lengkap").eq("status", "aktif").order("nama_lengkap"),
  ]);
  type Row = Mutabaah & { santri: Pick<Santri, "id" | "nama"> | null };
  const semua = (res.data ?? []) as unknown as Row[];
  const cari = (sp.cari ?? "").toLowerCase();
  const rows = cari
    ? semua.filter((r) => (r.santri?.nama ?? "").toLowerCase().includes(cari))
    : semua;
  const santri = (santriRes.data ?? []) as Pick<Santri, "id" | "nama">[];
  const pengajar = (usersRes.data ?? []) as Pick<Pengguna, "id" | "nama_lengkap">[];
  const editing = sp.edit ? semua.find((r) => r.id === sp.edit) : undefined;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Rekap Setoran"
        description="Catatan mutabaah (ziyadah · murajaah) + nilai capaian. Skema tidak menyimpan tanggal."
      />
      <FormNotice ok={sp.ok} error={sp.error} />

      <Card className="p-4 sm:p-5">
        <form method="get" className="grid grid-cols-2 items-end gap-3 sm:flex sm:flex-wrap">
          <Field label="Jenis">
            <EnumSelect
              name="jenis"
              defaultValue={sp.jenis ?? ""}
              allowEmpty
              options={enumOptions(MUTABAAH_JENIS)}
              className="w-full sm:w-36"
            />
          </Field>
          <Field label="Cari santri" className="col-span-1">
            <Input name="cari" defaultValue={sp.cari ?? ""} placeholder="Nama…" className="h-8 w-full sm:w-44" />
          </Field>
          <Button variant="outline" size="sm" type="submit" className="col-span-2 sm:col-span-1">Saring</Button>
        </form>
        <p className="mt-3 text-[13px] text-[#6b7a6e]">{rows.length} baris setoran.</p>
      </Card>

      <Card className="p-4 sm:p-5">
        <h2 className="font-display text-[15px] font-semibold">
          {editing ? "Ubah setoran" : "Catat setoran"}
        </h2>
        <OfflineForm resource="mutabaah" op="upsert" action={upsertMutabaah} className="mt-3 grid gap-3 sm:grid-cols-3">
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
          <Field label="Jenis">
            <EnumSelect name="jenis" defaultValue={editing?.jenis ?? "ziyadah"} options={MUTABAAH_JENIS} />
          </Field>
          <Field label="Nilai">
            <EnumSelect name="nilai" defaultValue={editing?.nilai ?? "jayyid"} options={enumOptions(MUTABAAH_NILAI)} />
          </Field>
          <Field label="Pengajar (opsional)">
            <Combobox
              name="pengajar_id"
              defaultValue={editing?.pengajar_id ?? ""}
              placeholder="—"
              searchPlaceholder="Cari pengajar…"
              options={pengajar.map((p) => ({ value: p.id, label: p.nama_lengkap }))}
            />
          </Field>
          <Field label="Juz">
            <Input type="number" name="quran_juz" min={1} max={30} defaultValue={editing?.quran_juz ?? ""} className="h-8" />
          </Field>
          <Field label="No. surah">
            <Input type="number" name="quran_surat" min={1} max={114} defaultValue={editing?.quran_surat ?? ""} className="h-8" />
          </Field>
          <Field label="Dari ayat">
            <Input type="number" name="from_ayat" min={1} defaultValue={editing?.from_ayat ?? ""} className="h-8" />
          </Field>
          <Field label="Sampai ayat">
            <Input type="number" name="to_ayat" min={1} defaultValue={editing?.to_ayat ?? ""} className="h-8" />
          </Field>
          <div className="flex items-end gap-2 sm:col-span-3">
            <Button type="submit" size="sm">Simpan</Button>
            {editing ? (
              <a href="/portal/setoran">
                <Button variant="outline" size="sm" type="button">Batal</Button>
              </a>
            ) : null}
          </div>
        </OfflineForm>
      </Card>

      <Card className="p-4 sm:p-5">
        {rows.length ? (
          <Table>
            <TableHeader>
                <TableRow>
                  <TableHead>Santri</TableHead>
                  <TableHead>Jenis</TableHead>
                  <TableHead>Capaian</TableHead>
                  <TableHead className="hidden sm:table-cell">Nilai</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">
                    <a href={`/portal/santri/${r.santri_id}`} className="underline decoration-[#bccfba] underline-offset-2">
                      {r.santri?.nama ?? "—"}
                    </a>
                  </TableCell>
                  <TableCell>{humanize(r.jenis)}</TableCell>
                  <TableCell className="text-[13px]">{capaian(r)}</TableCell>
                  <TableCell className="hidden sm:table-cell"><StatusBadge status={r.nilai ?? "—"} /></TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex gap-1">
                      <a href={`/portal/setoran?edit=${r.id}`}>
                        <Button variant="ghost" size="sm" type="button">Ubah</Button>
                      </a>
                      <OfflineForm resource="mutabaah" op="delete" action={deleteMutabaah}>
                        <input type="hidden" name="id" value={r.id} />
                        <DeleteButton message="Hapus baris setoran ini?" />
                      </OfflineForm>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Empty text="Tidak ada setoran pada filter ini." />
        )}
      </Card>
    </div>
  );
}
