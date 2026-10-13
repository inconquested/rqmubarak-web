"use client";

import {
  Bold,
  Check,
  Eraser,
  Heading2,
  Heading3,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  Underline,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/* Legacy content still plain text — wrap each line in <p> so it is editable. */
function toEditorHtml(raw: string): string {
  if (/<[a-zA-Z][^>]*>/.test(raw)) return raw;
  return raw
    .split(/\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => `<p>${escapeHtml(l)}</p>`)
    .join("");
}

type Active = {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  ul: boolean;
  ol: boolean;
  block: string;
};
const IDLE: Active = {
  bold: false,
  italic: false,
  underline: false,
  ul: false,
  ol: false,
  block: "",
};

function readActive(): Active {
  try {
    return {
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      underline: document.queryCommandState("underline"),
      ul: document.queryCommandState("insertUnorderedList"),
      ol: document.queryCommandState("insertOrderedList"),
      block: (document.queryCommandValue("formatBlock") || "").toLowerCase(),
    };
  } catch {
    return IDLE;
  }
}

/* Custom editor with no new deps: toolbar over contentEditable + hidden
 * `konten` textarea (stores HTML) so server actions stay unchanged.
 * Mobile-first: 40px touch targets, horizontally scrolling toolbar, no prompt. */
export function RichEditor({
  name = "konten",
  defaultValue = "",
  placeholder = "Tulis isi mading…",
}: {
  name?: string;
  defaultValue?: string | null;
  placeholder?: string;
}) {
  const areaRef = useRef<HTMLDivElement>(null);
  const appliedRef = useRef<string | null>(null);
  const savedRange = useRef<Range | null>(null);
  const linkRef = useRef<HTMLInputElement>(null);
  const [html, setHtml] = useState(() => defaultValue ?? "");
  const [active, setActive] = useState<Active>(IDLE);
  const [linkOpen, setLinkOpen] = useState(false);

  useEffect(() => {
    const el = areaRef.current;
    const src = defaultValue ?? "";
    if (el && appliedRef.current !== src) {
      appliedRef.current = src;
      el.innerHTML = toEditorHtml(src);
      setHtml(el.innerHTML);
    }
  }, [defaultValue]);

  /* Track format state at cursor — toggles light up per text state. */
  useEffect(() => {
    const sync = () => {
      const sel = document.getSelection();
      if (sel?.rangeCount && areaRef.current?.contains(sel.anchorNode))
        setActive(readActive());
    };
    document.addEventListener("selectionchange", sync);
    return () => document.removeEventListener("selectionchange", sync);
  }, []);

  /* Save selection before toolbar touch — focus() on phones collapses selection. */
  function keepSelection(e: React.PointerEvent) {
    const sel = document.getSelection();
    if (sel?.rangeCount && areaRef.current?.contains(sel.anchorNode))
      savedRange.current = sel.getRangeAt(0).cloneRange();
    e.preventDefault();
  }

  function restoreSelection() {
    const el = areaRef.current;
    if (!el) return;
    el.focus({ preventScroll: true });
    const sel = document.getSelection();
    if (savedRange.current && sel) {
      sel.removeAllRanges();
      sel.addRange(savedRange.current);
    }
  }

  function run(cmd: string, value?: string) {
    restoreSelection();
    document.execCommand(cmd, false, value);
    setActive(readActive());
    if (areaRef.current) setHtml(areaRef.current.innerHTML);
    areaRef.current?.focus({ preventScroll: true });
  }

  /* Headings as toggles: press again to revert to a plain paragraph. */
  function toggleBlock(tag: "h2" | "h3" | "blockquote") {
    run("formatBlock", readActive().block === tag ? "p" : tag);
  }

  function applyLink() {
    const clean = linkRef.current?.value.trim() ?? "";
    // shortcut: http(s)/mailto only — upgrade if relative links are needed
    if (!/^(https?:\/\/|mailto:)/i.test(clean)) return;
    run("createLink", clean);
    setLinkOpen(false);
  }

  function onPaste(e: React.ClipboardEvent) {
    // Paste always as plain text — outside markup won't corrupt the article.
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    restoreSelection();
    document.execCommand("insertText", false, text);
    if (areaRef.current) setHtml(areaRef.current.innerHTML);
  }

  const fmtBtn = (on: boolean) =>
    cn(
      "flex size-10 shrink-0 items-center justify-center rounded-lg border",
      "text-[#4b5b4f] hover:border-[#d8e2d6] hover:bg-white active:bg-[#eef4ec]",
      "[&_svg]:size-[18px]",
      on
        ? "border-[#2f6b3a]/40 bg-[#e4eee2] text-[#2c4232]"
        : "border-transparent",
    );

  return (
    <div>
      <div
        role="toolbar"
        aria-label="Format tulisan"
        onPointerDown={keepSelection}
        className={cn(
          "mb-1.5 flex flex-nowrap gap-1 overflow-x-auto rounded-xl border p-1",
          "border-[#d8e2d6] bg-[#fafcfa]",
        )}
      >
        <button
          type="button"
          title="Tebal"
          aria-label="Tebal"
          aria-pressed={active.bold}
          onClick={() => run("bold")}
          className={fmtBtn(active.bold)}
        >
          <Bold aria-hidden />
        </button>
        <button
          type="button"
          title="Miring"
          aria-label="Miring"
          aria-pressed={active.italic}
          onClick={() => run("italic")}
          className={fmtBtn(active.italic)}
        >
          <Italic aria-hidden />
        </button>
        <button
          type="button"
          title="Garis bawah"
          aria-label="Garis bawah"
          aria-pressed={active.underline}
          onClick={() => run("underline")}
          className={fmtBtn(active.underline)}
        >
          <Underline aria-hidden />
        </button>
        <button
          type="button"
          title="Judul besar"
          aria-label="Judul besar"
          aria-pressed={active.block === "h2"}
          onClick={() => toggleBlock("h2")}
          className={fmtBtn(active.block === "h2")}
        >
          <Heading2 aria-hidden />
        </button>
        <button
          type="button"
          title="Judul kecil"
          aria-label="Judul kecil"
          aria-pressed={active.block === "h3"}
          onClick={() => toggleBlock("h3")}
          className={fmtBtn(active.block === "h3")}
        >
          <Heading3 aria-hidden />
        </button>
        <button
          type="button"
          title="Daftar poin"
          aria-label="Daftar poin"
          aria-pressed={active.ul}
          onClick={() => run("insertUnorderedList")}
          className={fmtBtn(active.ul)}
        >
          <List aria-hidden />
        </button>
        <button
          type="button"
          title="Daftar nomor"
          aria-label="Daftar nomor"
          aria-pressed={active.ol}
          onClick={() => run("insertOrderedList")}
          className={fmtBtn(active.ol)}
        >
          <ListOrdered aria-hidden />
        </button>
        <button
          type="button"
          title="Kutipan"
          aria-label="Kutipan"
          aria-pressed={active.block === "blockquote"}
          onClick={() => toggleBlock("blockquote")}
          className={fmtBtn(active.block === "blockquote")}
        >
          <Quote aria-hidden />
        </button>
        <button
          type="button"
          title="Tautan"
          aria-label="Tautan"
          aria-expanded={linkOpen}
          onClick={() => setLinkOpen((v) => !v)}
          className={fmtBtn(linkOpen)}
        >
          <Link2 aria-hidden />
        </button>
        <button
          type="button"
          title="Bersihkan format"
          aria-label="Bersihkan format"
          onClick={() => run("removeFormat")}
          className={fmtBtn(false)}
        >
          <Eraser aria-hidden />
        </button>
      </div>
      {linkOpen ? (
        <div className={cn("mb-1.5 flex gap-1.5", "text-[#1d2b21]")}>
          <input
            ref={linkRef}
            type="url"
            inputMode="url"
            defaultValue="https://"
            placeholder="https://…"
            aria-label="Alamat tautan"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                applyLink();
              }
            }}
            className={cn(
              "h-10 min-w-0 flex-1 rounded-xl border px-3 outline-none focus-visible:ring-2 focus-visible:ring-[#2f6b3a]/30",
              "border-[#d8e2d6] bg-white",
              "text-sm",
            )}
          />
          <button
            type="button"
            aria-label="Pasang tautan"
            onClick={applyLink}
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-xl",
              "bg-[#1d2b21] text-white",
              "[&_svg]:size-4",
            )}
          >
            <Check aria-hidden />
          </button>
          <button
            type="button"
            aria-label="Batalkan tautan"
            onClick={() => setLinkOpen(false)}
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-xl border",
              "border-[#d8e2d6] bg-white text-[#4b5b4f]",
              "[&_svg]:size-4",
            )}
          >
            <X aria-hidden />
          </button>
        </div>
      ) : null}
      <div
        ref={areaRef}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        tabIndex={0}
        aria-multiline
        aria-label="Isi mading"
        data-placeholder={placeholder}
        onInput={() => {
          if (areaRef.current) setHtml(areaRef.current.innerHTML);
          setActive(readActive());
        }}
        onPaste={onPaste}
        className={cn(
          "min-h-44 w-full rounded-xl border px-3 py-2.5 outline-none focus-visible:ring-2 focus-visible:ring-[#2f6b3a]/30",
          "border-[#d8e2d6] bg-white",
          "text-[16px] leading-relaxed text-[#1d2b21] [&:empty:before]:content-[attr(data-placeholder)] [&:empty:before]:text-[#6b7a6e] [&_a]:text-[#2f6b3a] [&_a]:underline [&_blockquote]:border-l-[3px] [&_blockquote]:border-[#2f6b3a] [&_blockquote]:pl-3 [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:text-[15px] [&_h3]:font-semibold [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5",
        )}
      />
      <textarea
        name={name}
        value={html}
        readOnly
        aria-hidden
        tabIndex={-1}
        className="hidden"
      />
    </div>
  );
}
