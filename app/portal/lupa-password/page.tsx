"use client";

import { LoaderCircle, Send } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Reveal } from "@/components/portal/motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

function ForgotForm() {
  const params = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(
    params.get("error") === "tautan"
      ? "Tautan tidak valid atau kedaluwarsa. Minta tautan baru di bawah."
      : "",
  );

  if (!isSupabaseConfigured()) {
    return (
      <Card className="p-5 sm:p-6">
        <h1 className="font-display text-xl font-medium text-[#1d2b21]">
          Supabase belum dikonfigurasi
        </h1>
      </Card>
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const email = fd.get("email")?.toString() ?? "";
    const { error } = await createClient().auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/confirm?next=/portal/update-password`,
    });
    setLoading(false);
    if (error) {
      // Show the raw Supabase message (e.g. redirect URL not allowed,
      // rate limit, SMTP not configured) so the cause is visible.
      setError(`Gagal mengirim tautan: ${error.message}`);
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <Card className="p-5 sm:p-6">
        <h1 className="font-display text-xl font-medium text-[#1d2b21]">
          Cek email kamu
        </h1>
        <p className="mt-1 text-sm leading-relaxed text-[#6b7a6e]">
          Jika email terdaftar, tautan atur ulang kata sandi sudah dikirim.
          Tautan kedaluwarsa ±1 jam.
        </p>
        <p className="mt-4 text-center text-[13px]">
          <a href="/portal/login" className="underline underline-offset-4">
            Kembali masuk
          </a>
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-5 sm:p-6">
      <h1 className="font-display text-xl font-medium text-[#1d2b21]">
        Lupa kata sandi
      </h1>
      <p className="mt-1 text-sm text-[#6b7a6e]">
        Masukkan email akun pemilik. Kami kirim tautan atur ulang.
      </p>
      <form onSubmit={onSubmit} className="mt-4 space-y-3.5">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
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
            <Send aria-hidden />
          )}
          {loading ? "Mengirim…" : "Kirim tautan reset"}
        </Button>
        <p className="text-center text-[13px]">
          <a href="/portal/login" className="underline underline-offset-4">
            Kembali masuk
          </a>
        </p>
      </form>
    </Card>
  );
}

export default function LupaPasswordPage() {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-sm flex-col justify-center px-4 py-10">
      <Reveal>
        <Suspense>
          <ForgotForm />
        </Suspense>
      </Reveal>
    </div>
  );
}
