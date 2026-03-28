import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ tripId: string }> }
) {
  const { tripId } = await params;
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const members = await db.tripMember.findMany({
    where: { tripId },
    include: { user: { select: { id: true, name: true, username: true, avatarEmoji: true } } },
  });

  return NextResponse.json(members.map((m) => m.user));
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ tripId: string }> }
) {
  const { tripId } = await params;
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { username } = await req.json();

  const user = await db.user.findUnique({
    where: { username },
    select: { id: true, name: true, username: true, avatarEmoji: true, active: true },
  });

  if (!user) return NextResponse.json({ error: "Utilizador não encontrado" }, { status: 404 });
  if (!user.active) return NextResponse.json({ error: "Utilizador inativo" }, { status: 400 });

  const existing = await db.tripMember.findUnique({
    where: { tripId_userId: { tripId, userId: user.id } },
  });
  if (existing) return NextResponse.json({ error: "Já é membro desta viagem" }, { status: 409 });

  await db.tripMember.create({ data: { tripId, userId: user.id } });

  return NextResponse.json(user, { status: 201 });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ tripId: string }> }
) {
  const { tripId } = await params;
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { userId } = await req.json();

  await db.tripMember.delete({
    where: { tripId_userId: { tripId, userId } },
  });

  return new NextResponse(null, { status: 204 });
}
