"use client";

import { Maximize2, Minimize2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

/* CRUD form in a dialog. Opens instantly (<100ms) via FAB: local state without
   navigation, content already server-rendered. ?edit= links still open via
   server (need row data). Closing clears ?tambah=/?edit= from the URL
   so refresh does not reopen the dialog. */
export function CrudForm({
  title,
  fabLabel,
  closeHref,
  defaultOpen,
  wide,
  expandable,
  children,
}: {
  title: string;
  fabLabel: string;
  closeHref: string;
  defaultOpen?: boolean;
  wide?: boolean;
  /** Show expand button — dialog animates to near-fullscreen. */
  expandable?: boolean;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(Boolean(defaultOpen));
  const [expanded, setExpanded] = useState(false);
  const [mount, setMount] = useState(false);
  useEffect(() => setMount(true), []);

  function close() {
    setOpen(false);
    const q = window.location.search;
    if (q.includes("tambah=") || q.includes("edit="))
      router.replace(closeHref, { scroll: false });
  }

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(o) => {
          if (!o) close();
        }}
      >
        {/* duration-75: open animation finishes <100ms; 200ms expand via inline. */}
        <DialogContent
          style={expanded ? { transitionDuration: "200ms" } : undefined}
          className={cn(
            "max-h-[calc(100dvh-3rem)] overflow-y-auto duration-75 transition-[max-width] ease-out sm:max-w-lg",
            wide && "sm:max-w-2xl",
            expanded &&
              "max-h-[calc(100dvh-1.5rem)] max-w-[calc(100dvw-1.5rem)] sm:max-w-3xl",
          )}
        >
          <div className="flex items-center justify-between gap-2 pr-8">
            <DialogTitle className="font-display text-[15px] font-semibold text-[#1d2b21]">
              {title}
            </DialogTitle>
            {expandable ? (
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                aria-pressed={expanded}
                aria-label={expanded ? "Kecilkan dialog" : "Perbesar dialog"}
                title={expanded ? "Kecilkan" : "Perbesar"}
                className="flex size-9 shrink-0 items-center justify-center rounded-lg text-[#4b5b4f] transition-colors hover:bg-[#eef4ec] active:bg-[#d8e2d6] [&_svg]:size-4"
              >
                {expanded ? (
                  <Minimize2 aria-hidden />
                ) : (
                  <Maximize2 aria-hidden />
                )}
              </button>
            ) : null}
          </div>
          {children}
        </DialogContent>
      </Dialog>
      {mount
        ? createPortal(
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label={fabLabel}
              title={fabLabel}
              className="fixed right-6 bottom-6 z-40 flex h-12 items-center gap-2 rounded-full bg-[#cbdcc9] pr-5 pl-4 text-sm font-medium text-[#1d2b21] shadow-[0_12px_28px_-8px_rgba(29,43,33,0.55)] transition-[transform,background-color] duration-160 ease-out hover:scale-105 hover:bg-[#bccfba] active:scale-95"
            >
              <Plus aria-hidden className="size-5" />
              {fabLabel}
            </button>,
            document.body,
          )
        : null}
    </>
  );
}
