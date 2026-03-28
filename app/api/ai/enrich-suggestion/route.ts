import { auth } from "@/lib/auth";
import { anthropic } from "@/lib/claude";
import { NextResponse } from "next/server";

async function fetchWikipediaImage(query: string): Promise<string | null> {
  try {
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*`;
    const searchRes = await fetch(searchUrl, { next: { revalidate: 86400 } });
    const searchData = await searchRes.json();
    const pageTitle = searchData?.query?.search?.[0]?.title;
    if (!pageTitle) return null;

    const imageUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(pageTitle)}&prop=pageimages&format=json&pithumbsize=600&origin=*`;
    const imageRes = await fetch(imageUrl, { next: { revalidate: 86400 } });
    const imageData = await imageRes.json();
    const pages = imageData?.query?.pages;
    const page = pages ? Object.values(pages)[0] as { thumbnail?: { source: string } } : null;
    return page?.thumbnail?.source ?? null;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, destination } = await req.json();
  if (!title) return NextResponse.json({ error: "Missing title" }, { status: 400 });

  const message = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 512,
    messages: [
      {
        role: "user",
        content: `You are a travel assistant. Given a place name, return structured data in JSON.

Place: "${title}"
Travel destination context: ${destination ?? "unknown"}

Return ONLY a valid JSON object with these fields:
{
  "description": "1-2 sentence description in European Portuguese",
  "location": "full address or neighbourhood, city",
  "url": "official website URL if well-known, otherwise null",
  "imageSearchQuery": "short English query to find a Wikipedia image (e.g. 'Borough Market London')"
}

If unsure about a field, use null. Never invent URLs.`,
      },
    ],
  });

  let enriched: {
    description?: string;
    location?: string;
    url?: string;
    imageSearchQuery?: string;
  } = {};

  try {
    const text = message.content[0].type === "text" ? message.content[0].text : "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) enriched = JSON.parse(jsonMatch[0]);
  } catch {
    return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
  }

  const imageUrl = enriched.imageSearchQuery
    ? await fetchWikipediaImage(enriched.imageSearchQuery)
    : null;

  return NextResponse.json({
    description: enriched.description ?? null,
    location: enriched.location ?? null,
    url: enriched.url ?? null,
    imageUrl,
  });
}
