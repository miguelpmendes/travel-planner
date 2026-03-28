import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ tripId: string; itemId: string }> }
) {
  const { tripId, itemId } = await params;
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const member = await db.tripMember.findUnique({
    where: { tripId_userId: { tripId, userId: session.user.id } },
  });
  if (!member) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const item = await db.itineraryItem.update({
    where: { id: itemId },
    data: body,
    include: { createdBy: { select: { name: true } } },
  });

  return NextResponse.json(item);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ tripId: string; itemId: string }> }
) {
  const { tripId, itemId } = await params;
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const member = await db.tripMember.findUnique({
    where: { tripId_userId: { tripId, userId: session.user.id } },
  });
  if (!member) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const item = await db.itineraryItem.findUnique({ where: { id: itemId } });

  await db.itineraryItem.delete({ where: { id: itemId } });

  // If this item came from a suggestion, check if any other item still links to it
  if (item?.suggestionId) {
    const stillLinked = await db.itineraryItem.count({
      where: { suggestionId: item.suggestionId },
    });
    if (stillLinked === 0) {
      await db.suggestion.update({
        where: { id: item.suggestionId },
        data: { addedToItinerary: false },
      });
    }
  }

  return new NextResponse(null, { status: 204 });
}
