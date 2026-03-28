"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function TripTabNav({ tripId }: { tripId: string }) {
  const pathname = usePathname();
  const base = `/trips/${tripId}`;

  const tabs = [
    { href: `${base}/itinerary`, icon: "📅", label: "Itinerário" },
    { href: `${base}/suggestions`, icon: "💡", label: "Sugestões" },
    { href: `${base}/assistant`, icon: "🤖", label: "Assistente" },
    { href: `${base}/checklist`, icon: "✅", label: "Não Esquecer" },
  ];

  return (
    <div className="flex overflow-x-auto scrollbar-hide -mx-1 px-1">
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={cn(
            "flex-none flex items-center gap-1.5 whitespace-nowrap px-3 py-2.5 text-sm font-medium border-b-2 transition-colors",
            pathname === tab.href
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-900"
          )}
        >
          <span className="leading-none">{tab.icon}</span>
          <span>{tab.label}</span>
        </Link>
      ))}
    </div>
  );
}
