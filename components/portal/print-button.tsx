"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Cetak rapor — browser menangani ekspor PDF lewat print dialog. */
export function PrintButton() {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="no-print"
      onClick={() => window.print()}
    >
      <Printer aria-hidden />
      Cetak Rapor
    </Button>
  );
}
