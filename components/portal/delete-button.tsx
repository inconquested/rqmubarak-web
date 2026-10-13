"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Browser-native delete confirmation — prevents accidental deletes without a dialog lib. */
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
        "border",
        "border-red-300 bg-white text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-500/30 dark:bg-transparent dark:text-red-300 dark:hover:bg-red-500/15 dark:hover:text-red-200",
        className,
      )}
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
    >
      <Trash2 aria-hidden />
      {label}
    </Button>
  );
}
