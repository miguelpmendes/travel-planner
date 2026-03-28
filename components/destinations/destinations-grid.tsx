"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreateTripModal } from "@/components/trips/create-trip-modal";
import type { Destination } from "@prisma/client";

type DestinationWithCount = Destination & { _count: { trips: number } };

export function DestinationsGrid({
  destinations,
}: {
  destinations: DestinationWithCount[];
}) {
  const [selected, setSelected] = useState<Destination | null>(null);
  const router = useRouter();

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {destinations.map((dest) => (
          <button
            key={dest.id}
            onClick={() => setSelected(dest)}
            className="text-left bg-white rounded-2xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-md active:scale-[0.98] transition-all group"
          >
            <div className="text-4xl mb-3">{dest.emoji ?? "🌍"}</div>
            <h2 className="font-semibold text-gray-900 text-lg group-hover:text-blue-700 transition-colors">
              {dest.name}
            </h2>
            <p className="text-sm text-gray-400">{dest.country}</p>
            {dest.description && (
              <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                {dest.description}
              </p>
            )}
            <div className="mt-3 text-xs text-gray-400">
              {dest._count.trips === 0
                ? "Sem viagens ainda"
                : `${dest._count.trips} viagem${dest._count.trips > 1 ? "s" : ""}`}
            </div>
          </button>
        ))}

        {destinations.length === 0 && (
          <p className="col-span-full text-center text-gray-400 py-12">
            Nenhum destino disponível.
          </p>
        )}
      </div>

      {selected && (
        <CreateTripModal
          destination={selected}
          onClose={() => setSelected(null)}
          onCreate={(tripId) => router.push(`/trips/${tripId}`)}
        />
      )}
    </>
  );
}
