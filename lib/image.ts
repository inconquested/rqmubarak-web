export const MAX_SIDE = 1280;
export const TARGET_BYTES = 600 * 1024;

/** Compress canvas to WebP — lower quality until ≤600KB. */
export async function canvasToWebP(
  canvas: HTMLCanvasElement,
): Promise<Blob> {
  for (const q of [0.82, 0.68, 0.55]) {
    const blob = await new Promise<Blob | null>((res) =>
      canvas.toBlob(res, "image/webp", q),
    );
    if (blob && (blob.size <= TARGET_BYTES || q === 0.55)) return blob;
  }
  throw new Error("compress-fail");
}
