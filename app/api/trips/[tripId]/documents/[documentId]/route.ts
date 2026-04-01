import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { del } from "@vercel/blob";
import { NextResponse } from "next/server";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ tripId: string; documentId: string }> }
) {
  const { tripId, documentId } = await params;
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const member = await db.tripMember.findUnique({
    where: { tripId_userId: { tripId, userId: session.user.id } },
  });
  if (!member) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const document = await db.tripDocument.findUnique({ where: { id: documentId } });
  if (!document) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await del(document.url);
  await db.tripDocument.delete({ where: { id: documentId } });

  return new NextResponse(null, { status: 204 });
}
