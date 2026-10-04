# Design System: Rumah Qur'an Mubarak Web

Single source of truth untuk semua layar baru (Stitch / AI / manual).
Bahasa konten: Indonesia. Suasana: pesantren modern yang sabar, sejuk, rapi.

## 1. Visual Theme & Atmosphere

Sejuk, tenang, dan terpercaya — seperti serambi majelis yang terang di pagi hari.
Density 4 (Daily App Balanced, airy): banyak napas, satu ide per layar.
Variance 3 (Predictable Symmetric): hero centered, section left-aligned, tidak ada overlap.
Motion 5 (Fluid Restrained): fade+rise halus sekali saja, ornamen melayang lambat, tidak ada koreografi sinematik.

Prinsip: hierarki lewat berat font dan warna, bukan ukuran raksasa. Elevation hanya bila menyampaikan hierarki. Semua terasa "didampingi, bukan dijual".

## 2. Color Palette & Roles

Basis netral hijau-abu (sage-tinted), bukan abu netral murni. Satu aksen saja.

- **Canvas Mist** (#FBFDFB) — background halaman root (`page.tsx`). Jangan putih polos.
- **Surface Pure** (#FFFFFF) — fill Card, dropdown menu mobile.
- **Footer Mist** (#FAFCFA) — panel footer, sedikit lebih gelap dari canvas.
- **Nav Frost** (#F0F5EE / 90% + `backdrop-blur-md`) — navbar mengambang. Border `white/60`.
- **Ink Pine** (#1D2B21) — teks utama, judul, ikon check. Varian hero: #1A241D.
- **Bark Soft** (#4B5B4F) — teks list visi, link mobile, secondary kuat.
- **Sage Muted** (#6B7A6E) — body 13–15px, deskripsi section, metadata. Selalu `leading-relaxed`.
- **Sage Solid** (#CBDCC9) — SATU-SATUNYA aksen. Fill button primary, selection `::selection`. Hover: #BCCFBA.
- **Tile Wash** (gradient `#D5E3D3` → `#E9F1E7`) — fill IconTile. Teks ikon: #3D4F42.
- **Visi Wash** (gradient `#E4EEE2` → white) — hanya untuk kartu Visi Kami.
- **Hairline Sage** (#D8E2D6) — border button outline, dropdown. Border kartu umum: `white/60`.
- **Ornament Sage** (#9DB5A0 / 40–50%) — garis putus-putus ornamen hero (lingkaran, kotak miring). Dekorasi saja.
- **Blob Wash** (#DDE8DA, #EEF4EC, #D5E3D3, #CFDFCC, #E3EDE1) — radial-gradient latar hero/sistem, opacity rendah, `transparent 70%`. Tidak boleh jadi fill solid.
- **Theme Chrome** (#EDF3EB) — `themeColor`, manifest `background_color` #FBFDFB.

Token shadcn (`globals.css`, oklch) hanya untuk komponen generik: `--primary` teal oklch(0.511 0.096 186.391), `--border` oklch(0.925 0.005 214.3), `--radius` 0.875rem. Untuk landing, selalu pakai hex di atas.

## 3. Typography Rules

- **Display:** Fraunces (`font-display`, `next/font/google`, weights 400/500/600, variable `--font-fraunces`). Hanya untuk `h1/h2/h3` dan angka hero. `tracking-tight`, `font-medium/semibold`, `text-balance`. Skala: hero `text-[1.9rem] sm:text-5xl lg:text-[3.4rem] leading-[1.15→1.12]`, section `h2 text-2xl sm:text-3xl lg:text-4xl leading-[1.2→1.15]`, kartu `text-lg sm:text-xl` / `text-[15px] font-semibold`.
- **Body:** Inter (`--font-sans`, latin). Ukuran kecil tapi lega: 12.5–15px, `leading-relaxed/snug`, warna Sage Muted. Maks ~65ch (`max-w-md/xl`). Bahasa Indonesia santai-formal.
- **Mono:** hanya untuk metadata/kode bila perlu (`--font-geist-mono`). Angka frekuensi ("2x seminggu") pakai sans semibold, bukan mono.
- **Banned:** Inter untuk display/headline. Serif generik (Georgia/Times/Garamond) untuk body — Georgia hanya fallback `font-display`. Tidak ada gradient-text pada header besar. Tidak ada `font-bold` berlebih; hierarki via `medium/semibold` + warna Ink vs Muted.

## 4. Component Stylings

- **Buttons** (`components/ui/button.tsx`): `rounded-lg`, `text-sm font-medium`. Varian: `sage` (default, bg Sage Solid → hover shadow `0 8px 20px -8px rgba(61,79,66,0.45)`), `outline` (border Hairline, bg white → hover #F2F7F1), `ghost`. Size: `sm h-8 px-3 text-[13px]`, default `h-10 px-5`, `lg h-11 px-6`. Interaksi: `active:translate-y-px active:scale-[0.97]`, `focus-visible:ring-2`, transisi `transform,background-color,box-shadow 160ms ease-out`. CTA primer maksimal 1 per section (hero: "Portal Pengajar").
- **Cards** (`components/ui/card.tsx`): `rounded-2xl border-white/60 bg-white` + shadow `inset 0 1px 0 rgba(255,255,255,0.7), 0 1px 2px rgba(29,43,33,0.06), 0 12px 40px -16px rgba(61,79,66,0.18)`. Padding `p-4 sm:p-6`. Hover `.lift`: `translateY(-4px)` + shadow dalam `0 2px 4px rgba(29,43,33,0.08), 0 24px 56px -16px rgba(61,79,66,0.3)` — hanya `@media (hover:hover) and (pointer:fine)`.
- **IconTile:** `size-11 (sm) / size-9 (dense)`, `rounded-lg`, gradient Tile Wash, ikon Lucide `size-4/5` warna #3D4F42. Selalu di atas judul kartu, tidak ada emoji.
- **Navbar:** floating pill `sticky top-3 z-40 max-w-3xl rounded-2xl border-white/60 bg-Nav-Frost backdrop-blur-md shadow-[0_8px_30px_-12px_rgba(61,79,66,0.25)]`, tinggi `h-14`, `pl-4 pr-2`. Link desktop `text-[13px]` Sage Muted → hover Ink + underline grow `.nav-link::after` (`scaleX 0→1`, 200ms). Mobile: `<details>` + `.menu-panel` (`w-44 rounded-xl border-Hairline bg-white`), tanpa JS. Tombol Login `size="sm" rounded-lg`.
- **SectionHeading:** `max-w-xl`, judul Fraunces Ink + deskripsi `mt-2.5 text-sm sm:text-[15px]` Sage Muted. Default `align="left"`; center hanya untuk hero.
- **Visi list:** ikon Check dalam lingkaran `size-4 bg-Ink-Pine text-white [&_svg]:size-2.5 strokeWidth={3}`, teks `text-[13px] leading-snug` Bark Soft.
- **Footer:** panel `rounded-3xl border-white/60 bg-Footer-Mist px-5 py-6 sm:px-8 sm:py-10 lg:px-12 shadow-[0_12px_40px_-16px_rgba(61,79,66,0.15)]`, grid `sm:2-col lg:3-col`, teks `text-[12.5px]` Muted. Copyright center `mt-8`.
- **Loaders/Empty/Error:** skeletal shimmer seukuran layout (tidak ada spinner lingkaran generik). Empty state berupa komposisi ajakan mengisi, bukan teks "No data" saja. Error inline di bawah input.

## 5. Layout Principles

- Grid-first, tanpa `calc()` flex-hack. Contain ketat: hero/about/navbar `max-w-3xl`, programs/system/footer `max-w-5xl`, `mx-auto px-4 sm:px-6`.
- Hero: `max-w-3xl flex-col items-center text-center px-4 pt-10 pb-12 sm:pt-16 sm:pb-20 lg:pt-20 lg:pb-24`. Section: `py-12 sm:py-16 lg:py-24`, anchor `scroll-mt-24`.
- Grid pola: About `md:grid-cols-[1.2fr_0.8fr] items-start gap-6 sm:gap-10`; Programs `md:grid-cols-3 gap-4 sm:gap-5`; System `sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5`.
- Larangan keras: tidak ada elemen overlap/absolute stacking konten. Tidak ada "3 kartu sama persis horizontal" yang generik — bedakan frekuensi + CTA per kartu (lihat `lib/landing.ts`: Reguler/Intensif/Dewasa). Tidak ada teks filler "Scroll to explore" / panah memantul.
- Background blob radial di root `page.tsx` + `Parallax` per-section agar menyatu dengan navbar (jangan pasang bg per-section yang memotong).
- Full-height pakai `min-h-[100dvh]`, tidak pernah `h-screen`.

## 6. Motion & Interaction

- Kurva tunggal: `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)` (CSS) / `EASE_OUT [0.23,1,0.32,1]` (framer-motion).
- Enter hero (`hero.tsx Enter`): `opacity 0→1, translateY 16px→0`, `duration 0.6`, stagger `delay 0 / 0.08 / 0.16`. Scroll reveal (`reveal.tsx`): sama + `whileInView once:true amount:0.3`, stagger kartu `i * 0.06`.
- Parallax ornamen (`parallax.tsx`): `speed 0.18 / 0.12 / -0.06 / 0.1`, `transform`-only. Ornamen hero: lingkaran dashed `size-36 border-dashed` + kotak `size-20 rotate-45 rounded-xl`, class `animate-drift` (9s infinite, `translateY -10px + rotate 2deg`).
- Mikro-interaksi: `.lift` 200ms + `.lift-icon scale(1.08)`, link `.nudge-target translateX(3px)` — semuanya di-gate `(hover:hover) and (pointer:fine)` agar tidak lengket di sentuh. Menu mobile `menu-in` 200ms (`opacity + translateY -4px scale 0.98`).
- Performa: animasi hanya `transform` + `opacity`. Tidak ada `top/left/width/height`. Hormati `prefers-reduced-motion` / `useReducedMotion()` (nonaktifkan drift + reveal).
- Isolasi: fisika berat (framer-motion) hanya di Client Component daun (`hero`, `reveal`, `parallax`).

## 7. Anti-Patterns (Banned)

- Tidak ada emoji di UI mana pun. Ikon hanya Lucide (`BookOpen, Zap, Users, ClipboardCheck, NotebookPen, BarChart3, ShieldCheck, Check, Menu, ArrowRight`).
- Tidak ada Inter untuk headline; tidak ada serif generik untuk body/dashboard.
- Tidak ada `#000000`. Hitam paling pekat adalah Ink Pine #1D2B21.
- Tidak ada neon/outer glow, tidak ada gradient ungu-biru, tidak ada aksen jenuh >80%. Satu aksen Sage saja.
- Tidak ada gradient-text pada header besar. Tidak ada kursor mouse kustom.
- Tidak ada elemen overlap, tidak ada teks di atas gambar tanpa zona sendiri.
- Tidak ada hero centered untuk proyek variance tinggi — pengecualian di sini: hero situs ini centered karena Variance 3 (wajar untuk lembaga pendidikan).
- Tidak ada baris "3 kartu sama persis" tanpa pembeda; tidak ada nama generik (Acme/Nexus/John Doe); tidak ada angka palsu (99.99%/50%); tidak ada klise AI (Elevate/Seamless/Unleash/Next-Gen); tidak ada "Scroll to explore"/chevron memantul.
- Tidak ada link gambar rusak — logo lokal `/logo-notext.svg`, tidak ada hotlink Unsplash.
- Mobile (<768px): semua multi-kolom runtuh ke 1 kolom, tidak ada horizontal scroll, headline pakai `clamp()`/breakpoint, body min `1rem`/14px, tap target min 44px, gambar inline menumpuk di bawah headline, spacing vertikal `clamp(3rem, 8vw, 6rem)`.
