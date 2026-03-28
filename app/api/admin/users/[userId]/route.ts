import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Prevent admin from deactivating themselves
  if (userId === session.user.id) {
    return NextResponse.json({ error: "Não podes modificar a tua própria conta" }, { status: 400 });
  }

  const body = await req.json();
  const user = await db.user.update({
    where: { id: userId },
    data: body,
    select: { id: true, name: true, email: true, role: true, active: true, createdAt: true },
  });

  return NextResponse.json(user);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (userId === session.user.id) {
    return NextResponse.json({ error: "Não podes apagar a tua própria conta" }, { status: 400 });
  }

  await db.user.delete({ where: { id: userId } });
  return new NextResponse(null, { status: 204 });
}
