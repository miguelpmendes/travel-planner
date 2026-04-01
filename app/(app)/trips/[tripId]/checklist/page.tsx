import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { ChecklistView } from "@/components/checklist/checklist-view";
import { DocumentsSection } from "@/components/checklist/documents-section";

export default async function ChecklistPage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  const session = await auth();

  const trip = await db.trip.findFirst({
    where: {
      id: tripId,
      members: { some: { userId: session!.user.id } },
    },
  });

  if (!trip) notFound();

  const [items, documents] = await Promise.all([
    db.checklistItem.findMany({
      where: { tripId, createdById: session!.user.id },
      orderBy: { createdAt: "asc" },
      select: { id: true, text: true, checked: true },
    }),
    db.tripDocument.findMany({
      where: { tripId },
      orderBy: { createdAt: "desc" },
      include: { createdBy: { select: { name: true } } },
    }),
  ]);

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
      <ChecklistView tripId={tripId} initialItems={items} />
      <DocumentsSection tripId={tripId} initialDocuments={documents} />
    </div>
  );
}
