"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { Reveal } from "@/components/portal/motion";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Sesi browser masih valid (mis. tombol back) → langsung ke portal.
  useEffect(() => {
    createClient()
      .auth.getSession()
      .then(({ data }) => {
        if (data.session) router.replace(params.get("next") || "/portal");
      });
  }, [router, params]);

  if (!isSupabaseConfigured()) {
    return (
      <Card className="p-5 sm:p-6">
        <h1 className="font-display text-xl font-medium text-[#1d2b21]">
          Supabase belum dikonfigurasi
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-[#6b7a6e]">
          Copas <code className="rounded bg-[#eef4ec] px-1">.env.example</code> ke{" "}
          <code className="rounded bg-[#eef4ec] px-1">.env.local</code>, isi URL + anon key +{" "}
          service_role, lalu restart dev server.
        </p>
      </Card>
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const { error } = await createClient().auth.signInWithPassword({
      email: fd.get("email")?.toString() ?? "",
      password: fd.get("password")?.toString() ?? "",
    });
    setLoading(false);
    if (error) {
      setError("Email atau kata sandi salah.");
      return;
    }
    router.push(params.get("next") || "/portal");
    router.refresh();
  }

  return (
    <Reveal>
    <Card className="p-5 sm:p-6">
      <h1 className="font-display text-xl font-medium text-[#1d2b21]">
        Portal Pemilik
      </h1>
      <p className="mt-1 text-sm text-[#6b7a6e]">
        Masuk dengan akun pemilik untuk mengelola data.
      </p>
      <form onSubmit={onSubmit} className="mt-4 space-y-3.5">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required autoComplete="email" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Kata sandi</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
          />
        </div>
        {error ? (
          <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-[13px] text-red-700">
            {error}
          </p>
        ) : null}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Memeriksa…" : "Masuk"}
        </Button>
      </form>
    </Card>
    </Reveal>
  );
}

export default function LoginPage() {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-sm flex-col justify-center px-4 py-10">
      <Suspense>
        <LoginForm />
      </Suspense>
      <p className="mt-6 text-center text-[12px] text-[#6b7a6e]">
        Halaman ini tidak terindeks dan tidak tertaut dari situs publik.
      </p>
    </div>
  );
}
