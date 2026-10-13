import type { EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

const safeNext = (v: string | null) =>
  v?.startsWith("/") && !v.startsWith("//") ? v : "/portal/update-password";

/* Exchange email (recovery) links for a session, on the server so session
   cookies are stored before the update-password page opens.
   Handles two link formats: token_hash+type and ?code= (PKCE). */
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams;
  const next = safeNext(q.get("next"));
  const db = await createClient();
  const token_hash = q.get("token_hash");
  const type = q.get("type") as EmailOtpType | null;
  if (token_hash && type) {
    const { error } = await db.auth.verifyOtp({ token_hash, type });
    if (!error) redirect(next);
  } else {
    const code = q.get("code");
    if (code) {
      const { error } = await db.auth.exchangeCodeForSession(code);
      if (!error) redirect(next);
    }
  }
  redirect("/portal/lupa-password?error=tautan");
}
