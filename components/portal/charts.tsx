"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { fmtTanggal, humanize } from "@/lib/portal";

const SAGE_DEEP = "#2c4232";
const SAGE = "#9db5a0";
const SAGE_PALE = "#d5e3d3";
const INK = "#1d2b21";

function shortDate(iso: string) {
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short" }).format(
    new Date(`${iso}T00:00:00`),
  );
}

/** Tren kehadiran harian: hadir (area penuh) vs tercatat (garis). */
export function KehadiranChart({
  data,
}: {
  data: { tanggal: string; hadir: number; total: number }[];
}) {
  const config: ChartConfig = {
    hadir: { label: "Hadir", color: SAGE_DEEP },
    total: { label: "Tercatat", color: SAGE },
  };
  return (
    <ChartContainer config={config} className="h-56 w-full">
      <AreaChart data={data} margin={{ left: -18, right: 8, top: 8 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="tanggal"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={28}
          tickFormatter={shortDate}
        />
        <YAxis tickLine={false} axisLine={false} allowDecimals={false} width={36} />
        <ChartTooltip content={<ChartTooltipContent labelFormatter={(_, p) => fmtTanggal(String(p?.[0]?.payload?.tanggal ?? ""))} />} />
        <Area dataKey="total" fill={SAGE_PALE} stroke={SAGE} strokeWidth={1.5} />
        <Area dataKey="hadir" fill={SAGE_DEEP} stroke={SAGE_DEEP} strokeWidth={2} fillOpacity={0.85} />
      </AreaChart>
    </ChartContainer>
  );
}

/** Donat dua-tiga irisan + legenda kustom (tooltip bawaan shadcn). */
export function DonutChart({
  data,
  colors = [INK, SAGE, SAGE_PALE],
}: {
  data: { label: string; value: number }[];
  colors?: string[];
}) {
  const config: ChartConfig = Object.fromEntries(
    data.map((d, i) => [d.label, { label: humanize(d.label), color: colors[i % colors.length] }]),
  );
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <div>
      <ChartContainer config={config} className="mx-auto h-44 w-full max-w-64">
        <PieChart>
          <ChartTooltip content={<ChartTooltipContent hideLabel />} />
          <Pie data={data} dataKey="value" nameKey="label" innerRadius="68%" outerRadius="92%" strokeWidth={2} stroke="#ffffff">
            {data.map((d, i) => (
              <Cell key={d.label} fill={colors[i % colors.length]} />
            ))}
          </Pie>
        </PieChart>
      </ChartContainer>
      <ul className="mt-2 space-y-1.5 text-[12px]">
        {data.map((d, i) => (
          <li key={d.label} className="flex items-center gap-2">
            <span
              aria-hidden
              className="size-2.5 shrink-0 rounded-full"
              style={{ background: colors[i % colors.length] }}
            />
            <span className="font-medium text-[#4b5b4f]">{humanize(d.label)}</span>
            <span className="ml-auto text-[#6b7a6e] tabular-nums">
              {d.value}
              {total > 0 ? ` · ${Math.round((d.value / total) * 100)}%` : ""}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Santri per kelas: batang horizontal. */
export function KelasChart({ data }: { data: { nama: string; santri: number }[] }) {
  const config: ChartConfig = { santri: { label: "Santri", color: SAGE_DEEP } };
  return (
    <ChartContainer config={config} className="h-48 w-full">
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 12 }}>
        <CartesianGrid horizontal={false} strokeDasharray="3 3" />
        <XAxis type="number" tickLine={false} axisLine={false} allowDecimals={false} />
        <YAxis
          type="category"
          dataKey="nama"
          tickLine={false}
          axisLine={false}
          width={92}
          tick={{ fontSize: 12 }}
        />
        <ChartTooltip content={<ChartTooltipContent hideLabel />} cursor={{ fill: "#eef4ec" }} />
        <Bar dataKey="santri" fill={SAGE_DEEP} radius={[0, 6, 6, 0]} barSize={18} />
      </BarChart>
    </ChartContainer>
  );
}
