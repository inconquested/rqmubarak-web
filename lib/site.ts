/**
 * Konfigurasi situs terpusat untuk SEO.
 * ponytail: ganti dengan domain produksi via env NEXT_PUBLIC_SITE_URL.
 */
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://rqmubarak.web.id";

export const site = {
  name: "Rumah Qur'an Mubarak",
  tagline: "Menjadi Keluarga Allah Dengan Al-Qur'an",
  description:
    "Rumah Qur'an Mubarak adalah tempat les mengaji anak hingga tahsin dewasa: membaca dan menghafal Al-Qur'an dalam halaqah yang hangat, dengan mutaba'ah digital dan rapor hafalan yang rapi untuk orang tua.",
  locale: "id_ID",
  phone: "+62 895-0000-0000",
  email: "admin@rqmubarak.lalululu",
  hours: "Senin–Minggu, 08.00–20.00 WIB",
} as const;
