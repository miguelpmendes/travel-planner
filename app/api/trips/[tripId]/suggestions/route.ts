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

  const suggestions = await db.suggestion.findMany({
    where: { tripId },
    include: {
      createdBy: { select: { name: true } },
      votes: { select: { userId: true, value: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(suggestions);
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
  const { title, type, description, location, url } = body;

  const suggestion = await db.suggestion.create({
    data: {
      tripId,
      title,
      type,
      description,
      location,
      url,
      createdById: session.user.id,
    },
    include: {
      createdBy: { select: { name: true } },
      votes: { select: { userId: true, value: true } },
    },
  });

  return NextResponse.json(suggestion, { status: 201 });
}
