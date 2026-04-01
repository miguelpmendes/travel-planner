import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ tripId: string }> }
) {
  const { tripId } = await params;
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const trip = await db.trip.findUnique({ where: { id: tripId } });
  if (!trip) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.trip.delete({ where: { id: tripId } });

  return new NextResponse(null, { status: 204 });
}
