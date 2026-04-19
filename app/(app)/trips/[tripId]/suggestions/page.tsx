import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { SuggestionsView } from "@/components/suggestions/suggestions-view";

export default async function SuggestionsPage({
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
      destination: true,
      days: { orderBy: { date: "asc" }, select: { id: true, date: true } },
    },
  });

  if (!trip) notFound();

  const suggestions = await db.suggestion.findMany({
    where: { tripId },
    include: {
      createdBy: { select: { name: true, avatarEmoji: true } },
      votes: { select: { userId: true, value: true, user: { select: { name: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <SuggestionsView
      tripId={tripId}
      destination={trip.destination.name}
      initialSuggestions={suggestions}
      days={trip.days}
      currentUserId={session!.user.id}
      isAdmin={session!.user.role === "ADMIN"}
    />
  );
}
