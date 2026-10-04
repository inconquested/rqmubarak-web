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
import { MadingImageField } from "@/components/portal/mading-image";
import { Empty, Field, FormNotice, PageHeader } from "@/components/portal/ui";
import { deleteMading, upsertMading } from "@/lib/portal-actions";
import { fmtTanggal } from "@/lib/portal";
import { createAdminClient } from "@/lib/supabase/admin";
import type { MadingKonten, Pengguna } from "@/lib/portal";

export default async function MadingPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string; edit?: string }>;
}) {
  const sp = await searchParams;
  const db = createAdminClient();
  const [res, usersRes] = await Promise.all([
    db
      .from("MadingKonten")
      .select("*,penulis_ref:penulis(id,nama_lengkap)")
      .order("created_at", { ascending: false })
      .limit(200),
    db.from("pengguna").select("id,nama_lengkap").eq("status", "aktif").order("nama_lengkap"),
  ]);
  const rows = (res.data ?? []) as unknown as MadingKonten[];
  const penulis = (usersRes.data ?? []) as Pick<Pengguna, "id" | "nama_lengkap">[];
  const editing = sp.edit ? rows.find((r) => r.id === sp.edit) : undefined;

  return (
    <div className="space-y-5">
      <PageHeader title="Mading" description="Konten papan informasi (ref: refs/schema.sql)." />
      <FormNotice ok={sp.ok} error={sp.error} />

      <Card className="p-4 sm:p-5">
        <h2 className="font-display text-[15px] font-semibold">
          {editing ? "Ubah konten" : "Tambah konten"}
        </h2>
        <form action={upsertMading} className="mt-3 grid gap-3 sm:grid-cols-2">
          {editing ? <input type="hidden" name="id" value={editing.id} /> : null}
          <Field label="Judul">
            <Input name="judul" required defaultValue={editing?.judul ?? ""} />
          </Field>
          <Field label="Penulis (opsional)">
            <Combobox
              name="penulis"
              defaultValue={editing?.penulis ?? ""}
              placeholder="—"
              searchPlaceholder="Cari penulis…"
              options={penulis.map((p) => ({ value: p.id, label: p.nama_lengkap }))}
            />
          </Field>
          <Field label="Deskripsi singkat" className="sm:col-span-2">
            <Input name="deskripsi" defaultValue={editing?.deskripsi ?? ""} />
          </Field>
          <Field label="Isi" className="sm:col-span-2">
            <Textarea name="konten" rows={4} defaultValue={editing?.konten ?? ""} />
          </Field>
          <Field label="Gambar sampul" className="sm:col-span-2">
            <MadingImageField defaultUrl={editing?.thumb_url ?? ""} />
          </Field>
          <div className="flex items-end gap-2">
            <Button type="submit" size="sm">{editing ? "Simpan" : "Terbitkan"}</Button>
            {editing ? (
              <a href="/portal/mading">
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
                <TableHead>Judul</TableHead>
                <TableHead className="hidden md:table-cell">Penulis</TableHead>
                <TableHead className="hidden sm:table-cell">Dibuat</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    <p className="font-medium">{r.judul ?? "—"}</p>
                    {r.deskripsi ? (
                      <p className="line-clamp-1 text-[12px] text-[#6b7a6e]">{r.deskripsi}</p>
                    ) : null}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{r.penulis_ref?.nama_lengkap ?? "—"}</TableCell>
                  <TableCell className="hidden whitespace-nowrap sm:table-cell">{fmtTanggal(r.created_at.slice(0, 10))}</TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex gap-1">
                      <a href={`/portal/mading?edit=${r.id}`}>
                        <Button variant="ghost" size="sm" type="button">Ubah</Button>
                      </a>
                      <form action={deleteMading}>
                        <input type="hidden" name="id" value={r.id} />
                        <DeleteButton message={`Hapus "${r.judul ?? "konten ini"}"?`} />
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
