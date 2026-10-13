"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Print report card — browser handles PDF export via print dialog. */
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
