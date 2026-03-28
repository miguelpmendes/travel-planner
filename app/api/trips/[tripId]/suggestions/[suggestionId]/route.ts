import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PATCH(
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

  const body = await req.json();
  const { title, type, description, location, url, imageUrl } = body;

  const suggestion = await db.suggestion.update({
    where: { id: suggestionId },
    data: { title, type, description, location, url, imageUrl },
    include: {
      createdBy: { select: { name: true } },
      votes: { select: { userId: true, value: true } },
    },
  });

  return NextResponse.json(suggestion);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ tripId: string; suggestionId: string }> }
) {
  const { tripId, suggestionId } = await params;
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const member = await db.tripMember.findUnique({
    where: { tripId_userId: { tripId, userId: session.user.id } },
  });
  if (!member) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const suggestion = await db.suggestion.findUnique({ where: { id: suggestionId } });
  if (!suggestion) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isOwner = suggestion.createdById === session.user.id;
  const isAdmin = session.user.role === "ADMIN";

  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await db.suggestion.delete({ where: { id: suggestionId } });
  return new NextResponse(null, { status: 204 });
}
