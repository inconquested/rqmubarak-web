"use client";

import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Parallax scroll berbasis motion value (tanpa re-render React).
 * speed 0.12 = latar jauh (lambat), negatif = counter-move (dekat).
 * Nonaktif total bila prefers-reduced-motion.
 */
export function Parallax({
  speed = 0.12,
  className,
  children,
}: {
  speed?: number;
  className?: string;
  children?: ReactNode;
}) {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, (v) => v * speed);
  if (reduce) return <div className={cn(className)}>{children}</div>;
  return (
    <motion.div aria-hidden className={cn(className)} style={{ y }}>
      {children}
    </motion.div>
  );
}
