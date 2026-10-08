import {
  Activity,
  BookOpenCheck,
  ClipboardCheck,
  NotebookPen,
  UserRound,
  Users,
} from "lucide-react";
import {
  DonutChart,
  KehadiranChart,
  KelasChart,
} from "@/components/portal/charts";
import { EnumSelect } from "@/components/portal/fields";
import { Reveal } from "@/components/portal/motion";
import {
  Empty,
  PageHeader,
  SetupNotice,
  StatCard,
} from "@/components/portal/ui";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Absensi } from "@/lib/portal";
import { dayKey, fmtTanggal, getDashboard, humanize } from "@/lib/portal";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/server";

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
  const [d, pengajarRes, recentRes] = await Promise.all([
    getDashboard(days, kelasId, db),
    db
      .from("pengguna")
      .select("id", { count: "exact", head: true })
      .eq("peran", "pengajar"),
    db
      .from("absensi")
      .select("id,tanggal,status,santri:santri_id(nama)")
      .order("tanggal", { ascending: false })
      .limit(6),
  ]);
  const totalPengajar = pengajarRes.count ?? 0;
  const recent = (recentRes.data ?? []) as unknown as (Pick<
    Absensi,
    "id" | "tanggal" | "status"
  > & {
    santri: { nama: string } | null;
  })[];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ringkasan"
        description="Pantauan Rumah Qur'an Mubarak pada hari ini"
      />

      <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
        <StatCard
          hero
          label="Total Santri"
          value={String(d.totalSantri)}
          icon={Users}
          countTo={d.totalSantri}
          delay={0}
        />
        <StatCard
          hero
          label="Total Pengajar"
          value={String(totalPengajar)}
          icon={UserRound}
          countTo={totalPengajar}
          delay={0.06}
        />
        <StatCard
          hero
          label="Kelas Aktif"
          value={String(d.totalKelas)}
          icon={BookOpenCheck}
          countTo={d.totalKelas}
          delay={0.12}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        <StatCard
          label="Kehadiran"
          value={`${d.kehadiran}%`}
          sub={`${d.absensi} baris absensi`}
          icon={ClipboardCheck}
          countTo={d.kehadiran}
          suffix="%"
          delay={0.14}
        />
        <StatCard
          label="Setoran (total)"
          value={String(d.setoran)}
          sub="ziyadah · murajaah"
          icon={NotebookPen}
          countTo={d.setoran}
          delay={0.18}
        />
        <StatCard
          label="Santri pernah setor"
          value={String(d.santriAktif)}
          sub="sepanjang waktu"
          icon={Activity}
          countTo={d.santriAktif}
          delay={0.22}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[13px] text-[#6b7a6e]">
          Kehadiran {days} hari terakhir ({fmtTanggal(d.from)} –{" "}
          {fmtTanggal(d.to)}). Setoran sepanjang waktu.
        </p>
        <form method="get" className="flex items-center gap-2">
          {kelasId ? (
            <input type="hidden" name="kelas" value={kelasId} />
          ) : null}
          <EnumSelect
            name="range"
            defaultValue={String(days)}
            options={RANGES.map((r) => ({
              value: String(r),
              label: `${r} hari`,
            }))}
            className="w-28"
          />
          <Button variant="outline" size="sm" type="submit">
            Tampilkan
          </Button>
        </form>
      </div>

      <Reveal delay={0.1}>
        <Card className="border-white/60 bg-white/80 p-4 backdrop-blur-sm sm:p-5">
          <h2 className="font-display text-[15px] font-semibold">
            Tren kehadiran harian
          </h2>
          {d.tren.some((t) => t.total > 0) ? (
            <div className="mt-3">
              <KehadiranChart data={d.tren} />
            </div>
          ) : (
            <div className="mt-3">
              <Empty text="Belum ada absensi di rentang ini." />
            </div>
          )}
        </Card>
      </Reveal>

      <div className="grid gap-3 sm:gap-4 lg:grid-cols-5">
        <Reveal delay={0.14} className="lg:col-span-2">
          <Card className="h-full border-white/60 bg-white/80 p-4 backdrop-blur-sm sm:p-5">
            <h2 className="font-display text-[15px] font-semibold">
              Setoran per jenis
            </h2>
            <div className="mt-3">
              <DonutChart
                data={d.perJenis.map((t) => ({
                  label: t.jenis,
                  value: t.jumlah,
                }))}
              />
            </div>
          </Card>
        </Reveal>
        <Reveal delay={0.18} className="lg:col-span-3">
          <Card className="h-full border-white/60 bg-white/80 p-4 backdrop-blur-sm sm:p-5">
            <h2 className="font-display text-[15px] font-semibold">
              Santri per kelas
            </h2>
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
        <Card className="border-white/60 bg-white/80 p-4 backdrop-blur-sm sm:p-5">
          <h2 className="font-display text-[15px] font-semibold">
            Absensi terbaru
          </h2>
          {recent.length ? (
            <ul className="mt-3 space-y-2 text-[13px]">
              {recent.map((m) => (
                <li
                  key={m.id}
                  className="flex flex-wrap justify-between gap-2 border-b border-[#eef4ec] pb-2 last:border-0"
                >
                  <span className="font-medium text-[#1d2b21]">
                    {m.santri?.nama ?? "—"}
                    <span className="ml-2 font-normal text-[#6b7a6e]">
                      {humanize(m.status)}
                    </span>
                  </span>
                  <span className="text-[#6b7a6e]">
                    {fmtTanggal(dayKey(m.tanggal))}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-3">
              <Empty text="Belum ada absensi tercatat." />
            </div>
          )}
        </Card>
      </Reveal>
    </div>
  );
}
