import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { anthropic } from "@/lib/claude";
import { NextResponse } from "next/server";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

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

  const messages = await db.message.findMany({
    where: { tripId },
    orderBy: { createdAt: "asc" },
    select: { id: true, role: true, content: true, createdAt: true, user: { select: { name: true } } },
  });

  return NextResponse.json(messages);
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

  const { message } = await req.json();
  if (!message?.trim()) return NextResponse.json({ error: "Empty message" }, { status: 400 });

  // Save user message
  await db.message.create({
    data: { tripId, userId: session.user.id, role: "user", content: message },
  });

  // Build context from trip
  const trip = await db.trip.findUnique({
    where: { id: tripId },
    include: {
      destination: true,
      days: {
        include: { items: { orderBy: { order: "asc" } } },
        orderBy: { date: "asc" },
      },
    },
  });

  const itinerarySummary =
    trip?.days
      .map(
        (day) =>
          `${format(day.date, "EEEE d MMM", { locale: ptBR })}: ${
            day.items.length === 0
              ? "sem items"
              : day.items.map((i) => i.title).join(", ")
          }`
      )
      .join("\n") ?? "";

  const systemPrompt = `És um assistente de viagens especializado em ${trip?.destination.name}, ${trip?.destination.country}.
Estás a ajudar a planear a viagem "${trip?.title}".
Datas: ${trip ? format(trip.startDate, "d MMM", { locale: ptBR }) : ""} a ${trip ? format(trip.endDate, "d MMM yyyy", { locale: ptBR }) : ""}.

Itinerário atual:
${itinerarySummary || "Ainda vazio"}

Responde sempre em português europeu. Sê conciso, prático e útil. Podes sugerir restaurantes, atrações, dicas de transporte, horários de abertura, preços aproximados, etc.`;

  // Get conversation history (last 20 messages for context)
  const history = await db.message.findMany({
    where: { tripId },
    orderBy: { createdAt: "asc" },
    take: 20,
    select: { role: true, content: true },
  });

  // Stream response
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      let fullContent = "";

      try {
        const claudeStream = await anthropic.messages.stream({
          model: "claude-sonnet-4-5",
          max_tokens: 1024,
          system: systemPrompt,
          messages: history.map((m) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
          })),
        });

        for await (const chunk of claudeStream) {
          if (
            chunk.type === "content_block_delta" &&
            chunk.delta.type === "text_delta"
          ) {
            fullContent += chunk.delta.text;
            controller.enqueue(encoder.encode(chunk.delta.text));
          }
        }

        // Save assistant message
        await db.message.create({
          data: {
            tripId,
            userId: session.user.id,
            role: "assistant",
            content: fullContent,
          },
        });
      } catch (err) {
        console.error("Claude error:", err);
        controller.enqueue(encoder.encode("\n[Erro ao contactar o assistente]"));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
