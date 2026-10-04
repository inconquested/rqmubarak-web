import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, IconTile } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { BarGrow, CountUp, Reveal } from "@/components/portal/motion";
import { humanize } from "@/lib/portal";

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="font-display text-2xl font-medium tracking-tight text-[#1d2b21] sm:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-1 max-w-xl text-sm leading-relaxed text-[#6b7a6e]">
            {description}
          </p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

export function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  countTo,
  suffix,
  delay = 0,
}: {
  label: string;
  value: string;
  sub?: string;
  icon?: LucideIcon;
  countTo?: number;
  suffix?: string;
  delay?: number;
}) {
  return (
    <Reveal delay={delay}>
      <Card className="lift group h-full p-4 sm:p-5">
        <div className="flex items-center gap-2.5">
          {Icon ? (
            <IconTile className="lift-icon size-8 [&_svg]:size-4">
              <Icon aria-hidden />
            </IconTile>
          ) : null}
          <p className="text-[12px] font-medium text-[#6b7a6e]">{label}</p>
        </div>
        <p className="font-display mt-2 text-2xl font-medium text-[#1d2b21] tabular-nums sm:text-3xl">
          {countTo !== undefined ? <CountUp to={countTo} suffix={suffix} /> : value}
        </p>
        {sub ? (
          <p className="mt-1 text-[12px] leading-relaxed text-[#6b7a6e]">{sub}</p>
        ) : null}
      </Card>
    </Reveal>
  );
}

/** Grafik batang — tumbuh via scaleX, stagger 40ms per baris. */
export function Bars({ data }: { data: { label: string; value: number; hint?: string }[] }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="space-y-2.5">
      {data.map((d, i) => (
        <div key={d.label} title={`${d.label}: ${d.value}${d.hint ? ` (${d.hint})` : ""}`}>
          <div className="mb-1 flex items-baseline justify-between gap-2 text-[12px]">
            <span className="font-medium text-[#4b5b4f]">{humanize(d.label)}</span>
            <span className="text-[#6b7a6e] tabular-nums">
              {d.value}
              {d.hint ? ` · ${d.hint}` : null}
            </span>
          </div>
          <BarGrow ratio={d.value / max} delay={i * 0.04} />
        </div>
      ))}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge
      className={cn(
        (status === "hadir" || status === "mumtaz" || status === "aktif") &&
          "bg-[#e4eee2] text-[#2c4232]",
        (status === "alpa" || status === "nonaktif") && "bg-red-50 text-red-700",
        ["izin", "sakit", "jayyid", "murajaah"].includes(status) &&
          "bg-amber-50 text-amber-800",
        (status === "pemilik" || status === "ziyadah") && "bg-[#1d2b21] text-white",
      )}
    >
      <span>{humanize(status)}</span>
    </Badge>
  );
}

export function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label className="text-[13px] text-[#4b5b4f]">{label}</Label>
      {children}
    </div>
  );
}

export function FormNotice({ ok, error }: { ok?: string; error?: string }) {
  if (!ok && !error) return null;
  return (
    <p
      role={error ? "alert" : "status"}
      className={cn(
        "notice-in rounded-xl border px-3.5 py-2.5 text-[13px]",
        error
          ? "border-red-200 bg-red-50 text-red-700"
          : "border-[#d8e2d6] bg-[#eef4ec] text-[#2c4232]",
      )}
    >
      {error ?? ok}
    </p>
  );
}

export function SetupNotice() {
  return (
    <Card className="max-w-xl p-5 sm:p-6">
      <h2 className="font-display text-lg font-medium text-[#1d2b21]">
        Hubungkan Supabase dulu
      </h2>
      <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm leading-relaxed text-[#4b5b4f]">
        <li>
          Skema database sudah ada (<code className="rounded bg-[#eef4ec] px-1">supabase/schema_real.sql</code>).
        </li>
        <li>
          Copas <code className="rounded bg-[#eef4ec] px-1">.env.example</code> menjadi{" "}
          <code className="rounded bg-[#eef4ec] px-1">.env.local</code> lalu isi URL + anon key +{" "}
          <code className="rounded bg-[#eef4ec] px-1">service_role</code>, restart dev server.
        </li>
        <li>Masuk dengan akun pemilik (peran = pemilik, status = aktif).</li>
      </ol>
    </Card>
  );
}

export function Empty({ text = "Belum ada data." }: { text?: string }) {
  return (
    <p className="rounded-xl border border-dashed border-[#d8e2d6] bg-[#fafcfa] px-4 py-6 text-center text-[13px] text-[#6b7a6e]">
      {text}
    </p>
  );
}
