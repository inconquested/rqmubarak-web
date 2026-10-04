import {
  BarChart3,
  BookOpen,
  ClipboardCheck,
  type LucideIcon,
  NotebookPen,
  ShieldCheck,
  Users,
  Zap,
} from "lucide-react";

export const NAV_LINKS = [
  { label: "Profil", href: "#profil" },
  { label: "Program", href: "#program" },
  { label: "Sistem", href: "#sistem" },
  { label: "Mading", href: "#mading" },
  { label: "Kontak", href: "#kontak" },
] as const;

export type Program = {
  icon: LucideIcon;
  title: string;
  description: string;
  frequency: string;
};

export const PROGRAMS: Program[] = [
  {
    icon: BookOpen,
    title: "Reguler",
    description:
      "Kelas dasar untuk anak dan remaja yang sedang belajar membaca Al-Qur'an juga menambah hafalan dengan tajwid yang benar.",
    frequency: "2x seminggu",
  },
  {
    icon: Zap,
    title: "Intensif",
    description:
      "Program terarah untuk santri yang ingin menambah hafalan secara konsisten dan terukur.",
    frequency: "5x seminggu",
  },
  {
    icon: Users,
    title: "Dewasa",
    description:
      "Kelas fleksibel bagi orang tua dan pekerja yang ingin memperbaiki bacaan dari awal.",
    frequency: "2x seminggu",
  },
];

export type Feature = {
  icon: LucideIcon;
  title: string;
  description: string;
};

export const FEATURES: Feature[] = [
  {
    icon: ClipboardCheck,
    title: "Absensi cepat",
    description: "Tandai hadir, izin, atau sakit dalam beberapa ketukan.",
  },
  {
    icon: NotebookPen,
    title: "Mutaba'ah harian",
    description: "Catat setoran, murajaah, dan halamannya dicapai.",
  },
  {
    icon: BarChart3,
    title: "Laporan otomatis",
    description: "Rekap mingguan dan bulanan tersusun tanpa input ulang.",
  },
  {
    icon: ShieldCheck,
    title: "Data aman",
    description:
      "Hanya pengajar terdaftar yang dapat masuk dan mengubah catatan.",
  },
];

export const VISI = [
  "Bacaan Al-Qur'an yang benar dan fasih",
  "Hafalan yang terjaga lewat mutaba'ah rutin",
  "Adab yang tumbuh bersama ilmu",
] as const;
