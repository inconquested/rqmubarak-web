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
  StatusBadge,
} from "@/components/portal/ui";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deleteMengajar, upsertMengajar } from "@/lib/actions";
import type { Kelas, Mengajar, Pengguna, Santri } from "@/lib/portal";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function MengajarPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string; tambah?: string }>;
}) {
  const sp = await searchParams;
  const db = createAdminClient();
  const [rowsRes, usersRes, kelasRes, santriRes] = await Promise.all([
    db
      .from("mengajar")
      .select(
        "id,pengajar:pengajar_id(id,nama_lengkap),kelas:kelas_id(id,nama_kelas,jenjang)",
      ),
    db
      .from("pengguna")
      .select("id,nama_lengkap")
      .eq("status", "aktif")
      .order("nama_lengkap"),
    db
      .from("kelas")
      .select("id,nama_kelas,jenjang,jadwal_mulai")
      .order("nama_kelas"),
    db.from("santri").select("id,kelas_id").limit(1000),
  ]);
  const rows = (rowsRes.data ?? []) as unknown as Mengajar[];
  const users = (usersRes.data ?? []) as Pick<
    Pengguna,
    "id" | "nama_lengkap"
  >[];
  const kelas = (kelasRes.data ?? []) as Pick<
    Kelas,
    "id" | "nama_kelas" | "jenjang" | "jadwal_mulai"
  >[];
  const santri = (santriRes.data ?? []) as Pick<Santri, "id" | "kelas_id">[];
  const kelasById = new Map(kelas.map((k) => [k.id, k]));
  const santriCount = new Map<string, number>();
  for (const s of santri) {
    if (!s.kelas_id) continue;
    santriCount.set(s.kelas_id, (santriCount.get(s.kelas_id) ?? 0) + 1);
  }
  const showForm = Boolean(sp.tambah);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Kelola Data Mengajar"
        description="Penugasan pengajar ke kelas — penentu scope data di aplikasi pengajar."
      />
      <FormNotice ok={sp.ok} error={sp.error} />

      <Panel>
        <PanelHeader
          title="Data Mengajar"
          meta={`${rows.length} penugasan aktif`}
        />

        {showForm ? (
          <div className="mt-5 rounded-2xl border border-[#d8e2d6] bg-[#fafcfa] p-4 sm:p-5">
            <h3 className="font-display text-[15px] font-semibold text-[#1d2b21]">
              Tambah penugasan
            </h3>
            <OfflineForm
              resource="mengajar"
              op="upsert"
              action={upsertMengajar}
              className="mt-3 grid gap-3 sm:grid-cols-3"
            >
              <Field label="Pengajar">
                <Combobox
                  name="pengajar_id"
                  required
                  placeholder="Pilih pengajar"
                  searchPlaceholder="Cari pengajar…"
                  options={users.map((u) => ({
                    value: u.id,
                    label: u.nama_lengkap,
                  }))}
                />
              </Field>
              <Field label="Kelas">
                <Combobox
                  name="kelas_id"
                  placeholder="— Tanpa kelas —"
                  searchPlaceholder="Cari kelas…"
                  options={kelas.map((k) => ({
                    value: k.id,
                    label: k.nama_kelas ?? "Tanpa nama",
                  }))}
                />
              </Field>
              <div className="flex items-end gap-2">
                <Button type="submit" size="sm">
                  Tugaskan
                </Button>
                <a href="/portal/mengajar">
                  <Button variant="outline" size="sm" type="button">
                    Batal
                  </Button>
                </a>
              </div>
            </OfflineForm>
          </div>
        ) : (
          <div className="mt-5">
            <a href="/portal/mengajar?tambah=1">
              <Button type="button" size="sm">
                + Tambah Penugasan
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
                    Pengajar
                  </TableHead>
                  <TableHead className="hidden text-[12px] font-medium text-[#6b7a6e] md:table-cell">
                    Jadwal
                  </TableHead>
                  <TableHead className="text-[12px] font-medium text-[#6b7a6e]">
                    Santri
                  </TableHead>
                  <TableHead className="text-[12px] font-medium text-[#6b7a6e]">
                    Jenis
                  </TableHead>
                  <TableHead className="text-right text-[12px] font-medium text-[#6b7a6e]">
                    Aksi
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => {
                  const k = r.kelas?.id ? kelasById.get(r.kelas.id) : undefined;
                  return (
                    <TableRow
                      key={r.id}
                      className="border-[#eef4ec] hover:bg-[#fafcfa]"
                    >
                      <TableCell className="py-3.5 font-semibold text-[#1d2b21]">
                        {r.kelas?.nama_kelas ?? "—"}
                      </TableCell>
                      <TableCell className="py-3.5">
                        {r.pengajar ? (
                          <div className="flex items-center gap-3">
                            <AvatarNama
                              nama={r.pengajar.nama_lengkap}
                              className="size-8 text-[11px]"
                            />
                            <span className="text-[#4b5b4f]">
                              {r.pengajar.nama_lengkap}
                            </span>
                          </div>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell className="hidden py-3.5 text-[#4b5b4f] md:table-cell">
                        {k?.jadwal_mulai ?? "—"}
                      </TableCell>
                      <TableCell className="py-3.5 text-[#4b5b4f] tabular-nums">
                        {r.kelas?.id ? (santriCount.get(r.kelas.id) ?? 0) : "—"}
                      </TableCell>
                      <TableCell className="py-3.5">
                        {k?.jenjang ? <StatusBadge status={k.jenjang} /> : "—"}
                      </TableCell>
                      <TableCell className="py-3.5 text-right">
                        <OfflineForm
                          resource="mengajar"
                          op="delete"
                          action={deleteMengajar}
                        >
                          <input type="hidden" name="id" value={r.id} />
                          <DeleteButton
                            label="Hapus"
                            message="Lepas penugasan ini?"
                          />
                        </OfflineForm>
                      </TableCell>
                    </TableRow>
                  );
                })}
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
