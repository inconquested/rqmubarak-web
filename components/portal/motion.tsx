"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/** Token kurva tunggal portal — sama dengan --ease-out di globals.css. */
export const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];

/** Entrance standar: fade + rise 8px, 300ms ease-out, stagger via delay. */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, transform: "translateY(8px)" }}
      animate={{ opacity: 1, transform: "translateY(0px)" }}
      transition={{ duration: 0.3, delay, ease: EASE_OUT }}
    >
      {children}
    </motion.div>
  );
}

/** Angka KPI yang menghitung naik — state indication, 700ms, hormati reduced-motion. */
export function CountUp({
  to,
  suffix = "",
  duration = 700,
}: {
  to: number;
  suffix?: string;
  duration?: number;
}) {
  const reduce = useReducedMotion();
  const [val, setVal] = useState(reduce ? to : 0);
  const raf = useRef(0);
  useEffect(() => {
    if (reduce) {
      setVal(to);
      return;
    }
    let start: number | null = null;
    const step = (t: number) => {
      if (start === null) start = t;
      const p = Math.min(1, (t - start) / duration);
      setVal(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [to, duration, reduce]);
  return (
    <>
      {val.toLocaleString("id-ID")}
      {suffix}
    </>
  );
}

/** Isi bar: tumbuh via scaleX (transform-only), stagger 40ms per baris. */
export function BarGrow({
  ratio,
  delay = 0,
  className,
}: {
  ratio: number;
  delay?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  if (reduce) {
    return (
      <div className="h-2 overflow-hidden rounded-full bg-[#eef4ec]">
        <div
          className={cn(
            "h-full rounded-full bg-gradient-to-r from-[#bccfba] to-[#9db5a0]",
            className,
          )}
          style={{ width: `${Math.round(ratio * 100)}%` }}
        />
      </div>
    );
  }
  return (
    <div className="h-2 overflow-hidden rounded-full bg-[#eef4ec]">
      <motion.div
        className={cn(
          "h-full w-full origin-left rounded-full bg-gradient-to-r from-[#bccfba] to-[#9db5a0]",
          className,
        )}
        initial={{ transform: "scaleX(0)" }}
        animate={{ transform: `scaleX(${ratio})` }}
        transition={{ duration: 0.5, delay, ease: EASE_OUT }}
      />
    </div>
  );
}

/** Transisi antar-halaman portal: fade 180ms, nyaris tak terasa. */
export function PageSwitch({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  if (reduce) return <>{children}</>;
  return (
    <motion.div
      initial={{ opacity: 0, transform: "translateY(4px)" }}
      animate={{ opacity: 1, transform: "translateY(0px)" }}
      transition={{ duration: 0.18, ease: EASE_OUT }}
    >
      {children}
    </motion.div>
  );
}
