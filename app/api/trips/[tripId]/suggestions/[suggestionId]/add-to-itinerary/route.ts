import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ tripId: string; suggestionId: string }> }
) {
  const { tripId, suggestionId } = await params;
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const member = await db.tripMember.findUnique({
    where: { tripId_userId: { tripId, userId: session.user.id } },
  });
  if (!member) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { dayId, startTime, endTime } = await req.json();

  const suggestion = await db.suggestion.findUnique({ where: { id: suggestionId } });
  if (!suggestion) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const count = await db.itineraryItem.count({ where: { dayId } });

  const item = await db.itineraryItem.create({
    data: {
      dayId,
      title: suggestion.title,
      type: suggestion.type,
      location: suggestion.location,
      notes: suggestion.description,
      startTime: startTime ?? null,
      endTime: endTime ?? null,
      order: count,
      suggestionId,
      createdById: session.user.id,
    },
  });

  await db.suggestion.update({
    where: { id: suggestionId },
    data: { addedToItinerary: true },
  });

  return NextResponse.json(item, { status: 201 });
}
