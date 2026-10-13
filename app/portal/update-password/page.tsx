"use client";

import { KeyRound, LoaderCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Reveal } from "@/components/portal/motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

function UpdateForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Exchange ?code= from the email link for a recovery session. If exchange
  // fails (e.g. code already used after refresh), the earlier session may
  // still exist — check it to avoid getting stuck on "Preparing…".
  useEffect(() => {
    let batal = false;
    (async () => {
      const db = createClient();
      const code = params.get("code");
      if (code) {
        const { error } = await db.auth.exchangeCodeForSession(code);
        if (!batal && !error) {
          setReady(true);
          return;
        }
      }
      const { data } = await db.auth.getSession();
      if (!batal) setReady(Boolean(data.session));
    })();
    return () => {
      batal = true;
    };
  }, [params]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);
    const p1 = fd.get("password")?.toString() ?? "";
    const p2 = fd.get("confirm")?.toString() ?? "";
    if (p1.length < 6) {
      setError("Kata sandi minimal 6 karakter.");
      return;
    }
    if (p1 !== p2) {
      setError("Konfirmasi kata sandi tidak sama.");
      return;
    }
    setLoading(true);
    const { error } = await createClient().auth.updateUser({ password: p1 });
    setLoading(false);
    if (error) {
      setError("Gagal menyimpan. Tautan mungkin kedaluwarsa — minta ulang.");
      return;
    }
    router.replace("/portal/login");
  }

  return (
    <Card className="p-5 sm:p-6">
      <h1 className="font-display text-xl font-medium text-[#1d2b21]">
        Atur kata sandi baru
      </h1>
      {!ready ? (
        <p className="mt-2 text-sm leading-relaxed text-[#6b7a6e]">
          Menyiapkan sesi reset… jika halaman ini dibuka tanpa tautan email,
          buka{" "}
          <a
            href="/portal/lupa-password"
            className="underline underline-offset-4"
          >
            lupa kata sandi
          </a>{" "}
          untuk minta tautan baru.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="mt-4 space-y-3.5">
          <div className="space-y-1.5">
            <Label htmlFor="password">Kata sandi baru</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirm">Konfirmasi kata sandi</Label>
            <Input
              id="confirm"
              name="confirm"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>
          {error ? (
            <p
              role="alert"
              className="rounded-lg bg-red-50 px-3 py-2 text-[13px] text-red-700"
            >
              {error}
            </p>
          ) : null}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <LoaderCircle aria-hidden className="animate-spin" />
            ) : (
              <KeyRound aria-hidden />
            )}
            {loading ? "Menyimpan…" : "Simpan kata sandi"}
          </Button>
        </form>
      )}
    </Card>
  );
}

export default function UpdatePasswordPage() {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-sm flex-col justify-center px-4 py-10">
      <Reveal>
        <Suspense>
          <UpdateForm />
        </Suspense>
      </Reveal>
    </div>
  );
}
