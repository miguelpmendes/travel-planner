import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { put } from "@vercel/blob";
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

  const documents = await db.tripDocument.findMany({
    where: { tripId },
    orderBy: { createdAt: "desc" },
    include: { createdBy: { select: { name: true } } },
  });

  return NextResponse.json(documents);
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

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "File too large (max 10 MB)" }, { status: 413 });
  }

  const blob = await put(`trips/${tripId}/${file.name}`, file, {
    access: "public",
    addRandomSuffix: true,
  });

  const document = await db.tripDocument.create({
    data: {
      tripId,
      name: file.name,
      url: blob.url,
      size: file.size,
      contentType: file.type,
      createdById: session.user.id,
    },
    include: { createdBy: { select: { name: true } } },
  });

  return NextResponse.json(document, { status: 201 });
}
