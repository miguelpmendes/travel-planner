"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function TripTabNav({ tripId }: { tripId: string }) {
  const pathname = usePathname();
  const base = `/trips/${tripId}`;

  const tabs = [
    { href: `${base}/itinerary`, label: "📅 Itinerário" },
    { href: `${base}/suggestions`, label: "💡 Sugestões" },
    { href: `${base}/assistant`, label: "🤖 Assistente" },
  ];

  return (
    <div className="flex gap-1 overflow-x-auto scrollbar-hide -mx-1 px-1">
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={cn(
            "whitespace-nowrap px-3 py-2.5 text-sm font-medium border-b-2 transition-colors",
            pathname === tab.href
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-900"
          )}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
