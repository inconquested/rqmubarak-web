import { notFound } from "next/navigation";
import { getMading, MadingArticle } from "@/components/mading-article";

/** Owner variant (requires login) — same as public version + Edit button. */
export default async function MadingArtikelPortalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const row = await getMading(id);
  if (!row) notFound();

  return (
    <MadingArticle
      row={row}
      backHref="/portal/mading"
      backLabel="Mading"
      editHref={`/portal/mading?edit=${row.id}`}
    />
  );
}
