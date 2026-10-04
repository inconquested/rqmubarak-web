import { Logo } from "@/components/landing/logo";
import { Reveal } from "@/components/landing/reveal";

export function Footer() {
  return (
    <footer
      id="kontak"
      className="mx-auto w-full max-w-5xl scroll-mt-24 px-4 pt-4 pb-8 sm:px-6 sm:pt-6 sm:pb-10"
    >
      <Reveal>
        <div className="rounded-3xl border border-white/60 bg-[#fafcfa] px-5 py-6 shadow-[0_12px_40px_-16px_rgba(61,79,66,0.15)] sm:px-8 sm:py-10 lg:px-12">
          <div className="grid gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3">
            <div>
              <Logo />
              <p className="mt-4 text-[12.5px] leading-relaxed text-[#6b7a6e]">
                Jl. Encep Kartawiria .........
                <br />
                Buka Senin–Minggu, 08.00–20.00 WIB
              </p>
            </div>
            <nav aria-label="Kontak admin">
              <h3 className="font-display text-[15px] font-semibold text-[#1d2b21]">
                Kontak Admin
              </h3>
              <p className="mt-3 text-[12.5px] leading-relaxed text-[#6b7a6e]">
                <a
                  href="tel:+6289500000000"
                  className="transition-colors hover:text-[#1d2b21]"
                >
                  +62 895-0000-0000
                </a>
                <br />
                <a
                  href="mailto:admin@rqmubarak.lalululu"
                  className="transition-colors hover:text-[#1d2b21]"
                >
                  admin@rqmubarak.lalululu
                </a>
              </p>
            </nav>
            <nav aria-label="Tautan">
              <h3 className="font-display text-[15px] font-semibold text-[#1d2b21]">
                Tautan
              </h3>
              <ul className="mt-3 space-y-1.5 text-[12.5px] text-[#6b7a6e]">
                <li>
                  <a
                    href="#profil"
                    className="transition-colors hover:text-[#1d2b21]"
                  >
                    Profil
                  </a>
                </li>
                <li>
                  <a
                    href="#program"
                    className="transition-colors hover:text-[#1d2b21]"
                  >
                    Program Halaqah
                  </a>
                </li>
                <li>
                  <a
                    href="#sistem"
                    className="transition-colors hover:text-[#1d2b21]"
                  >
                    Sistem Digital
                  </a>
                </li>
                <li>
                  <a
                    href="#mading"
                    className="transition-colors hover:text-[#1d2b21]"
                  >
                    Mading
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </Reveal>
      <p className="mt-8 text-center text-[12.5px] text-[#6b7a6e]">
        © 2026 Rumah Qur&rsquo;an Mubarak. Hak Cipta Dilindungi.
      </p>
    </footer>
  );
}
