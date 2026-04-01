"use client";

import { useState, useCallback } from "react";
import { format, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import useEmblaCarousel from "embla-carousel-react";
import { DayColumn } from "./day-column";
import { AddItemModal } from "./add-item-modal";
import type { ItineraryDay, ItineraryItem, ItemType } from "@prisma/client";

type ItemWithCreator = ItineraryItem & { createdBy: { name: string } };
type DayWithItems = ItineraryDay & { items: ItemWithCreator[]; notes: string | null };
type TripWithDays = {
  id: string;
  days: DayWithItems[];
};

export function ItineraryView({ trip }: { trip: TripWithDays }) {
  const [days, setDays] = useState<DayWithItems[]>(trip.days);
  const [addingToDayId, setAddingToDayId] = useState<string | null>(null);
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: "start", dragFree: true });

  const handleConfirmItem = useCallback(
    async (dayId: string, itemId: string, confirmed: boolean) => {
      setDays((prev) =>
        prev.map((d) =>
          d.id === dayId
            ? { ...d, items: d.items.map((i) => (i.id === itemId ? { ...i, confirmed } : i)) }
            : d
        )
      );
      await fetch(`/api/trips/${trip.id}/itinerary/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmed }),
      });
    },
    [trip.id]
  );

  const handleAddItem = useCallback(
    async (
      dayId: string,
      data: {
        title: string;
        type: ItemType;
        startTime: string;
        endTime: string;
        time: string;
        location: string;
        notes: string;
      }
    ) => {
      const res = await fetch(`/api/trips/${trip.id}/itinerary`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dayId, ...data }),
      });
      if (!res.ok) return;
      const item = await res.json();
      setDays((prev) =>
        prev.map((d) => (d.id === dayId ? { ...d, items: [...d.items, item] } : d))
      );
      setAddingToDayId(null);
    },
    [trip.id]
  );

  const handleDeleteItem = useCallback(async (dayId: string, itemId: string) => {
    await fetch(`/api/trips/${trip.id}/itinerary/${itemId}`, { method: "DELETE" });
    setDays((prev) =>
      prev.map((d) =>
        d.id === dayId ? { ...d, items: d.items.filter((i) => i.id !== itemId) } : d
      )
    );
  }, [trip.id]);

  const handleReorder = useCallback(
    async (dayId: string, items: ItemWithCreator[]) => {
      setDays((prev) =>
        prev.map((d) => (d.id === dayId ? { ...d, items } : d))
      );
      await Promise.all(
        items.map((item, index) =>
          fetch(`/api/trips/${trip.id}/itinerary/${item.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ order: index }),
          })
        )
      );
    },
    [trip.id]
  );

  if (days.length === 0) {
    return (
      <div className="p-4 md:p-8 text-center">
        <p className="text-gray-500">Sem dias no itinerário.</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      {/* Desktop: horizontal scroll of columns */}
      <div className="hidden md:flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {days.map((day) => (
          <DayColumn
            key={day.id}
            day={day}
            tripId={trip.id}
            onAddItem={() => setAddingToDayId(day.id)}
            onDeleteItem={(itemId) => handleDeleteItem(day.id, itemId)}
            onReorder={(items) => handleReorder(day.id, items)}
            onConfirmItem={(itemId, confirmed) => handleConfirmItem(day.id, itemId, confirmed)}
          />
        ))}
      </div>

      {/* Mobile: embla carousel */}
      <div className="md:hidden">
        {/* Day selector pills */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-3 mb-4">
          {days.map((day, i) => (
            <button
              key={day.id}
              onClick={() => emblaApi?.scrollTo(i)}
              className="flex-none flex flex-col items-center px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-xs"
            >
              <span className="font-semibold text-gray-700">
                {format(day.date, "EEE", { locale: ptBR })}
              </span>
              <span className={isToday(day.date) ? "text-blue-600 font-bold" : "text-gray-500"}>
                {format(day.date, "d")}
              </span>
            </button>
          ))}
        </div>

        <div ref={emblaRef} className="overflow-hidden">
          <div className="flex gap-4">
            {days.map((day) => (
              <div key={day.id} className="flex-none w-full">
                <DayColumn
                  day={day}
                  tripId={trip.id}
                  onAddItem={() => setAddingToDayId(day.id)}
                  onDeleteItem={(itemId) => handleDeleteItem(day.id, itemId)}
                  onReorder={(items) => handleReorder(day.id, items)}
                  onConfirmItem={(itemId, confirmed) => handleConfirmItem(day.id, itemId, confirmed)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {addingToDayId && (
        <AddItemModal
          onClose={() => setAddingToDayId(null)}
          onAdd={(data) => handleAddItem(addingToDayId, data)}
        />
      )}
    </div>
  );
}
