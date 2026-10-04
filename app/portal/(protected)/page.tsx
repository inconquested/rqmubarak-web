import { Activity, ClipboardCheck, NotebookPen, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DonutChart, KehadiranChart, KelasChart } from "@/components/portal/charts";
import { EnumSelect } from "@/components/portal/fields";
import { Reveal } from "@/components/portal/motion";
import { Empty, PageHeader, StatCard } from "@/components/portal/ui";
import { dayKey, fmtTanggal, getDashboard, humanize } from "@/lib/portal";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { SetupNotice } from "@/components/portal/ui";
import type { Absensi } from "@/lib/portal";

const RANGES = [7, 14, 30] as const;

export default async function PortalPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; kelas?: string }>;
}) {
  if (!isSupabaseConfigured()) return <SetupNotice />;
  const sp = await searchParams;
  const days = RANGES.includes(Number(sp.range) as (typeof RANGES)[number])
    ? Number(sp.range)
    : 30;
  const kelasId = sp.kelas || null;

  const db = createAdminClient();
  const d = await getDashboard(days, kelasId, db);

  const recentRes = await db
    .from("absensi")
    .select("id,tanggal,status,santri:santri_id(nama)")
    .order("tanggal", { ascending: false })
    .limit(6);
  const recent = (recentRes.data ?? []) as unknown as (Pick<Absensi, "id" | "tanggal" | "status"> & {
    santri: { nama: string } | null;
  })[];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Monitoring"
        description={`Kehadiran ${days} hari terakhir (${fmtTanggal(d.from)} – ${fmtTanggal(d.to)}). Setoran selalu sepanjang waktu (skema mutabaah tanpa tanggal).`}
        action={
          <form method="get" className="flex items-center gap-2">
            <EnumSelect
              name="range"
              defaultValue={String(days)}
              options={RANGES.map((r) => ({ value: String(r), label: `${r} hari` }))}
              className="w-28"
            />
            <Button variant="outline" size="sm" type="submit">
              Tampilkan
            </Button>
          </form>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard label="Total santri" value={String(d.totalSantri)} sub={`${d.totalKelas} kelas`} icon={Users} countTo={d.totalSantri} delay={0} />
        <StatCard label="Kehadiran" value={`${d.kehadiran}%`} sub={`${d.absensi} baris absensi`} icon={ClipboardCheck} countTo={d.kehadiran} suffix="%" delay={0.06} />
        <StatCard label="Setoran (total)" value={String(d.setoran)} sub="ziyadah · murajaah" icon={NotebookPen} countTo={d.setoran} delay={0.12} />
        <StatCard label="Santri pernah setor" value={String(d.santriAktif)} sub="sepanjang waktu" icon={Activity} countTo={d.santriAktif} delay={0.18} />
      </div>

      <Reveal delay={0.1}>
        <Card className="p-4 sm:p-5">
          <h2 className="font-display text-[15px] font-semibold">Tren kehadiran harian</h2>
          {d.tren.some((t) => t.total > 0) ? (
            <div className="mt-3">
              <KehadiranChart data={d.tren} />
            </div>
          ) : (
            <div className="mt-3"><Empty text="Belum ada absensi di rentang ini." /></div>
          )}
        </Card>
      </Reveal>

      <div className="grid gap-3 sm:gap-4 lg:grid-cols-5">
        <Reveal delay={0.14} className="lg:col-span-2">
          <Card className="h-full p-4 sm:p-5">
            <h2 className="font-display text-[15px] font-semibold">Setoran per jenis</h2>
            <div className="mt-3">
              <DonutChart data={d.perJenis.map((t) => ({ label: t.jenis, value: t.jumlah }))} />
            </div>
          </Card>
        </Reveal>
        <Reveal delay={0.18} className="lg:col-span-3">
          <Card className="h-full p-4 sm:p-5">
            <h2 className="font-display text-[15px] font-semibold">Santri per kelas</h2>
            <div className="mt-3">
              {d.perKelas.length ? (
                <KelasChart
                  data={d.perKelas.map((k) => ({
                    nama: k.nama_kelas ?? "Tanpa nama",
                    santri: k.santri,
                  }))}
                />
              ) : (
                <Empty text="Belum ada kelas. Tambahkan di menu Kelas." />
              )}
            </div>
          </Card>
        </Reveal>
      </div>

      <Reveal delay={0.2}>
        <Card className="p-4 sm:p-5">
          <h2 className="font-display text-[15px] font-semibold">Absensi terbaru</h2>
          {recent.length ? (
            <ul className="mt-3 space-y-2 text-[13px]">
              {recent.map((m) => (
                <li key={m.id} className="flex flex-wrap justify-between gap-2 border-b border-[#eef4ec] pb-2 last:border-0">
                  <span className="font-medium text-[#1d2b21]">
                    {m.santri?.nama ?? "—"}
                    <span className="ml-2 font-normal text-[#6b7a6e]">{humanize(m.status)}</span>
                  </span>
                  <span className="text-[#6b7a6e]">{fmtTanggal(dayKey(m.tanggal))}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-3"><Empty text="Belum ada absensi tercatat." /></div>
          )}
        </Card>
      </Reveal>
    </div>
  );
}
