import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  History,
  Newspaper,
  PencilLine,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { fmtTanggal } from "@/lib/portal";
import type { MadingKonten } from "@/lib/portal";
import { createAdminClient } from "@/lib/supabase/admin";
import { cn } from "@/lib/utils";

/* Server-side fetch via service_role (key never reaches the client) —
 * used by both portal (owner) and public routes. */
export async function getMading(id: string) {
  const { data } = await createAdminClient()
    .from("MadingKonten")
    .select("*,penulis_ref:penulis(id,nama_lengkap)")
    .eq("id", id)
    .maybeSingle();
  return data as unknown as MadingKonten | null;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const ALLOWED_TAGS: Record<string, boolean> = {
  p: true,
  br: true,
  strong: true,
  em: true,
  u: true,
  h2: true,
  h3: true,
  ul: true,
  ol: true,
  li: true,
  blockquote: true,
  a: true,
};
/* Legacy execCommand output: b/i/div normalized, everything else dropped. */
const TAG_ALIAS: Record<string, string> = { b: "strong", i: "em", div: "p" };
const DROP_CONTENT: Record<string, boolean> = {
  script: true,
  style: true,
  iframe: true,
  object: true,
  embed: true,
  form: true,
};

/* Dependency-free sanitizer: drops script/style, on* attributes, and javascript: hrefs.
 * Allowlisted tags only (all attributes dropped except http(s)/mailto href on <a>). */
export function sanitizeMadingHtml(input: string): string {
  const raw = input ?? "";
  if (!/<[a-zA-Z][^>]*>/.test(raw)) {
    return raw
      .split(/\n{2,}|\n/)
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => `<p>${escapeHtml(part)}</p>`)
      .join("");
  }
  let html = raw.replace(/<!--[\s\S]*?-->/g, "");
  for (const tag of Object.keys(DROP_CONTENT)) {
    html = html.replace(
      new RegExp(`<${tag}[\\s>][\\s\\S]*?<\\/${tag}\\s*>`, "gi"),
      "",
    );
  }
  return html.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*\/?>/g, (tag, name) => {
    const lower = String(name).toLowerCase();
    if (DROP_CONTENT[lower]) return "";
    const mapped = TAG_ALIAS[lower] || lower;
    if (!ALLOWED_TAGS[mapped]) return "";
    if (tag.charAt(1) === "/") return `</${mapped}>`;
    if (mapped === "br") return "<br>";
    if (mapped === "a") {
      const m = tag.match(/\shref\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/i);
      const href = (m ? (m[2] ?? m[3] ?? m[4] ?? "") : "").trim();
      if (!/^(https?:\/\/|mailto:)/i.test(href)) return "<a>";
      return `<a href="${href.replace(/&/g, "&amp;").replace(/"/g, "&quot;")}">`;
    }
    return `<${mapped}>`;
  });
}

/* Plain text for read-time estimate (script/style contents excluded). */
export function madingPlainText(input: string): string {
  const raw = input ?? "";
  return raw
    .replace(/<(script|style)[\s>][\s\S]*?<\/\1\s*>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function Meta({ icon: Icon, children }: { icon: LucideIcon; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <Icon aria-hidden className={cn("size-3.5", "text-[#6b7a6e]")} />
      {children}
    </span>
  );
}

/* Editorial article: back button + badge + title + icon meta +
 * cover + accent summary + per-paragraph body. */
export function MadingArticle({
  row,
  backHref,
  backLabel,
  editHref,
}: {
  row: MadingKonten;
  backHref: string;
  backLabel: string;
  editHref?: string;
}) {
  const penulis = row.penulis_ref?.nama_lengkap ?? row.penulis ?? "Tanpa penulis";
  const diubah =
    row.updated_at && row.updated_at !== row.created_at
      ? fmtTanggal(row.updated_at.slice(0, 10))
      : null;
  const kata = madingPlainText(row.konten ?? "")
    .split(/\s+/)
    .filter(Boolean).length;
  const menit = Math.max(1, Math.ceil(kata / 200));
  const isi = sanitizeMadingHtml(row.konten ?? "");

  return (
    <article className="mx-auto max-w-2xl" aria-labelledby="judul-artikel">
      <header className="mt-6">
        <p
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1",
            "bg-[#eef4ec] text-[#2f6b3a]",
            "text-[12px] font-semibold",
          )}
        >
          <Newspaper aria-hidden className="size-3.5" />
          Mading
        </p>
        <h1
          id="judul-artikel"
          className={cn(
            "mt-3",
            "text-[#1d2b21]",
            "font-display text-3xl font-medium tracking-tight text-balance sm:text-4xl",
          )}
        >
          {row.judul ?? "Tanpa judul"}
        </h1>
        <div
          className={cn(
            "mt-4 flex flex-wrap gap-x-4 gap-y-1.5",
            "text-[#6b7a6e]",
            "text-[13px]",
          )}
        >
          <Meta icon={UserRound}>{penulis}</Meta>
          <Meta icon={CalendarDays}>
            <time dateTime={row.created_at}>{fmtTanggal(row.created_at.slice(0, 10))}</time>
          </Meta>
          {diubah && row.updated_at ? (
            <Meta icon={History}>
              Diubah <time dateTime={row.updated_at}>{diubah}</time>
            </Meta>
          ) : null}
          <Meta icon={Clock3}>{menit} mnt baca</Meta>
        </div>
      </header>

      {row.thumb_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={row.thumb_url}
          alt={row.judul ?? "Sampul mading"}
          className={cn(
            "mt-6 aspect-video w-full rounded-2xl border object-cover",
            "border-[#d8e2d6]",
            "shadow-sm",
          )}
        />
      ) : (
        <hr className={cn("mt-6", "border-[#d8e2d6]")} />
      )}

      {row.deskripsi ? (
        <p
          className={cn(
            "mt-6 border-l-[3px] pl-4",
            "border-[#2f6b3a] text-[#1d2b21]",
            "text-[16px] leading-relaxed font-medium",
          )}
        >
          {row.deskripsi}
        </p>
      ) : null}

      {isi ? (
        <div
          className={cn(
            "mt-6 space-y-5",
            "text-[#33403a]",
            "text-[15px] leading-[1.8] [&_a]:font-medium [&_a]:text-[#2f6b3a] [&_a]:underline [&_blockquote]:border-l-[3px] [&_blockquote]:border-[#2f6b3a] [&_blockquote]:pl-4 [&_blockquote]:font-medium [&_blockquote]:text-[#1d2b21] [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-medium [&_h2]:tracking-tight [&_h2]:text-[#1d2b21] [&_h3]:text-[17px] [&_h3]:font-semibold [&_h3]:text-[#1d2b21] [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5",
          )}
          dangerouslySetInnerHTML={{ __html: isi }}
        />
      ) : (
        <p className={cn("mt-6", "text-[#6b7a6e]", "text-[14px]")}>
          Belum ada isi.
        </p>
      )}

      {editHref ? (
        <footer
          className={cn(
            "mt-10 flex justify-end border-t pt-5",
            "border-[#d8e2d6]",
          )}
        >
          <a
            href={editHref}
            className={cn(
              "inline-flex h-8 items-center gap-1.5 rounded-full px-3.5",
              "bg-[#1d2b21] text-white hover:bg-[#2c4032]",
              "text-[13px] font-medium transition-colors",
            )}
          >
            <PencilLine aria-hidden className="size-3.5" />
            Ubah
          </a>
        </footer>
      ) : null}
    </article>
  );
}
