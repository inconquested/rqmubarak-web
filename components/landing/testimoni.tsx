import { Quote } from "lucide-react";
import { Reveal, ScrollReveal } from "@/components/landing/reveal";
import { SectionHeading } from "@/components/landing/section-heading";
import { Card, IconTile } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const TESTIMONI = [
  {
    nama: "Abu Hanif",
    peran: "Wali santri kelas Reguler",
    kutip:
      "Anak saya yang dulu malu mengaji sekarang setor hafalan tiap pekan dengan percaya diri. Laporan mutaba'ahnya rapi, kami bisa memantau dari rumah.",
  },
  {
    nama: "Ustadzah Maryam",
    peran: "Pengajar halaqah",
    kutip:
      "Absensi dan mutaba'ah yang dulu dicatat di buku kini terdokumentasi rapi di portal. Rekap bulanannya otomatis tersusun tanpa input ulang.",
  },
  {
    nama: "Fikri Ramadhan",
    peran: "Santri kelas Intensif",
    kutip:
      "Program ziyadah dan muraja'ahnya terukur. Saya tahu persis berapa halaman yang harus disetor setiap hari.",
  },
  {
    nama: "Hj. Fatimah",
    peran: "Wali santri kelas Dewasa",
    kutip:
      "Belajar dari nol di usia saya ternyata tidak menakutkan. Pengajarnya sabar dan jadwalnya fleksibel untuk ibu rumah tangga.",
  },
] as const;

/* Initials avatar — follows the portal AvatarNama pattern. */
function Inisial({ nama }: { nama: string }) {
  const ini = nama
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-full",
        "bg-[#d5e3d3] text-[#3d4f42]",
        "text-[12px] font-semibold",
      )}
    >
      {ini || "—"}
    </span>
  );
}

export function Testimoni() {
  return (
    <section
      id="testimoni"
      aria-labelledby="judul-testimoni"
      className="mx-auto w-full max-w-5xl scroll-mt-24 px-4 py-12 sm:px-6 sm:py-16 lg:py-24"
    >
      <div className="mx-auto max-w-3xl">
        <Reveal>
          <SectionHeading
            id="judul-testimoni"
            title="Testimoni"
            description="Cerita santri, wali, dan pengajar yang belajar bersama Rumah Qur'an Mubarak."
          />
        </Reveal>
      </div>
      <div className="mt-6 grid gap-4 sm:mt-10 sm:gap-5 md:grid-cols-2">
        {TESTIMONI.map((t, i) => (
          <ScrollReveal key={t.nama} delay={i * 120} className="h-full">
            <Card
              className={cn(
                "flex h-full flex-col p-4 sm:p-6",
                "lift",
              )}
            >
              <IconTile
                className={cn("size-9 [&_svg]:size-4", "lift-icon")}
              >
                <Quote aria-hidden />
              </IconTile>
              <blockquote
                className={cn(
                  "mt-3 flex-1",
                  "text-[#4b5b4f]",
                  "text-[13.5px] leading-relaxed",
                )}
              >
                &ldquo;{t.kutip}&rdquo;
              </blockquote>
              <div className="mt-4 flex items-center gap-2.5">
                <Inisial nama={t.nama} />
                <div className="min-w-0">
                  <p
                    className={cn(
                      "truncate",
                      "text-[#1d2b21]",
                      "text-[13.5px] font-medium",
                    )}
                  >
                    {t.nama}
                  </p>
                  <p className={cn("text-[#6b7a6e]", "text-[12px]")}>
                    {t.peran}
                  </p>
                </div>
              </div>
            </Card>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
