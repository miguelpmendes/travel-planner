import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { ItineraryView } from "@/components/itinerary/itinerary-view";

export default async function ItineraryPage({
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
    include: {
      days: {
        include: {
          items: {
            orderBy: { order: "asc" },
            include: { createdBy: { select: { name: true } } },
          },
        },
        orderBy: { date: "asc" },
      },
    },
  });

  if (!trip) notFound();

  return <ItineraryView trip={trip} />;
}
