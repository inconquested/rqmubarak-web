"use client";

import { Button } from "@/components/ui/button";

/** Konfirmasi hapus bawaan browser — mencegah hapus tak sengaja tanpa lib dialog. */
export function DeleteButton({
  label = "Hapus",
  message = "Hapus data ini? Tindakan ini tidak bisa dibatalkan.",
}: {
  label?: string;
  message?: string;
}) {
  return (
    <Button
      variant="ghost"
      size="sm"
      type="submit"
      className="text-red-700 hover:bg-red-50 hover:text-red-800"
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
    >
      {label}
    </Button>
  );
}
