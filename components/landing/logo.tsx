import Image from "next/image";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <Image
        src="/logo-notext.svg"
        alt="Logo Rumah Qur'an Mubarak"
        width={32}
        height={32}
        className="size-8 shrink-0"
        priority
      />
      <span className="font-display truncate text-[13px] font-semibold tracking-tight text-[#1d2b21] sm:text-[15px]">
        Rumah Qur&rsquo;an Mubarak
      </span>
    </span>
  );
}
