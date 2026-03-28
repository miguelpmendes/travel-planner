"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { PERIOD_ICONS, getPeriodsForType } from "@/lib/utils";
import type { Suggestion } from "@prisma/client";

type Day = { id: string; date: Date };

export function AddToItineraryModal({
  suggestion,
  days,
  onClose,
  onAdd,
}: {
  suggestion: Suggestion;
  days: Day[];
  onClose: () => void;
  onAdd: (dayId: string, startTime: string, endTime: string) => Promise<void>;
}) {
  const [dayId, setDayId] = useState(days[0]?.id ?? "");
  const [period, setPeriod] = useState("");
  const [loading, setLoading] = useState(false);

  const periods = getPeriodsForType(suggestion.type);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await onAdd(dayId, period, "");
    setLoading(false);
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl">
        <h2 className="font-bold text-gray-900 mb-1">Adicionar ao itinerário</h2>
        <p className="text-sm text-gray-500 mb-4">{suggestion.title}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dia</label>
            <select
              value={dayId}
              onChange={(e) => setDayId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {days.map((day) => (
                <option key={day.id} value={day.id}>
                  {format(day.date, "EEEE, d MMM", { locale: ptBR })}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Período</label>
            <div className="flex gap-2">
              {periods.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPeriod(period === p ? "" : p)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                    period === p
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  <span>{PERIOD_ICONS[p]}</span>
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !dayId}
              className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? "A adicionar…" : "Adicionar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
