/* Antrean offline-first: payload CRUD + flag `_pending` di localStorage.
 * Dipakai saat luring; dikirim ulang otomatis begitu daring kembali. */

export type OfflineResource =
  | "kelas"
  | "pengguna"
  | "santri"
  | "mengajar"
  | "absensi"
  | "mutabaah"
  | "mading";

export type OfflineOpKind = "upsert" | "delete";

export type OfflineOp = {
  id: string;
  resource: OfflineResource;
  op: OfflineOpKind;
  payload: Record<string, string>;
  createdAt: number;
  /** Flag: tercatat lokal, belum terkirim ke server. */
  _pending: true;
};

const KEY = "rqmubarak:offline-queue:v1";
const EVENT = "rqmubarak:queue-changed";

function canUseStorage() {
  return typeof window !== "undefined" && !!window.localStorage;
}

export function loadQueue(): OfflineOp[] {
  if (!canUseStorage()) return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as OfflineOp[]) : [];
  } catch {
    return [];
  }
}

function saveQueue(q: OfflineOp[]) {
  if (!canUseStorage()) return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(q));
  } catch {
    /* storage penuh/diblokir — antrean hilang, jangan crash form. */
  }
  window.dispatchEvent(new Event(EVENT));
}

function newId() {
  const c = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : "";
  return c || `${Date.now()}-${Math.floor(Math.random() * 1e9)}`;
}

export function enqueueOp(op: Omit<OfflineOp, "id" | "createdAt" | "_pending">) {
  saveQueue([...loadQueue(), { ...op, id: newId(), createdAt: Date.now(), _pending: true }]);
}

/** Keluarkan antrean paling depan (dipakai SEBELUM kirim → aman dari double-run). */
export function shiftQueue(): OfflineOp | undefined {
  const [head, ...rest] = loadQueue();
  if (!head) return undefined;
  saveQueue(rest);
  return head;
}

/** Kembalikan op gagal ke depan antrean. */
export function requeueFront(op: OfflineOp) {
  saveQueue([op, ...loadQueue()]);
}

export function pendingCount() {
  return loadQueue().length;
}

/** Serialize FormData → object string. null bila ada File (tak bisa antre offline). */
export function formPayload(form: HTMLFormElement): Record<string, string> | null {
  const out: Record<string, string> = {};
  for (const [k, v] of new FormData(form).entries()) {
    if (typeof v !== "string") return null;
    out[k] = v;
  }
  return out;
}

export function onQueueChange(fn: () => void) {
  if (!canUseStorage()) return () => {};
  const handler = () => fn();
  window.addEventListener(EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}
