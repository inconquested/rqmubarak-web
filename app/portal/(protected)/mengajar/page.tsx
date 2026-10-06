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
import { Combobox } from "@/components/portal/fields";
import { OfflineForm } from "@/components/portal/offline";
import { Empty, Field, FormNotice, PageHeader } from "@/components/portal/ui";
import { deleteMengajar, upsertMengajar } from "@/lib/actions";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Kelas, Mengajar, Pengguna } from "@/lib/portal";

export default async function MengajarPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const sp = await searchParams;
  const db = createAdminClient();
  const [rowsRes, usersRes, kelasRes] = await Promise.all([
    db.from("mengajar").select("id,pengajar:pengajar_id(id,nama_lengkap),kelas:kelas_id(id,nama_kelas,jenjang)"),
    db.from("pengguna").select("id,nama_lengkap").eq("status", "aktif").order("nama_lengkap"),
    db.from("kelas").select("id,nama_kelas").order("nama_kelas"),
  ]);
  const rows = (rowsRes.data ?? []) as unknown as Mengajar[];
  const users = (usersRes.data ?? []) as Pick<Pengguna, "id" | "nama_lengkap">[];
  const kelas = (kelasRes.data ?? []) as Pick<Kelas, "id" | "nama_kelas">[];

  return (
    <div className="space-y-5">
      <PageHeader title="Mengajar" description="Penugasan pengajar ke kelas — penentu scope data di aplikasi pengajar." />
      <FormNotice ok={sp.ok} error={sp.error} />

      <Card className="p-4 sm:p-5">
        <h2 className="font-display text-[15px] font-semibold">Tambah penugasan</h2>
        <OfflineForm resource="mengajar" op="upsert" action={upsertMengajar} className="mt-3 grid gap-3 sm:grid-cols-3">
          <Field label="Pengajar">
            <Combobox
              name="pengajar_id"
              required
              placeholder="Pilih pengajar"
              searchPlaceholder="Cari pengajar…"
              options={users.map((u) => ({ value: u.id, label: u.nama_lengkap }))}
            />
          </Field>
          <Field label="Kelas">
            <Combobox
              name="kelas_id"
              placeholder="— Tanpa kelas —"
              searchPlaceholder="Cari kelas…"
              options={kelas.map((k) => ({ value: k.id, label: k.nama_kelas ?? "Tanpa nama" }))}
            />
          </Field>
          <div className="flex items-end">
            <Button type="submit" size="sm">Tugaskan</Button>
          </div>
        </OfflineForm>
      </Card>

      <Card className="p-4 sm:p-5">
        {rows.length ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pengajar</TableHead>
                <TableHead>Kelas</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.pengajar?.nama_lengkap ?? "—"}</TableCell>
                  <TableCell>{r.kelas?.nama_kelas ?? "—"}</TableCell>
                  <TableCell className="text-right">
                    <OfflineForm resource="mengajar" op="delete" action={deleteMengajar}>
                      <input type="hidden" name="id" value={r.id} />
                      <DeleteButton label="Lepas" message="Lepas penugasan ini?" />
                    </OfflineForm>
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
