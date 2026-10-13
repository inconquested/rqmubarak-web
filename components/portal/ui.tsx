import type { LucideIcon } from "lucide-react";
import { BarGrow, CountUp, Reveal } from "@/components/portal/motion";
import { Badge } from "@/components/ui/badge";
import { Card, IconTile } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { humanize } from "@/lib/portal";
import { cn } from "@/lib/utils";

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
        <h1
          className={cn(
            "text-[#1d2b21]",
            "font-display text-2xl font-medium tracking-tight sm:text-3xl",
          )}
        >
          {title}
        </h1>
        {description ? (
          <p
            className={cn(
              "mt-1 max-w-xl",
              "text-[#6b7a6e]",
              "text-sm leading-relaxed",
            )}
          >
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
  hero = false,
}: {
  label: string;
  value: string;
  sub?: string;
  icon?: LucideIcon;
  countTo?: number;
  suffix?: string;
  delay?: number;
  /** Large dashboard-refs-style layout: icon left, big number above label. */
  hero?: boolean;
}) {
  if (hero) {
    return (
      <Reveal delay={delay} className="h-full">
        <Card
          className={cn(
            "flex h-full items-center gap-4 p-5 backdrop-blur-sm sm:p-6",
            "border-white/60 bg-white/80",
            "lift group",
          )}
        >
          {Icon ? (
            <IconTile className={cn("size-10 [&_svg]:size-5", "lift-icon")}>
              <Icon aria-hidden />
            </IconTile>
          ) : null}
          <div>
            <p
              className={cn(
                "text-[#1d2b21]",
                "font-display text-3xl font-semibold tabular-nums sm:text-4xl",
              )}
            >
              {countTo !== undefined ? (
                <CountUp to={countTo} suffix={suffix} />
              ) : (
                value
              )}
            </p>
            <p className={cn("mt-0.5", "text-[#6b7a6e]", "text-[12px] font-medium")}>
              {label}
            </p>
          </div>
        </Card>
      </Reveal>
    );
  }
  return (
    <Reveal delay={delay}>
      <Card className={cn("h-full p-4 sm:p-5", "lift group")}>
        <div className="flex items-center gap-2.5">
          {Icon ? (
            <IconTile className={cn("size-8 [&_svg]:size-4", "lift-icon")}>
              <Icon aria-hidden />
            </IconTile>
          ) : null}
          <p className={cn("text-[#6b7a6e]", "text-[12px] font-medium")}>{label}</p>
        </div>
        <p
          className={cn(
            "mt-2",
            "text-[#1d2b21]",
            "font-display text-2xl font-medium tabular-nums sm:text-3xl",
          )}
        >
          {countTo !== undefined ? (
            <CountUp to={countTo} suffix={suffix} />
          ) : (
            value
          )}
        </p>
        {sub ? (
          <p
            className={cn(
              "mt-1",
              "text-[#6b7a6e]",
              "text-[12px] leading-relaxed",
            )}
          >
            {sub}
          </p>
        ) : null}
      </Card>
    </Reveal>
  );
}

