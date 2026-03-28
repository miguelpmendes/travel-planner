"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreateTripModal } from "./create-trip-modal";
import type { Destination } from "@prisma/client";

export function CreateTripButton({ destinations }: { destinations: Destination[] }) {
  const [selected, setSelected] = useState<Destination | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const router = useRouter();

  if (destinations.length === 1) {
    return (
      <>
        <button
          onClick={() => setSelected(destinations[0])}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors"
        >
          + Nova viagem
        </button>
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

  return (
    <>
      <button
        onClick={() => setShowPicker(true)}
        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors"
      >
        + Nova viagem
      </button>

      {showPicker && (
        <div
          className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4"
          onClick={(e) => e.target === e.currentTarget && setShowPicker(false)}
        >
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl">
            <h2 className="font-bold text-gray-900 mb-4">Escolher destino</h2>
            <div className="space-y-2">
              {destinations.map((dest) => (
                <button
                  key={dest.id}
                  onClick={() => { setSelected(dest); setShowPicker(false); }}
                  className="w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  <span className="text-2xl">{dest.emoji ?? "🌍"}</span>
                  <div>
                    <p className="font-medium text-gray-900">{dest.name}</p>
                    <p className="text-xs text-gray-400">{dest.country}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

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
