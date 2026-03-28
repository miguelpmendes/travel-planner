import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ tripId: string }> }
) {
  const { tripId } = await params;
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const member = await db.tripMember.findUnique({
    where: { tripId_userId: { tripId, userId: session.user.id } },
  });
  if (!member) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const days = await db.itineraryDay.findMany({
    where: { tripId },
    include: {
      items: {
        orderBy: { order: "asc" },
        include: { createdBy: { select: { name: true } } },
      },
    },
    orderBy: { date: "asc" },
  });

  return NextResponse.json(days);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ tripId: string }> }
) {
  const { tripId } = await params;
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const member = await db.tripMember.findUnique({
    where: { tripId_userId: { tripId, userId: session.user.id } },
  });
  if (!member) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { dayId, title, type, startTime, endTime, location, notes } = body;

  const count = await db.itineraryItem.count({ where: { dayId } });

  const item = await db.itineraryItem.create({
    data: {
      dayId,
      title,
      type,
      startTime,
      endTime,
      location,
      notes,
      order: count,
      createdById: session.user.id,
    },
    include: { createdBy: { select: { name: true } } },
  });

  return NextResponse.json(item, { status: 201 });
}