/** Bar chart — grows via scaleX, 40ms stagger per row. */
export function Bars({
  data,
}: {
  data: { label: string; value: number; hint?: string }[];
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="space-y-2.5">
      {data.map((d, i) => (
        <div
          key={d.label}
          title={`${d.label}: ${d.value}${d.hint ? ` (${d.hint})` : ""}`}
        >
          <div
            className={cn(
              "mb-1 flex items-baseline justify-between gap-2",
              "text-[12px]",
            )}
          >
            <span className={cn("text-[#4b5b4f]", "font-medium")}>
              {humanize(d.label)}
            </span>
            <span className={cn("text-[#6b7a6e]", "tabular-nums")}>
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
        ["hadir", "mumtaz", "aktif", "reguler", "intensif", "dewasa"].includes(
          status,
        ) && "bg-[#e4eee2] text-[#2c4232]",
        (status === "alpa" || status === "nonaktif") &&
          "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300",
        ["izin", "sakit", "jayyid", "murajaah"].includes(status) &&
          "bg-amber-50 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
        (status === "pemilik" || status === "ziyadah") &&
          "bg-[#1d2b21] text-white dark:bg-[#33513b] dark:text-[#e9f1ea]",
      )}
    >
      <span>{humanize(status)}</span>
    </Badge>
  );
}

export function Field({
  label,
  icon: Icon,
  children,
  className,
}: {
  label: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <Label
        className={cn(
          "flex items-center gap-1.5",
          "text-[#4b5b4f]",
          "text-[13px]",
        )}
      >
        {Icon ? (
          <Icon aria-hidden className={cn("size-3.5 shrink-0", "text-[#7d9b84]")} />
        ) : null}
        {label}
      </Label>
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
        "rounded-xl border px-3.5 py-2.5",
        error
          ? "border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/15 dark:text-red-300"
          : "border-[#d8e2d6] bg-[#eef4ec] text-[#2c4232]",
        "notice-in text-[13px]",
      )}
    >
      {error ?? ok}
    </p>
  );
}

export function SetupNotice() {
  return (
    <Card className="max-w-xl p-5 sm:p-6">
      <h2
        className={cn("text-[#1d2b21]", "font-display text-lg font-medium")}
      >
        Hubungkan Supabase dulu
      </h2>
      <ol
        className={cn(
          "mt-3 list-decimal space-y-1.5 pl-5",
          "text-[#4b5b4f]",
          "text-sm leading-relaxed",
        )}
      >
        <li>
          Skema database sudah ada (
          <code className={cn("rounded px-1", "bg-[#eef4ec]")}>
            supabase/schema_real.sql
          </code>
          ).
        </li>
        <li>
          Copas{" "}
          <code className={cn("rounded px-1", "bg-[#eef4ec]")}>.env.example</code>{" "}
          menjadi{" "}
          <code className={cn("rounded px-1", "bg-[#eef4ec]")}>.env.local</code>{" "}
          lalu isi URL + anon key +{" "}
          <code className={cn("rounded px-1", "bg-[#eef4ec]")}>
            service_role
          </code>
          , restart dev server.
        </li>
        <li>Masuk dengan akun pemilik (peran = pemilik, status = aktif).</li>
      </ol>
    </Card>
  );
}

export function AvatarNama({
  nama,
  className,
}: {
  nama: string;
  className?: string;
}) {
  const ini = nama
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-full",
        "bg-[#d5e3d3] text-[#3d4f42]",
        "text-[12px] font-semibold",
        className,
      )}
    >
      {ini || "—"}
    </span>
  );
}

/** Large portal list panel — refs pattern: white/75 blur rounded-3xl p-5 sm:p-7. */
export function Panel({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-3xl border p-5 backdrop-blur sm:p-7",
        "border-white/60 bg-white/75",
        "shadow-[0_1px_2px_rgba(29,43,33,0.06),0_12px_40px_-16px_rgba(61,79,66,0.18)]",
        className,
      )}
      {...props}
    />
  );
}

/** Header inside Panel: section title left, muted meta right. */
export function PanelHeader({
  title,
  meta,
  action,
}: {
  title: string;
  meta?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2">
      <h2
        className={cn(
          "text-[#1d2b21]",
          "font-display text-lg font-medium sm:text-xl",
        )}
      >
        {title}
      </h2>
      <div className="flex items-center gap-3">
        {action}
        {meta ? (
          <p className={cn("text-[#6b7a6e]", "text-[12px]")}>{meta}</p>
        ) : null}
      </div>
    </div>
  );
}

export function Empty({ text = "Belum ada data." }: { text?: string }) {
  return (
    <p
      className={cn(
        "rounded-xl border border-dashed px-4 py-6",
        "border-[#d8e2d6] bg-[#fafcfa] text-[#6b7a6e]",
        "text-center text-[13px]",
      )}
    >
      {text}
    </p>
  );
}
