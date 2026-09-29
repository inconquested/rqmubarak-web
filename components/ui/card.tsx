import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/60 bg-white shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_1px_2px_rgba(29,43,33,0.06),0_12px_40px_-16px_rgba(61,79,66,0.18)]",
        className,
      )}
      {...props}
    />
  );
}

export function IconTile({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex size-11 items-center justify-center rounded-lg bg-gradient-to-br from-[#d5e3d3] to-[#e9f1e7] text-[#3d4f42] [&_svg]:size-5",
        className,
      )}
    >
      {children}
    </div>
  );
}
