"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Parallax } from "@/components/landing/parallax";
import { Button } from "@/components/ui/button";

const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];

function Enter({
  children,
  delay,
}: {
  children: React.ReactNode;
  delay: number;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <>{children}</>;
  return (
    <motion.div
      initial={{ opacity: 0, transform: "translateY(16px)" }}
      animate={{ opacity: 1, transform: "translateY(0px)" }}
      transition={{ duration: 0.6, delay, ease: EASE_OUT }}
    >
      {children}
    </motion.div>
  );
}

export function Hero() {
  return (
    <section id="atas" className="relative overflow-hidden">
      {/* ornamen sesuai ref (latar di-root page agar menyatu dengan navbar) */}
      {/* Lapisan depth: blob gerak lambat (jauh) di belakang konten */}
      <Parallax
        speed={0.18}
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(520px_340px_at_50%_18%,#cfdfcc_0%,transparent_70%)]"
      />
      <Parallax
        speed={0.12}
        className="pointer-events-none absolute top-16 right-[12%] hidden md:block"
      >
        <div className="relative size-36 rounded-full border border-dashed border-[#9db5a0]/50 animate-drift">
          <span className="absolute inset-4 rounded-full border border-[#9db5a0]/40" />
        </div>
      </Parallax>
      <Parallax
        speed={-0.06}
        className="pointer-events-none absolute bottom-16 left-[6%] hidden md:block"
      >
        <div className="size-20 rotate-45 rounded-xl border border-[#9db5a0]/40 animate-drift" />
      </Parallax>

      <div className="relative mx-auto flex max-w-3xl flex-col items-center px-4 pt-10 pb-12 text-center sm:px-6 sm:pt-16 sm:pb-20 lg:pt-20 lg:pb-24">
        <Enter delay={0}>
          <h1 className="font-display max-w-2xl text-balance text-[1.9rem] leading-[1.15] font-medium tracking-tight text-[#1a241d] sm:text-5xl sm:leading-[1.12] lg:text-[3.4rem]">
            Menjadi Keluarga Allah
            <br />
            Dengan Al-Qur&rsquo;an
          </h1>
        </Enter>
        <Enter delay={0.08}>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-[#6b7a6e] sm:mt-5 sm:text-[15px]">
            Tempat les mengaji anak hingga tahsin dewasa: membaca dan
            menghafal Al-Qur&rsquo;an dalam halaqah yang hangat, dengan
            catatan kemajuan yang rapi.
          </p>
        </Enter>
        <Enter delay={0.16}>
          <div className="mt-6 sm:mt-7">
            <a href="/portal/login">
              <Button size="lg">Portal Pengajar</Button>
            </a>
          </div>
        </Enter>
      </div>
    </section>
  );
}
