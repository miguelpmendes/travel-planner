import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ tripId: string; dayId: string }> }
) {
  const { tripId, dayId } = await params;
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const member = await db.tripMember.findUnique({
    where: { tripId_userId: { tripId, userId: session.user.id } },
  });
  if (!member) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { notes } = await req.json();
  const day = await db.itineraryDay.update({
    where: { id: dayId },
    data: { notes },
  });

  return NextResponse.json(day);
}
