import { createClient } from "@supabase/supabase-js";

/**
 * Klien service_role — bypass RLS. Impor HANYA dari Server Component/Route/Action
 * setelah peran pemilik terverifikasi (lihat requirePemilik).
 * RLS schema_real.sql men-scope semua baris ke penugasan pengajar yang login,
 * jadi rekap global pemilik mustahil via anon key.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.SUPABASE_SECRET_KEY ?? "",
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
