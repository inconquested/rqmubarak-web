import { Parallax } from "@/components/landing/parallax";
import { Reveal } from "@/components/landing/reveal";
import { SectionHeading } from "@/components/landing/section-heading";
import { Card, IconTile } from "@/components/ui/card";
import { FEATURES } from "@/lib/landing";

export function System() {
  return (
    <section
      id="sistem"
      aria-labelledby="judul-sistem"
      className="relative scroll-mt-24 overflow-hidden"
    >
      <Parallax
        speed={0.1}
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_60%_at_50%_100%,#e3edE1_0%,transparent_70%)]"
      />
      <div className="relative mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-16 lg:py-24">
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <SectionHeading
              id="judul-sistem"
              title="Sistem Absensi, Mutaba'ah Digital"
              description="Pengajar mencatat kehadiran dan capaian santri langsung dari ponsel, sehingga waktu lebih banyak untuk mengajar."
            />
          </Reveal>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-3.5 sm:mt-10 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
          {FEATURES.map((feature, i) => (
            <Reveal key={feature.title} delay={i * 0.06}>
              <Card className="lift h-full p-4 sm:p-6">
                <IconTile className="lift-icon size-9 [&_svg]:size-4">
                  <feature.icon aria-hidden />
                </IconTile>
                <h3 className="font-display mt-3.5 text-[15px] font-semibold text-[#1d2b21]">
                  {feature.title}
                </h3>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-[#6b7a6e]">
                  {feature.description}
                </p>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
