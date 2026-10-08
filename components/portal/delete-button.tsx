"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Konfirmasi hapus bawaan browser — mencegah hapus tak sengaja tanpa lib dialog. */
export function DeleteButton({
  label = "Hapus",
  message = "Hapus data ini? Tindakan ini tidak bisa dibatalkan.",
  className,
}: {
  label?: string;
  message?: string;
  className?: string;
}) {
  return (
    <Button
      variant="ghost"
      size="sm"
      type="submit"
      className={cn(
        "border border-red-300 bg-white text-red-600 hover:bg-red-50 hover:text-red-700",
        className,
      )}
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
    >
      {label}
    </Button>
  );
}
