/* Offline-first queue: CRUD payloads + `_pending` flag in localStorage.
 * Used while offline; resent automatically once back online. */

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
  /** Flag: recorded locally, not yet sent to the server. */
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
    /* storage full/blocked — queue is lost, don't crash the form. */
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

/** Shift the front of the queue (call BEFORE sending → safe from double-run). */
export function shiftQueue(): OfflineOp | undefined {
  const [head, ...rest] = loadQueue();
  if (!head) return undefined;
  saveQueue(rest);
  return head;
}

/** Push a failed op back to the front of the queue. */
export function requeueFront(op: OfflineOp) {
  saveQueue([op, ...loadQueue()]);
}

export function pendingCount() {
  return loadQueue().length;
}

/** Serialize FormData → string object. null when it holds a File (can't queue offline). */
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
