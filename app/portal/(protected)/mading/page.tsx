import { AlignLeft, Check, FileText, Heading, Image, Pencil, PenLine, Send, X } from "lucide-react";
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
import { CrudForm } from "@/components/portal/crud-dialog";
import { Combobox } from "@/components/portal/fields";
import { OfflineForm } from "@/components/portal/offline";
import { MadingImageField } from "@/components/portal/mading-image";
import { RichEditor } from "@/components/portal/rich-editor";
import { Empty, Field, FormNotice, PageHeader } from "@/components/portal/ui";
import { deleteMading, upsertMading } from "@/lib/actions";
import { fmtTanggal } from "@/lib/portal";
import { createAdminClient } from "@/lib/supabase/admin";
import type { MadingKonten, Pengguna } from "@/lib/portal";

export default async function MadingPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string; edit?: string; tambah?: string }>;
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
  const showForm = Boolean(editing || sp.tambah);

  return (
    <div className="space-y-5">
      <PageHeader title="Mading" description="Konten papan informasi (ref: refs/schema.sql)." />
      <FormNotice ok={sp.ok} error={sp.error} />

      <CrudForm
        title={editing ? "Ubah konten" : "Tambah konten"}
        fabLabel="Tambah konten"
        closeHref="/portal/mading"
        defaultOpen={showForm}
        wide
        expandable
      >
        <OfflineForm resource="mading" op="upsert" action={upsertMading} className="grid gap-3 sm:grid-cols-2">
          {editing ? <input type="hidden" name="id" value={editing.id} /> : null}
          <Field label="Judul" icon={Heading}>
            <Input name="judul" required defaultValue={editing?.judul ?? ""} />
          </Field>
          <Field label="Penulis (opsional)" icon={PenLine}>
            <Combobox
              name="penulis"
              defaultValue={editing?.penulis ?? ""}
              placeholder="—"
              searchPlaceholder="Cari penulis…"
              options={penulis.map((p) => ({ value: p.id, label: p.nama_lengkap }))}
            />
          </Field>
          <Field label="Deskripsi singkat" className="sm:col-span-2" icon={AlignLeft}>
            <Input name="deskripsi" defaultValue={editing?.deskripsi ?? ""} />
          </Field>
          <Field label="Isi" className="sm:col-span-2" icon={FileText}>
            <RichEditor defaultValue={editing?.konten ?? ""} />
          </Field>
          <Field label="Gambar sampul" className="sm:col-span-2" icon={Image}>
            <MadingImageField defaultUrl={editing?.thumb_url ?? ""} />
          </Field>
          <div className="flex items-end gap-2">
            <Button type="submit" size="sm">{editing ? <Check aria-hidden /> : <Send aria-hidden />}{editing ? "Simpan" : "Terbitkan"}</Button>
            {editing ? (
              <a href="/portal/mading">
                <Button variant="outline" size="sm" type="button"><X aria-hidden />Batal</Button>
              </a>
            ) : null}
          </div>
        </OfflineForm>
      </CrudForm>

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
                    <a href={`/portal/mading/${r.id}`} className="font-medium hover:underline">
                      {r.judul ?? "—"}
                    </a>
                    {r.deskripsi ? (
                      <p className="line-clamp-1 text-[12px] text-[#6b7a6e]">{r.deskripsi}</p>
                    ) : null}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{r.penulis_ref?.nama_lengkap ?? "—"}</TableCell>
                  <TableCell className="hidden whitespace-nowrap sm:table-cell">{fmtTanggal(r.created_at.slice(0, 10))}</TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex gap-1">
                      <a href={`/portal/mading?edit=${r.id}`}>
                        <Button variant="ghost" size="sm" type="button"><Pencil aria-hidden />Ubah</Button>
                      </a>
                      <OfflineForm resource="mading" op="delete" action={deleteMading}>
                        <input type="hidden" name="id" value={r.id} />
                        <DeleteButton message={`Hapus "${r.judul ?? "konten ini"}"?`} />
                      </OfflineForm>
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
