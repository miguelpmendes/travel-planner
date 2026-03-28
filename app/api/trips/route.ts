import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { eachDayOfInterval, parseISO } from "date-fns";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const trips = await db.trip.findMany({
    where: {
      members: { some: { userId: session.user.id } },
    },
    include: {
      destination: true,
      members: { include: { user: { select: { id: true, name: true } } } },
    },
    orderBy: { startDate: "asc" },
  });

  return NextResponse.json(trips);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { title, destinationId, startDate, endDate } = body;

  if (!title || !destinationId || !startDate || !endDate) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const start = parseISO(startDate);
  const end = parseISO(endDate);

  const trip = await db.trip.create({
    data: {
      title,
      destinationId,
      startDate: start,
      endDate: end,
      members: {
        create: { userId: session.user.id },
      },
      days: {
        create: eachDayOfInterval({ start, end }).map((date) => ({ date })),
      },
    },
    include: { destination: true },
  });

  return NextResponse.json(trip, { status: 201 });
}
