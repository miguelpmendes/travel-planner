import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { AssistantChat } from "@/components/assistant/assistant-chat";

export default async function AssistantPage({
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
    include: { destination: true },
  });

  if (!trip) notFound();

  const messages = await db.message.findMany({
    where: { tripId, userId: session!.user.id },
    orderBy: { createdAt: "asc" },
    select: { id: true, role: true, content: true },
  });

  return (
    <AssistantChat
      tripId={tripId}
      tripTitle={trip.title}
      destination={trip.destination.name}
      initialMessages={messages}
    />
  );
}
