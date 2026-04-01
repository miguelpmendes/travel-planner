"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteTripButton({ tripId, tripTitle }: { tripId: string; tripTitle: string }) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    setLoading(true);
    const res = await fetch(`/api/trips/${tripId}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/trips");
      router.refresh();
    } else {
      setLoading(false);
      setConfirming(false);
    }
  }

  if (confirming) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
          <h2 className="font-bold text-gray-900 mb-2">Apagar viagem?</h2>
          <p className="text-sm text-gray-500 mb-5">
            Vais apagar <span className="font-medium text-gray-800">{tripTitle}</span> e todos os dados associados. Esta ação é irreversível.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setConfirming(false)}
              className="flex-1 py-2.5 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {loading ? "A apagar…" : "Apagar"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="flex-none text-sm text-red-500 hover:text-red-700 font-medium transition-colors px-2 py-1"
      title="Apagar viagem"
    >
      Apagar
    </button>
  );
}
