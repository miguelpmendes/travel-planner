import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { ChecklistView } from "@/components/checklist/checklist-view";

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

  const items = await db.checklistItem.findMany({
    where: { tripId, createdById: session!.user.id },
    orderBy: { createdAt: "asc" },
    select: { id: true, text: true, checked: true },
  });

  return <ChecklistView tripId={tripId} initialItems={items} />;
}
