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
import { EnumSelect } from "@/components/portal/fields";
import { Empty, Field, FormNotice, PageHeader } from "@/components/portal/ui";
import { deleteKelas, upsertKelas } from "@/lib/portal-actions";
import { createAdminClient } from "@/lib/supabase/admin";
import { humanize } from "@/lib/portal";
import type { Kelas } from "@/lib/portal";

export default async function KelasPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string; edit?: string }>;
}) {
  const sp = await searchParams;
  const db = createAdminClient();
  const { data } = await db.from("kelas").select("*").order("nama_kelas");
  const rows = (data ?? []) as Kelas[];
  const editing = sp.edit ? rows.find((r) => r.id === sp.edit) : undefined;

  return (
    <div className="space-y-5">
      <PageHeader title="Kelas" description="Master data kelas halaqah per jenjang." />
      <FormNotice ok={sp.ok} error={sp.error} />

      <Card className="p-4 sm:p-5">
        <h2 className="font-display text-[15px] font-semibold">
          {editing ? "Ubah kelas" : "Tambah kelas"}
        </h2>
        <form action={upsertKelas} className="mt-3 grid gap-3 sm:grid-cols-3">
          {editing ? <input type="hidden" name="id" value={editing.id} /> : null}
          <Field label="Jenjang">
            <EnumSelect
              name="jenjang"
              defaultValue={editing?.jenjang ?? "reguler"}
              options={[
                { value: "reguler", label: "Reguler" },
                { value: "intensif", label: "Intensif" },
                { value: "dewasa", label: "Dewasa" },
              ]}
            />
          </Field>
          <Field label="Nama kelas">
            <Input name="nama_kelas" defaultValue={editing?.nama_kelas ?? ""} placeholder="cth. Reguler A" />
          </Field>
          <Field label="Jadwal mulai">
            <Input name="jadwal_mulai" defaultValue={editing?.jadwal_mulai ?? ""} placeholder="cth. Senin 16.00" />
          </Field>
          <div className="flex items-end gap-2 sm:col-span-3">
            <Button type="submit" size="sm">{editing ? "Simpan" : "Tambah"}</Button>
            {editing ? (
              <a href="/portal/kelas">
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
                  <TableHead>Nama kelas</TableHead>
                  <TableHead>Jenjang</TableHead>
                  <TableHead className="hidden md:table-cell">Jadwal</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.nama_kelas ?? "—"}</TableCell>
                  <TableCell>{humanize(r.jenjang)}</TableCell>
                  <TableCell className="hidden md:table-cell">{r.jadwal_mulai ?? "—"}</TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex gap-1">
                      <a href={`/portal/kelas?edit=${r.id}`}>
                        <Button variant="ghost" size="sm" type="button">Ubah</Button>
                      </a>
                      <form action={deleteKelas}>
                        <input type="hidden" name="id" value={r.id} />
                        <DeleteButton message="Hapus kelas ini? Santri & penugasan terkait ikut terhapus (cascade)." />
                      </form>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Empty />
        )}
      </Card>
    </div>
  );
}
