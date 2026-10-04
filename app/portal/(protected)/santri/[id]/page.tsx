import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DonutChart } from "@/components/portal/charts";
import { Empty, PageHeader, StatCard } from "@/components/portal/ui";
import { ABSENSI_STATUS, MUTABAAH_JENIS, capaian, dayKey, fmtTanggal, humanize } from "@/lib/portal";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Absensi, Mutabaah, Santri } from "@/lib/portal";

/** Rapor per santri: profil + ringkasan absensi + riwayat setoran. */
export default async function RaporPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const db = createAdminClient();
  const [santriRes, absRes, mutRes] = await Promise.all([
    db.from("santri").select("*,kelas:kelas_id(id,nama_kelas,jenjang)").eq("id", id).maybeSingle(),
    db.from("absensi").select("*").eq("santri_id", id).order("tanggal", { ascending: false }).limit(200),
    db.from("mutabaah").select("*").eq("santri_id", id).limit(200),
  ]);
  const santri = santriRes.data as unknown as (Santri | null);
  if (!santri) notFound();
  const abs = (absRes.data ?? []) as Absensi[];
  const mut = (mutRes.data ?? []) as Mutabaah[];
  const hadir = abs.filter((a) => a.status === "hadir").length;
  const juzMax = mut.reduce((m, x) => Math.max(m, x.quran_juz ?? 0), 0);

  return (
    <div className="space-y-5">
      <PageHeader
        title={santri.nama}
        description={`${santri.kelas?.nama_kelas ?? "Tanpa kelas"}${santri.no_telepon ? ` · ${santri.no_telepon}` : ""}${santri.alamat ? ` · ${santri.alamat}` : ""}`}
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          label="Kehadiran"
          value={abs.length ? `${Math.round((hadir / abs.length) * 100)}%` : "—"}
          sub={`${hadir} hadir dari ${abs.length} tercatat`}
        />
        <StatCard label="Total setoran" value={String(mut.length)} sub="ziyadah · murajaah" />
        <StatCard label="Juz tertinggi" value={juzMax ? `Juz ${juzMax}` : "—"} sub="dari riwayat mutabaah" />
        <StatCard
          label="Absensi terakhir"
          value={abs[0] ? fmtTanggal(dayKey(abs[0].tanggal)) : "—"}
          sub={abs[0]?.status ? humanize(abs[0].status) : undefined}
        />
      </div>

      <div className="grid gap-3 sm:gap-4 lg:grid-cols-2">
        <Card className="p-4 sm:p-5">
          <h2 className="font-display text-[15px] font-semibold">Komposisi absensi</h2>
          <div className="mt-3">
            {abs.length ? (
              <DonutChart data={ABSENSI_STATUS.map((s) => ({ label: s, value: abs.filter((a) => a.status === s).length }))} />
            ) : (
              <Empty text="Belum ada absensi." />
            )}
          </div>
          <h2 className="font-display mt-5 text-[15px] font-semibold">Komposisi setoran</h2>
          <div className="mt-3">
            {mut.length ? (
              <DonutChart
                data={MUTABAAH_JENIS.map((t) => ({ label: t, value: mut.filter((m) => m.jenis === t).length }))}
                colors={["#2c4232", "#bccfba"]}
              />
            ) : (
              <Empty text="Belum ada setoran." />
            )}
          </div>
        </Card>

        <Card className="p-4 sm:p-5">
          <h2 className="font-display text-[15px] font-semibold">Riwayat setoran</h2>
          {mut.length ? (
            <Table className="mt-2">
              <TableHeader>
                <TableRow>
                  <TableHead>Jenis</TableHead>
                  <TableHead>Capaian</TableHead>
                  <TableHead>Nilai</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mut.slice(0, 30).map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>{humanize(m.jenis)}</TableCell>
                    <TableCell className="text-[13px]">{capaian(m)}</TableCell>
                    <TableCell>{humanize(m.nilai)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="mt-3"><Empty /></div>
          )}
        </Card>
      </div>

      <Card className="p-4 sm:p-5">
        <h2 className="font-display text-[15px] font-semibold">Riwayat absensi</h2>
        {abs.length ? (
          <Table className="mt-2">
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {abs.slice(0, 60).map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="whitespace-nowrap">{fmtTanggal(dayKey(a.tanggal))}</TableCell>
                  <TableCell>{humanize(a.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="mt-3"><Empty /></div>
        )}
      </Card>
    </div>
  );
}
