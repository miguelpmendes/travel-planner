import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { avatarEmoji } = await req.json();

  await db.user.update({
    where: { id: session.user.id },
    data: { avatarEmoji: avatarEmoji ?? null },
  });

  return NextResponse.json({ avatarEmoji });
}
