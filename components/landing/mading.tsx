import { MadingCarousel } from "@/components/landing/mading-carousel";
import { Reveal } from "@/components/landing/reveal";
import { SectionHeading } from "@/components/landing/section-heading";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import type { MadingKonten } from "@/lib/portal";

/** Mading publik: carousel 3D. Sembunyi total bila kosong/error. */
export async function Mading() {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await createAdminClient()
    .from("MadingKonten")
    .select("id,judul,deskripsi,thumb_url,created_at,penulis_ref:penulis(nama_lengkap)")
    .order("created_at", { ascending: false })
    .limit(9);
  if (error || !data?.length) return null;
  const rows = data as unknown as MadingKonten[];

  return (
    <section
      id="mading"
      aria-labelledby="judul-mading"
      className="mx-auto w-full max-w-5xl scroll-mt-24 overflow-hidden px-4 py-12 sm:px-6 sm:py-16 lg:py-24"
    >
      <div className="mx-auto max-w-3xl">
        <Reveal>
          <SectionHeading
            id="judul-mading"
            title="Mading"
            description="Kabar dan pengumuman terbaru dari Rumah Qur'an Mubarak. Geser untuk melihat."
          />
        </Reveal>
      </div>
      <Reveal delay={0.06} className="mt-6 sm:mt-10">
        <MadingCarousel items={rows} />
      </Reveal>
    </section>
  );
}
