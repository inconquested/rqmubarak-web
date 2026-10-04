import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DeleteButton } from "@/components/portal/delete-button";
import { Combobox } from "@/components/portal/fields";
import { Empty, Field, FormNotice, PageHeader } from "@/components/portal/ui";
import { deleteSantri, upsertSantri } from "@/lib/portal-actions";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Kelas, Santri } from "@/lib/portal";

export default async function SantriPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string; edit?: string; cari?: string }>;
}) {
  const sp = await searchParams;
  const db = createAdminClient();
  const [santriRes, kelasRes] = await Promise.all([
    db.from("santri").select("*,kelas:kelas_id(id,nama_kelas,jenjang)").order("nama").limit(500),
    db.from("kelas").select("id,nama_kelas").order("nama_kelas"),
  ]);
  const all = (santriRes.data ?? []) as unknown as Santri[];
  const kelas = (kelasRes.data ?? []) as Pick<Kelas, "id" | "nama_kelas">[];
  const q = (sp.cari ?? "").toLowerCase();
  const rows = q ? all.filter((s) => s.nama.toLowerCase().includes(q)) : all;
  const editing = sp.edit ? all.find((r) => r.id === sp.edit) : undefined;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Santri & Rapor"
        description="Master data santri. Klik nama untuk membuka rapor per santri."
        action={
          <form method="get" className="flex gap-2">
            <Input name="cari" placeholder="Cari nama…" defaultValue={sp.cari ?? ""} className="h-8 w-44" />
            <Button variant="outline" size="sm" type="submit">Cari</Button>
          </form>
        }
      />
      <FormNotice ok={sp.ok} error={sp.error} />

      <Card className="p-4 sm:p-5">
        <h2 className="font-display text-[15px] font-semibold">
          {editing ? "Ubah santri" : "Tambah santri"}
        </h2>
        <form action={upsertSantri} className="mt-3 grid gap-3 sm:grid-cols-2">
          {editing ? <input type="hidden" name="id" value={editing.id} /> : null}
          <Field label="Nama">
            <Input name="nama" required defaultValue={editing?.nama ?? ""} />
          </Field>
          <Field label="Kelas">
            <Combobox
              name="kelas_id"
              defaultValue={editing?.kelas_id ?? ""}
              placeholder="— Tanpa kelas —"
              searchPlaceholder="Cari kelas…"
              options={kelas.map((k) => ({ value: k.id, label: k.nama_kelas ?? "Tanpa nama" }))}
            />
          </Field>
          <Field label="No. telepon">
            <Input name="no_telepon" defaultValue={editing?.no_telepon ?? ""} />
          </Field>
          <Field label="Alamat">
            <Textarea name="alamat" rows={2} defaultValue={editing?.alamat ?? ""} />
          </Field>
          <div className="flex items-end gap-2 sm:col-span-2">
            <Button type="submit" size="sm">{editing ? "Simpan" : "Tambah"}</Button>
            {editing ? (
              <a href="/portal/santri">
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
                  <TableHead>Nama</TableHead>
                  <TableHead>Kelas</TableHead>
                  <TableHead className="hidden sm:table-cell">No. telepon</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">
                    <a href={`/portal/santri/${r.id}`} className="underline decoration-[#bccfba] underline-offset-2 hover:text-[#4b5b4f]">
                      {r.nama}
                    </a>
                  </TableCell>
                  <TableCell>{r.kelas?.nama_kelas ?? "—"}</TableCell>
                  <TableCell className="hidden sm:table-cell">{r.no_telepon ?? "—"}</TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex gap-1">
                      <a href={`/portal/santri?edit=${r.id}`}>
                        <Button variant="ghost" size="sm" type="button">Ubah</Button>
                      </a>
                      <form action={deleteSantri}>
                        <input type="hidden" name="id" value={r.id} />
                        <DeleteButton message={`Hapus ${r.nama} beserta seluruh riwayat absensi & setorannya?`} />
                      </form>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Empty text={q ? "Tidak ada santri yang cocok." : undefined} />
        )}
      </Card>
    </div>
  );
}
