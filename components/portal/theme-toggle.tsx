"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/* Light/dark theme toggle. Toggles .dark class on <html> + persists
   preference (localStorage). Initial value set by anti-flash script in layout. */
export function ThemeToggle({ className }: { className?: string }) {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function onClick() {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("rqm-tema", next ? "gelap" : "terang");
    } catch {
      // Private mode: preference not saved, session theme still works.
    }
    setDark(next);
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={dark}
      title={dark ? "Mode terang" : "Mode gelap"}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-[13.5px] font-medium text-[#4b5b4f] transition-colors duration-200 [transition-timing-function:var(--ease-out)] hover:bg-[#eef4ec]",
        className,
      )}
    >
      {dark ? (
        <Sun aria-hidden className="size-4 shrink-0" />
      ) : (
        <Moon aria-hidden className="size-4 shrink-0" />
      )}
      <span>{dark ? "Mode terang" : "Mode gelap"}</span>
    </button>
  );
}
