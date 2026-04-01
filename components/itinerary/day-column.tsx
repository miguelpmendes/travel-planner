"use client";

import { format, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState, useRef, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { SortableItem } from "./sortable-item";
import type { ItineraryDay, ItineraryItem } from "@prisma/client";

type ItemWithCreator = ItineraryItem & { createdBy: { name: string } };
type DayWithItems = ItineraryDay & { items: ItemWithCreator[]; notes: string | null };

export function DayColumn({
  day,
  tripId,
  onAddItem,
  onDeleteItem,
  onReorder,
  onConfirmItem,
}: {
  day: DayWithItems;
  tripId: string;
  onAddItem: () => void;
  onDeleteItem: (itemId: string) => void;
  onReorder: (items: ItemWithCreator[]) => void;
  onConfirmItem: (itemId: string, confirmed: boolean) => void;
}) {
  const [notesOpen, setNotesOpen] = useState(!!day.notes);
  const [notes, setNotes] = useState(day.notes ?? "");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, []);

  function handleNotesChange(value: string) {
    setNotes(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetch(`/api/trips/${tripId}/itinerary/days/${day.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: value }),
      });
    }, 800);
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = day.items.findIndex((i) => i.id === active.id);
    const newIndex = day.items.findIndex((i) => i.id === over.id);
    onReorder(arrayMove(day.items, oldIndex, newIndex));
  }

  const today = isToday(day.date);

  return (
    <div className="flex-none w-full md:w-80 flex flex-col">
      <div
        className={`flex items-center justify-between px-3 py-2 rounded-t-xl border border-b-0 ${
          today ? "bg-blue-600 border-blue-600 text-white" : "bg-white border-gray-200 text-gray-700"
        }`}
      >
        <div>
          <p className={`text-xs font-medium ${today ? "text-blue-100" : "text-gray-400"}`}>
            {format(day.date, "EEEE", { locale: ptBR })}
          </p>
          <div className="flex items-center gap-1.5">
            <p className="font-bold text-base leading-tight">
              {format(day.date, "d MMM", { locale: ptBR })}
            </p>
            {notes && <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-none" title="Tem notas" />}
          </div>
        </div>
        <button
          onClick={onAddItem}
          className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg font-light transition-colors ${
            today ? "bg-blue-500 hover:bg-blue-400 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-600"
          }`}
          title="Adicionar"
        >
          +
        </button>
      </div>

      <div className="flex-1 border border-gray-200 rounded-b-xl bg-gray-50 p-2 min-h-[200px]">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={day.items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {day.items.map((item) => (
                <SortableItem
                  key={item.id}
                  item={item}
                  onDelete={() => onDeleteItem(item.id)}
                  onConfirm={(confirmed) => onConfirmItem(item.id, confirmed)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {day.items.length === 0 && (
          <button
            onClick={onAddItem}
            className="w-full h-full min-h-[140px] flex flex-col items-center justify-center text-gray-400 hover:text-gray-600 transition-colors rounded-lg border-2 border-dashed border-gray-200 hover:border-gray-300"
          >
            <span className="text-2xl mb-1">+</span>
            <span className="text-xs">Adicionar</span>
          </button>
        )}
      </div>
      {/* Notes */}
      <div className="border border-t-0 border-gray-200 rounded-b-xl bg-white">
        <button
          onClick={() => setNotesOpen((v) => !v)}
          className={`w-full flex items-center gap-1.5 px-3 py-2 text-xs transition-colors ${
            notes ? "text-blue-600 font-medium" : "text-gray-400 hover:text-gray-600"
          }`}
        >
          <span>📝</span>
          <span>{notesOpen ? "Fechar notas" : notes ? "Ver notas" : "Adicionar notas"}</span>
        </button>
        {notesOpen && (
          <div className="px-3 pb-3">
            <textarea
              value={notes}
              onChange={(e) => handleNotesChange(e.target.value)}
              placeholder="Apontamentos para este dia..."
              rows={3}
              className="w-full text-xs text-gray-700 placeholder-gray-300 resize-none border border-gray-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>
        )}
      </div>
    </div>
  );
}
