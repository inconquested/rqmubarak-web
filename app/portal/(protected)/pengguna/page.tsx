import { DeleteButton } from "@/components/portal/delete-button";
import { EnumSelect } from "@/components/portal/fields";
import { OfflineForm } from "@/components/portal/offline";
import {
  AvatarNama,
  Empty,
  Field,
  FormNotice,
  PageHeader,
  Panel,
  PanelHeader,
  StatusBadge,
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
import { deletePengguna, upsertPengguna } from "@/lib/actions";
import type { Pengguna } from "@/lib/portal";
import { enumOptions, PERAN_PENGGUNA } from "@/lib/portal";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function PenggunaPage({
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
  const { data } = await db.from("pengguna").select("*").order("nama_lengkap");
  const all = (data ?? []) as Pengguna[];
  const q = (sp.cari ?? "").toLowerCase();
  const rows = q
    ? all.filter(
        (r) =>
          r.nama_lengkap.toLowerCase().includes(q) ||
          (r.email ?? "").toLowerCase().includes(q),
      )
    : all;
  const editing = sp.edit ? all.find((r) => r.id === sp.edit) : undefined;
  const showForm = Boolean(editing || sp.tambah);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Kelola Data Pengajar"
        description="Buat akun login pengajar langsung di sini (email + kata sandi)."
      />
      <FormNotice ok={sp.ok} error={sp.error} />

      <Panel>
        <PanelHeader
          title="Data Pengajar"
          meta={`${all.length} pengguna terdaftar`}
        />

        <form method="get" className="mt-5 flex items-center gap-2">
          <Input
            name="cari"
            placeholder="Cari data pengajar…"
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
              {editing ? "Ubah pengguna" : "Tambah pengguna"}
            </h3>
            <OfflineForm
              resource="pengguna"
              op="upsert"
              action={upsertPengguna}
              className="mt-3 grid gap-3 sm:grid-cols-2"
            >
              {editing ? (
                <input type="hidden" name="id" value={editing.id} />
              ) : null}
              <Field
                label={editing ? "Kata sandi baru (opsional)" : "Kata sandi"}
              >
                <Input
                  name="password"
                  type="password"
                  required={!editing}
                  minLength={6}
                  autoComplete="new-password"
                  placeholder={
                    editing ? "Kosongkan bila tidak diubah" : "Min. 6 karakter"
                  }
                />
              </Field>
              <Field label="Nama lengkap">
                <Input
                  name="nama_lengkap"
                  required
                  defaultValue={editing?.nama_lengkap ?? ""}
                />
              </Field>
              <Field label="Email">
                <Input
                  name="email"
                  type="email"
                  required
                  defaultValue={editing?.email ?? ""}
                />
              </Field>
              <Field label="No. telepon">
                <Input
                  name="no_telepon"
                  defaultValue={editing?.no_telepon ?? ""}
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Peran">
                  <EnumSelect
                    name="peran"
                    defaultValue={editing?.peran ?? "pengajar"}
                    options={enumOptions(PERAN_PENGGUNA)}
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
                <Button type="submit" size="sm">
                  {editing ? "Simpan" : "Tambah"}
                </Button>
                <a href="/portal/pengguna">
                  <Button variant="outline" size="sm" type="button">
                    Batal
                  </Button>
                </a>
              </div>
            </OfflineForm>
          </div>
        ) : (
          <div className="mt-4">
            <a href="/portal/pengguna?tambah=1">
              <Button type="button" size="sm">
                + Tambah Pengajar
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
                    Peran
                  </TableHead>
                  <TableHead className="hidden text-[12px] font-medium text-[#6b7a6e] sm:table-cell">
                    No. telepon
                  </TableHead>
                  <TableHead className="text-[12px] font-medium text-[#6b7a6e]">
                    Status
                  </TableHead>
                  <TableHead className="text-right text-[12px] font-medium text-[#6b7a6e]">
                    Aksi
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow
                    key={r.id}
                    className="border-[#eef4ec] hover:bg-[#fafcfa]"
                  >
                    <TableCell className="py-3.5">
                      <div className="flex items-center gap-3">
                        <AvatarNama nama={r.nama_lengkap} />
                        <span className="font-semibold text-[#1d2b21]">
                          {r.nama_lengkap}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3.5">
                      <StatusBadge status={r.peran} />
                    </TableCell>
                    <TableCell className="hidden py-3.5 text-[#4b5b4f] sm:table-cell">
                      {r.no_telepon ?? "—"}
                    </TableCell>
                    <TableCell className="py-3.5">
                      <StatusBadge status={r.status} />
                    </TableCell>
                    <TableCell className="py-3.5 text-right">
                      <div className="inline-flex gap-2">
                        <a href={`/portal/pengguna?edit=${r.id}`}>
                          <Button variant="outline" size="sm" type="button">
                            Edit
                          </Button>
                        </a>
                        <OfflineForm
                          resource="pengguna"
                          op="delete"
                          action={deletePengguna}
                        >
                          <input type="hidden" name="id" value={r.id} />
                          <DeleteButton
                            message={`Hapus ${r.nama_lengkap}? Penugasan & riwayatnya ikut terhapus (cascade).`}
                          />
                        </OfflineForm>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Empty text={q ? "Tidak ada pengguna yang cocok." : undefined} />
          )}
        </div>
      </Panel>
    </div>
  );
}
