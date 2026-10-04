import { Check } from "lucide-react";
import { Reveal } from "@/components/landing/reveal";
import { SectionHeading } from "@/components/landing/section-heading";
import { Card } from "@/components/ui/card";
import { VISI } from "@/lib/landing";

export function About() {
  return (
    <section
      id="profil"
      aria-labelledby="judul-profil"
      className="mx-auto w-full max-w-3xl scroll-mt-24 px-4 py-12 sm:px-6 sm:py-16 lg:py-24"
    >
      <div className="grid gap-6 sm:gap-10 md:grid-cols-[1.2fr_0.8fr] md:items-start">
        <Reveal>
          <div>
            <SectionHeading
              id="judul-profil"
              title="Rumah yang menumbuhkan cinta pada Al-Qur'an"
            />
            <div className="mt-4 space-y-3 text-sm leading-relaxed text-[#6b7a6e] sm:mt-5 sm:space-y-4 sm:text-[14px]">
              <p>
                Kami percaya Al-Qur&rsquo;an paling mudah dicintai lewat
                bimbingan yang sabar dan suasana belajar yang nyaman. Setiap
                santri dibimbing sesuai kemampuannya, mulai dari mengenal huruf
                hijaiyah sampai tahsin bacaan dan tahfidz Al-Qur&rsquo;an.
              </p>
              <p>
                Pengajar kami fokus pada satu hal: mendampingi. Urusan
                pencatatan kami serahkan pada mutaba&rsquo;ah digital yang bisa
                dipantau orang tua.
              </p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <Card className="bg-gradient-to-br from-[#e4eee2] to-white p-4 sm:p-6 md:mt-2">
            <h3 className="font-display text-center text-lg font-medium text-[#1d2b21] sm:text-xl">
              Visi Kami
            </h3>
            <ul className="mt-4 space-y-3 sm:mt-5 sm:space-y-3.5">
              {VISI.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-[13px] leading-snug text-[#4b5b4f]"
                >
                  <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-[#1d2b21] text-white [&_svg]:size-2.5">
                    <Check strokeWidth={3} aria-hidden />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </Card>
        </Reveal>
      </div>
    </section>
  );
}
