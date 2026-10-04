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
import { Empty, Field, FormNotice, PageHeader, StatusBadge } from "@/components/portal/ui";
import { deletePengguna, upsertPengguna } from "@/lib/portal-actions";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Pengguna } from "@/lib/portal";

export default async function PenggunaPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string; edit?: string }>;
}) {
  const sp = await searchParams;
  const db = createAdminClient();
  const { data } = await db.from("pengguna").select("*").order("nama_lengkap");
  const rows = (data ?? []) as Pengguna[];
  const editing = sp.edit ? rows.find((r) => r.id === sp.edit) : undefined;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Pengguna"
        description="Buat akun login pengajar langsung di sini (email + kata sandi). ID baris mengikuti Auth UID otomatis."
      />
      <FormNotice ok={sp.ok} error={sp.error} />

      <Card className="p-4 sm:p-5">
        <h2 className="font-display text-[15px] font-semibold">
          {editing ? "Ubah pengguna" : "Tambah pengguna"}
        </h2>
        <form action={upsertPengguna} className="mt-3 grid gap-3 sm:grid-cols-2">
          {editing ? <input type="hidden" name="id" value={editing.id} /> : null}
          <Field label={editing ? "Kata sandi baru (opsional)" : "Kata sandi"}>
            <Input
              name="password"
              type="password"
              required={!editing}
              minLength={6}
              autoComplete="new-password"
              placeholder={editing ? "Kosongkan bila tidak diubah" : "Min. 6 karakter"}
            />
          </Field>
          <Field label="Nama lengkap">
            <Input name="nama_lengkap" required defaultValue={editing?.nama_lengkap ?? ""} />
          </Field>
          <Field label="Email">
            <Input name="email" type="email" required defaultValue={editing?.email ?? ""} />
          </Field>
          <Field label="No. telepon">
            <Input name="no_telepon" defaultValue={editing?.no_telepon ?? ""} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Peran">
              <EnumSelect
                name="peran"
                defaultValue={editing?.peran ?? "pengajar"}
                options={[
                  { value: "pengajar", label: "Pengajar" },
                  { value: "pemilik", label: "Pemilik" },
                  { value: "tak_dikenal", label: "Tak dikenal" },
                ]}
              />
            </Field>
            <Field label="Status">
              <EnumSelect
                name="status"
                defaultValue={editing?.status ?? "aktif"}
                options={[
                  { value: "aktif", label: "Aktif" },
                  { value: "nonaktif", label: "Nonaktif" },
                ]}
              />
            </Field>
          </div>
          <div className="flex items-end gap-2 sm:col-span-2">
            <Button type="submit" size="sm">{editing ? "Simpan" : "Tambah"}</Button>
            {editing ? (
              <a href="/portal/pengguna">
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
                  <TableHead className="hidden sm:table-cell">Email</TableHead>
                  <TableHead>Peran</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.nama_lengkap}</TableCell>
                  <TableCell className="hidden sm:table-cell">{r.email ?? "—"}</TableCell>
                  <TableCell><StatusBadge status={r.peran} /></TableCell>
                  <TableCell><StatusBadge status={r.status} /></TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex gap-1">
                      <a href={`/portal/pengguna?edit=${r.id}`}>
                        <Button variant="ghost" size="sm" type="button">Ubah</Button>
                      </a>
                      <form action={deletePengguna}>
                        <input type="hidden" name="id" value={r.id} />
                        <DeleteButton message={`Hapus ${r.nama_lengkap}? Penugasan & riwayatnya ikut terhapus (cascade).`} />
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
