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
 * Motion-value-based scroll parallax (no React re-renders).
 * speed 0.12 = far background (slow), negative = counter-move (near).
 * Fully disabled under prefers-reduced-motion.
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
