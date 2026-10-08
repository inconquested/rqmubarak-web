import { DeleteButton } from "@/components/portal/delete-button";
import { EnumSelect } from "@/components/portal/fields";
import { OfflineForm } from "@/components/portal/offline";
import {
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
import { deleteKelas, upsertKelas } from "@/lib/actions";
import type { Kelas } from "@/lib/portal";
import { enumOptions, humanize, KELAS_JENJANG } from "@/lib/portal";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function KelasPage({
  searchParams,
}: {
  searchParams: Promise<{
    ok?: string;
    error?: string;
    edit?: string;
    tambah?: string;
  }>;
}) {
  const sp = await searchParams;
  const db = createAdminClient();
  const { data } = await db.from("kelas").select("*").order("nama_kelas");
  const rows = (data ?? []) as Kelas[];
  const editing = sp.edit ? rows.find((r) => r.id === sp.edit) : undefined;
  const showForm = Boolean(editing || sp.tambah);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Kelola Data Kelas"
        description="Master data kelas halaqah per jenjang."
      />
      <FormNotice ok={sp.ok} error={sp.error} />

      <Panel>
        <PanelHeader
          title="Data Kelas"
          meta={`${rows.length} kelas terdaftar`}
        />

        {showForm ? (
          <div className="mt-5 rounded-2xl border border-[#d8e2d6] bg-[#fafcfa] p-4 sm:p-5">
            <h3 className="font-display text-[15px] font-semibold text-[#1d2b21]">
              {editing ? "Ubah kelas" : "Tambah kelas"}
            </h3>
            <OfflineForm
              resource="kelas"
              op="upsert"
              action={upsertKelas}
              className="mt-3 grid gap-3 sm:grid-cols-3"
            >
              {editing ? (
                <input type="hidden" name="id" value={editing.id} />
              ) : null}
              <Field label="Jenjang">
                <EnumSelect
                  name="jenjang"
                  defaultValue={editing?.jenjang ?? "reguler"}
                  options={enumOptions(KELAS_JENJANG)}
                />
              </Field>
              <Field label="Nama kelas">
                <Input
                  name="nama_kelas"
                  defaultValue={editing?.nama_kelas ?? ""}
                  placeholder="cth. Reguler A"
                />
              </Field>
              <Field label="Jadwal mulai">
                <Input
                  name="jadwal_mulai"
                  defaultValue={editing?.jadwal_mulai ?? ""}
                  placeholder="cth. Senin 16.00"
                />
              </Field>
              <div className="flex items-end gap-2 sm:col-span-3">
                <Button type="submit" size="sm">
                  {editing ? "Simpan" : "Tambah"}
                </Button>
                <a href="/portal/kelas">
                  <Button variant="outline" size="sm" type="button">
                    Batal
                  </Button>
                </a>
              </div>
            </OfflineForm>
          </div>
        ) : (
          <div className="mt-5">
            <a href="/portal/kelas?tambah=1">
              <Button type="button" size="sm">
                + Tambah Kelas
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
                    Nama kelas
                  </TableHead>
                  <TableHead className="text-[12px] font-medium text-[#6b7a6e]">
                    Jenjang
                  </TableHead>
                  <TableHead className="hidden text-[12px] font-medium text-[#6b7a6e] md:table-cell">
                    Jadwal
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
                    <TableCell className="py-3.5 font-semibold text-[#1d2b21]">
                      {r.nama_kelas ?? "—"}
                    </TableCell>
                    <TableCell className="py-3.5">
                      {r.jenjang ? (
                        <StatusBadge status={r.jenjang} />
                      ) : (
                        humanize(r.jenjang)
                      )}
                    </TableCell>
                    <TableCell className="hidden py-3.5 text-[#4b5b4f] md:table-cell">
                      {r.jadwal_mulai ?? "—"}
                    </TableCell>
                    <TableCell className="py-3.5 text-right">
                      <div className="inline-flex gap-2">
                        <a href={`/portal/kelas?edit=${r.id}`}>
                          <Button variant="outline" size="sm" type="button">
                            Edit
                          </Button>
                        </a>
                        <OfflineForm
                          resource="kelas"
                          op="delete"
                          action={deleteKelas}
                        >
                          <input type="hidden" name="id" value={r.id} />
                          <DeleteButton message="Hapus kelas ini? Santri & penugasan terkait ikut terhapus (cascade)." />
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
        </div>
      </Panel>
    </div>
  );
}
