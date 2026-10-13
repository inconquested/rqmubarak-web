import type { AdminDb } from "../shared";

export const MADING_BUCKET = "mading";

/** Delete orphaned files in our own bucket (best-effort, ignore failures). */
export async function removeMadingFile(db: AdminDb, url: string | null) {
  if (!url) return;
  const i = url.indexOf(`/${MADING_BUCKET}/`);
  if (i < 0) return; // External URL — not ours.
  await db.storage
    .from(MADING_BUCKET)
    .remove([url.slice(i + MADING_BUCKET.length + 2)]);
}
