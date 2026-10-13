import { Check, KeyRound, Mail, Phone, User } from "lucide-react";
import { redirect } from "next/navigation";
import { ProfilFotoField } from "@/components/portal/profil-foto";
import { ThemeToggle } from "@/components/portal/theme-toggle";
import {
  AvatarNama,
  Field,
  FormNotice,
  PageHeader,
  Panel,
  PanelHeader,
  StatusBadge,
} from "@/components/portal/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updatePasswordSelf, updateProfil } from "@/lib/actions";
import { getAuthPemilik } from "@/lib/actions/shared";
import { humanize } from "@/lib/portal";

export default async function ProfilPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const sp = await searchParams;
  const { user, me } = await getAuthPemilik();
  if (!user || !me) redirect("/portal/login");

  return (
    <div className="space-y-5">
      <PageHeader
        title="Profil"
        description="Data pribadi akun + kata sandi + tampilan."
      />
      <FormNotice ok={sp.ok} error={sp.error} />

      <Panel>
        <PanelHeader title="Data pribadi" meta={humanize(me.peran)} />
        <div className="mt-4">
          {me.foto_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={me.foto_url}
              alt="Foto profil"
              className="size-14 rounded-full border border-[#d8e2d6] object-cover"
            />
          ) : (
            <AvatarNama
              nama={me.nama_lengkap ?? "?"}
              className="size-14 text-lg"
            />
          )}
        </div>
        <form action={updateProfil} className="mt-4 grid gap-3 sm:grid-cols-2">
          <Field label="Nama lengkap" icon={User}>
            <Input
              name="nama_lengkap"
              required
              defaultValue={me.nama_lengkap ?? ""}
              autoComplete="name"
            />
          </Field>
          <Field label="No. telepon" icon={Phone}>
            <Input
              name="no_telepon"
              defaultValue={me.no_telepon ?? ""}
              autoComplete="tel"
            />
          </Field>
          <Field label="Email (tidak bisa diubah)" icon={Mail}>
            <Input defaultValue={me.email ?? "—"} disabled />
          </Field>
          <div className="sm:col-span-2">
            <ProfilFotoField defaultUrl={me.foto_url ?? ""} />
          </div>
          <div className="flex items-center gap-2 sm:col-span-2">
            <Button type="submit" size="sm">
              <Check aria-hidden />
              Simpan
            </Button>
            <StatusBadge status={me.peran} />
            <StatusBadge status={me.status} />
          </div>
        </form>
      </Panel>

      <Panel>
        <PanelHeader title="Kata sandi" />
        <form
          action={updatePasswordSelf}
          className="mt-4 grid gap-3 sm:grid-cols-2"
        >
          <Field label="Kata sandi baru" icon={KeyRound}>
            <Input
              name="password"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
            />
          </Field>
          <Field label="Konfirmasi kata sandi" icon={KeyRound}>
            <Input
              name="confirm"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
            />
          </Field>
          <div className="sm:col-span-2">
            <Button type="submit" size="sm">
              <KeyRound aria-hidden />
              Simpan kata sandi
            </Button>
          </div>
        </form>
      </Panel>

      <Panel>
        <PanelHeader title="Tampilan" meta="Tersimpan di perangkat ini" />
        <div className="mt-4 max-w-xs">
          <ThemeToggle className="border border-[#d8e2d6]" />
        </div>
      </Panel>
    </div>
  );
}
