import { DeleteButton } from "@/components/portal/delete-button";
import { Combobox } from "@/components/portal/fields";
import { OfflineForm } from "@/components/portal/offline";
import {
  AvatarNama,
  Empty,
  Field,
  FormNotice,
  PageHeader,
  Panel,
  PanelHeader,
} from "@/components/portal/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { deleteSantri, upsertSantri } from "@/lib/actions";
import { capaian, type Kelas, type Mutabaah, type Santri } from "@/lib/portal";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function SantriPage({
  searchParams,
}: {
  searchParams: Promise<{
    ok?: string;
    error?: string;
    edit?: string;
    tambah?: string;
    cari?: string;
  }>;
}) {
  const sp = await searchParams;
  const db = createAdminClient();
  const [santriRes, kelasRes, setoranRes] = await Promise.all([
    db
      .from("santri")
      .select("*,kelas:kelas_id(id,nama_kelas,jenjang)")
      .order("nama")
      .limit(500),
    db.from("kelas").select("id,nama_kelas").order("nama_kelas"),
    // ponytail: mutabaah tanpa kolom tanggal di skema, jadi "terakhir" = urutan query.
    // Basis persen belum ada — pakai rasio min(setoran/30, 1); ganti bila ada target juz.
    db
      .from("mutabaah")
      .select("santri_id,quran_juz,quran_surat,from_ayat,to_ayat")
      .limit(2000),
  ]);
  const all = (santriRes.data ?? []) as unknown as Santri[];
  const kelas = (kelasRes.data ?? []) as Pick<Kelas, "id" | "nama_kelas">[];
  const q = (sp.cari ?? "").toLowerCase();
  const rows = q ? all.filter((s) => s.nama.toLowerCase().includes(q)) : all;
  const editing = sp.edit ? all.find((r) => r.id === sp.edit) : undefined;
  const showForm = Boolean(editing || sp.tambah);

  type Setoran = Pick<
    Mutabaah,
    "santri_id" | "quran_juz" | "quran_surat" | "from_ayat" | "to_ayat"
  >;
  const setoranBySantri = new Map<string, Setoran[]>();
  for (const m of (setoranRes.data ?? []) as Setoran[]) {
    if (!m.santri_id) continue;
    const list = setoranBySantri.get(m.santri_id);
    if (list) list.push(m);
    else setoranBySantri.set(m.santri_id, [m]);
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Kelola Data Santri"
        description="Master data santri. Klik nama untuk membuka rapor per santri."
      />
      <FormNotice ok={sp.ok} error={sp.error} />

      <Panel>
        <PanelHeader
          title="Data Santri"
          meta={`${all.length} santri terdaftar`}
        />

        <form method="get" className="mt-5 flex items-center gap-2">
          <Input
            name="cari"
            placeholder="Cari data santri…"
            defaultValue={sp.cari ?? ""}
            className="h-10 rounded-xl border-[#d8e2d6] bg-white"
          />
          <Button
            variant="outline"
            size="sm"
            type="submit"
            className="h-10 shrink-0 rounded-xl"
          >
            Cari
          </Button>
        </form>

        {showForm ? (
          <div className="mt-4 rounded-2xl border border-[#d8e2d6] bg-[#fafcfa] p-4 sm:p-5">
            <h3 className="font-display text-[15px] font-semibold text-[#1d2b21]">
              {editing ? "Ubah santri" : "Tambah santri"}
            </h3>
            <OfflineForm
              resource="santri"
              op="upsert"
              action={upsertSantri}
              className="mt-3 grid gap-3 sm:grid-cols-2"
            >
              {editing ? (
                <input type="hidden" name="id" value={editing.id} />
              ) : null}
              <Field label="Nama">
                <Input
                  name="nama"
                  required
                  defaultValue={editing?.nama ?? ""}
                />
              </Field>
              <Field label="Kelas">
                <Combobox
                  name="kelas_id"
                  defaultValue={editing?.kelas_id ?? ""}
                  placeholder="— Tanpa kelas —"
                  searchPlaceholder="Cari kelas…"
                  options={kelas.map((k) => ({
                    value: k.id,
                    label: k.nama_kelas ?? "Tanpa nama",
                  }))}
                />
              </Field>
              <Field label="No. telepon">
                <Input
                  name="no_telepon"
                  defaultValue={editing?.no_telepon ?? ""}
                />
              </Field>
              <Field label="Alamat">
                <Textarea
                  name="alamat"
                  rows={2}
                  defaultValue={editing?.alamat ?? ""}
                />
              </Field>
              <div className="flex items-end gap-2 sm:col-span-2">
                <Button type="submit" size="sm">
                  {editing ? "Simpan" : "Tambah"}
                </Button>
                <a href="/portal/santri">
                  <Button variant="outline" size="sm" type="button">
                    Batal
                  </Button>
                </a>
              </div>
            </OfflineForm>
          </div>
        ) : (
          <div className="mt-4">
            <a href="/portal/santri?tambah=1">
              <Button type="button" size="sm">
                + Tambah Santri
              </Button>
            </a>
          </div>
        )}

        <div className="mt-6">
          {rows.length ? (
            <Table>
              <TableHeader>
                <TableRow className="border-[#eef4ec] hover:bg-transparent">
                  <TableHead className="text-[12px] font-medium text-[#6b7a6e]">
                    Nama
                  </TableHead>
                  <TableHead className="text-[12px] font-medium text-[#6b7a6e]">
                    Kelas
                  </TableHead>
                  <TableHead className="hidden text-[12px] font-medium text-[#6b7a6e] md:table-cell">
                    Progres Hafalan Terakhir
                  </TableHead>
                  <TableHead className="text-right text-[12px] font-medium text-[#6b7a6e]">
                    Aksi
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => {
                  const setoran = setoranBySantri.get(r.id) ?? [];
                  const terakhir = setoran.at(-1);
                  const pct = Math.round(
                    Math.min(setoran.length / 30, 1) * 100,
                  );
                  return (
                    <TableRow
                      key={r.id}
                      className="border-[#eef4ec] hover:bg-[#fafcfa]"
                    >
                      <TableCell className="py-3.5">
                        <a
                          href={`/portal/santri/${r.id}`}
                          className="group flex items-center gap-3"
                        >
                          <AvatarNama nama={r.nama} />
                          <span className="font-semibold text-[#1d2b21] group-hover:underline group-hover:decoration-[#bccfba] group-hover:underline-offset-2">
                            {r.nama}
                          </span>
                        </a>
                      </TableCell>
                      <TableCell className="py-3.5 text-[#4b5b4f]">
                        {r.kelas?.nama_kelas ?? "—"}
                      </TableCell>
                      <TableCell className="hidden py-3.5 md:table-cell">
                        <p className="text-[12px] text-[#4b5b4f]">
                          {terakhir
                            ? `${capaian(terakhir)} · ${setoran.length} setoran`
                            : "—"}
                        </p>
                        <div className="mt-1.5 h-1.5 w-40 max-w-full rounded-full bg-[#e4eee2]">
                          <div
                            className="h-full rounded-full bg-[#7d9b84]"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="py-3.5 text-right">
                        <div className="inline-flex gap-2">
                          <a href={`/portal/santri?edit=${r.id}`}>
                            <Button variant="outline" size="sm" type="button">
                              Edit
                            </Button>
                          </a>
                          <OfflineForm
                            resource="santri"
                            op="delete"
                            action={deleteSantri}
                          >
                            <input type="hidden" name="id" value={r.id} />
                            <DeleteButton
                              message={`Hapus ${r.nama} beserta seluruh riwayat absensi & setorannya?`}
                            />
                          </OfflineForm>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <Empty text={q ? "Tidak ada santri yang cocok." : undefined} />
          )}
        </div>
      </Panel>
    </div>
  );
}
