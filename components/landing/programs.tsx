import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/landing/reveal";
import { SectionHeading } from "@/components/landing/section-heading";
import { Card, IconTile } from "@/components/ui/card";
import { PROGRAMS } from "@/lib/landing";

export function Programs() {
  return (
    <section
      id="program"
      aria-labelledby="judul-program"
      className="mx-auto w-full max-w-5xl scroll-mt-24 px-4 py-12 sm:px-6 sm:py-16 lg:py-24"
    >
      <div className="mx-auto max-w-3xl">
        <Reveal>
          <SectionHeading
            id="judul-program"
            title="Program Halaqah"
            description="Tiga kelas dengan ritme berbeda. Pilih yang paling sesuai dengan kebutuhan Anda"
          />
        </Reveal>
      </div>
      <div className="mt-6 grid gap-4 sm:mt-10 sm:gap-5 md:grid-cols-3">
        {PROGRAMS.map((program, i) => (
          <Reveal key={program.title} delay={i * 0.06}>
            <Card className="lift flex h-full flex-col p-4 sm:p-6">
              <IconTile className="lift-icon size-10 sm:size-11 [&_svg]:size-4 sm:[&_svg]:size-5">
                <program.icon aria-hidden />
              </IconTile>
              <h3 className="font-display mt-3 text-lg font-medium text-[#1d2b21] sm:mt-4 sm:text-xl">
                {program.title}
              </h3>
              <p className="mt-2 flex-1 text-[13px] leading-relaxed text-[#6b7a6e]">
                {program.description}
              </p>
              <p className="mt-3 text-right text-[12px] font-semibold text-[#1d2b21] sm:mt-4">
                {program.frequency}
              </p>
              <a
                href="#kontak"
                className="nudge mt-3 inline-flex items-center gap-1.5 text-[13px] font-medium text-[#1d2b21] transition-colors hover:text-[#4b5b4f] sm:mt-4"
              >
                Lihat Detail
                <ArrowRight className="nudge-target size-3.5" aria-hidden />
              </a>
            </Card>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
