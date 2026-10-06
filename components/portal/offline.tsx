"use client";

import { useCallback, useEffect, useState } from "react";
import {
  deleteAbsensi,
  deleteKelas,
  deleteMading,
  deleteMengajar,
  deleteMutabaah,
  deletePengguna,
  deleteSantri,
  upsertAbsensi,
  upsertKelas,
  upsertMading,
  upsertMengajar,
  upsertMutabaah,
  upsertPengguna,
  upsertSantri,
} from "@/lib/actions";
import {
  enqueueOp,
  formPayload,
  loadQueue,
  onQueueChange,
  requeueFront,
  shiftQueue,
  type OfflineOpKind,
  type OfflineResource,
} from "@/lib/offline-queue";

type ServerFn = (fd: FormData) => Promise<void>;

/* Registri replay: resource halaman → pasangan server action-nya. */
const ACTIONS: Record<OfflineResource, Record<OfflineOpKind, ServerFn>> = {
  kelas: { upsert: upsertKelas, delete: deleteKelas },
  pengguna: { upsert: upsertPengguna, delete: deletePengguna },
  santri: { upsert: upsertSantri, delete: deleteSantri },
  mengajar: { upsert: upsertMengajar, delete: deleteMengajar },
  absensi: { upsert: upsertAbsensi, delete: deleteAbsensi },
  mutabaah: { upsert: upsertMutabaah, delete: deleteMutabaah },
  mading: { upsert: upsertMading, delete: deleteMading },
};

const isRedirectError = (e: unknown) =>
  e instanceof Error &&
  (e.message.includes("NEXT_REDIRECT") || (e as { digest?: unknown }).digest === "NEXT_REDIRECT" ||
    String((e as { digest?: unknown }).digest ?? "").startsWith("NEXT_REDIRECT"));

/* Pengganti <form action={...}>: daring → server action normal;
 * luring → payload + flag _pending masuk localStorage. */
export function OfflineForm({
  resource,
  op,
  action,
  className,
  children,
}: {
  resource: OfflineResource;
  op: OfflineOpKind;
  action: ServerFn;
  className?: string;
  children: React.ReactNode;
}) {
  const [queued, setQueued] = useState(false);
  const [blocked, setBlocked] = useState(false);

  return (
    <form
      action={action}
      className={className}
      onSubmit={(e) => {
        if (navigator.onLine) return;
        e.preventDefault();
        const payload = formPayload(e.currentTarget);
        if (!payload) {
          setBlocked(true);
          return;
        }
        enqueueOp({ resource, op, payload });
        setQueued(true);
      }}
    >
      {children}
      {queued ? (
        <p role="status" className="mt-2 text-[12px] text-amber-700">
          Luring — tersimpan di perangkat, terkirim otomatis saat daring.
        </p>
      ) : null}
      {blocked ? (
        <p role="alert" className="mt-2 text-[12px] text-red-700">
          Butuh koneksi untuk mengirim data ini.
        </p>
      ) : null}
    </form>
  );
}

let replaying = false;

/* Banner status + kirim ulang antrean begitu daring (sekali pasang di layout). */
export function OfflineProvider({ children }: { children: React.ReactNode }) {
  const [online, setOnline] = useState(true);
  const [pending, setPending] = useState(0);
  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState(false);

  const replay = useCallback(async () => {
    if (replaying || !navigator.onLine) return;
    replaying = true;
    setSending(true);
    setFailed(false);
    try {
      // Shift DULU sebelum kirim → StrictMode double-effect tak menggandakan.
      // Sukses = server me-redirect (NEXT_REDIRECT); navigasi memuat ulang dan
      // sisa antrean lanjut terkirim setelah mount ulang.
      for (;;) {
        const head = shiftQueue();
        if (!head || !navigator.onLine) break;
        const fd = new FormData();
        for (const [k, v] of Object.entries(head.payload)) fd.append(k, v);
        try {
          await ACTIONS[head.resource][head.op](fd);
        } catch (e) {
          if (!isRedirectError(e)) {
            requeueFront(head);
            setFailed(true);
            break;
          }
        }
      }
    } finally {
      replaying = false;
      setSending(false);
      setPending(loadQueue().length);
    }
  }, []);

  useEffect(() => {
    setOnline(navigator.onLine);
    setPending(loadQueue().length);
    const goOnline = () => {
      setOnline(true);
      void replay();
    };
    const goOffline = () => setOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    const unsub = onQueueChange(() => setPending(loadQueue().length));
    if (navigator.onLine && loadQueue().length) void replay();
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
      unsub();
    };
  }, [replay]);

  const show = !online || pending > 0;
  return (
    <>
      {show ? (
        <div
          role="status"
          className={
            !online || failed
              ? "mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-[13px] text-amber-900"
              : "mb-4 rounded-xl border border-[#d8e2d6] bg-[#eef4ec] px-4 py-2.5 text-[13px] text-[#4b5b4f]"
          }
        >
          {!online ? (
            <>Luring — perubahan disimpan di perangkat ({pending} antrean).</>
          ) : sending ? (
            <>Kembali daring — mengirim {pending} antrean…</>
          ) : failed ? (
            <span className="flex flex-wrap items-center gap-2">
              <span>Gagal mengirim {pending} antrean.</span>
              <button
                type="button"
                onClick={() => void replay()}
                className="rounded-lg border border-amber-300 bg-white px-2 py-0.5 text-[12px] font-medium hover:bg-amber-100"
              >
                Kirim ulang
              </button>
            </span>
          ) : (
            <span className="flex flex-wrap items-center gap-2">
              <span>{pending} antrean menunggu.</span>
              <button
                type="button"
                onClick={() => void replay()}
                className="rounded-lg border border-[#bccfba] bg-white px-2 py-0.5 text-[12px] font-medium hover:bg-[#eef4ec]"
              >
                Kirim sekarang
              </button>
            </span>
          )}
        </div>
      ) : null}
      {children}
    </>
  );
}
