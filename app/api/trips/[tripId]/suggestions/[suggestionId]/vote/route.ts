import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(
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

  const { value } = await req.json(); // +1 or -1

  const existing = await db.vote.findUnique({
    where: { suggestionId_userId: { suggestionId, userId: session.user.id } },
  });

  if (existing) {
    if (existing.value === value) {
      // Remove vote (toggle off)
      await db.vote.delete({
        where: { suggestionId_userId: { suggestionId, userId: session.user.id } },
      });
    } else {
      // Change vote
      await db.vote.update({
        where: { suggestionId_userId: { suggestionId, userId: session.user.id } },
        data: { value },
      });
    }
  } else {
    await db.vote.create({
      data: { suggestionId, userId: session.user.id, value },
    });
  }

  const votes = await db.vote.findMany({
    where: { suggestionId },
    select: { userId: true, value: true, user: { select: { name: true } } },
  });

  return NextResponse.json(votes);
}
