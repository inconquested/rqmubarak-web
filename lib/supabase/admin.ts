import { createClient } from "@supabase/supabase-js";

/**
 * service_role client — bypasses RLS. Import ONLY from Server Component/Route/Action
 * after the owner role is verified (see requirePemilik).
 * RLS schema_real.sql scopes all rows to the logged-in teacher's assignments,
 * so a global owner recap is impossible via anon key.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.SUPABASE_SECRET_KEY ?? "",
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
