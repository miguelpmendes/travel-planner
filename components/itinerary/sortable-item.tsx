"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ITEM_TYPE_COLORS, ITEM_TYPE_ICONS, ITEM_TYPE_LABELS, PERIOD_ICONS } from "@/lib/utils";
import type { ItineraryItem } from "@prisma/client";

type ItemWithCreator = ItineraryItem & { createdBy: { name: string } };

export function SortableItem({
  item,
  onDelete,
  onConfirm,
}: {
  item: ItemWithCreator;
  onDelete: () => void;
  onConfirm: (confirmed: boolean) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const hasLongContent =
    (item.notes && item.notes.length > 80) ||
    (item.location && item.location.length > 40);

  const cardClass = item.confirmed
    ? "bg-green-50 rounded-xl border border-green-200 p-3 shadow-sm group"
    : "bg-white rounded-xl border border-gray-200 p-3 shadow-sm group";

  return (
    <div ref={setNodeRef} style={style} className={cardClass}>
      <div className="flex items-start gap-2">
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="mt-0.5 text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing touch-none flex-none"
          aria-label="Arrastar"
        >
          ⠿
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-1">
            <button
              onClick={() => setExpanded((v) => !v)}
              className="flex items-center gap-1.5 min-w-0 text-left flex-1"
            >
              <span className="text-base flex-none">{ITEM_TYPE_ICONS[item.type]}</span>
              <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
            </button>

            <div className="flex items-center gap-0.5 flex-none">
              {/* Confirm toggle */}
              <button
                onClick={() => onConfirm(!item.confirmed)}
                className={`p-1 rounded transition-colors text-sm ${
                  item.confirmed
                    ? "text-green-600 hover:text-green-700"
                    : "text-gray-300 hover:text-green-500 opacity-0 group-hover:opacity-100"
                }`}
                aria-label={item.confirmed ? "Remover confirmação" : "Confirmar"}
                title={item.confirmed ? "Confirmada — clica para reverter" : "Confirmar atividade"}
              >
                {item.confirmed ? "🔒" : "🔓"}
              </button>

              <button
                onClick={onDelete}
                className="flex-none text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 text-xs p-1"
                aria-label="Eliminar"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <span className={`text-xs px-1.5 py-0.5 rounded-md border ${ITEM_TYPE_COLORS[item.type]}`}>
              {ITEM_TYPE_LABELS[item.type]}
            </span>
            {item.time && (
              <span className="text-xs text-gray-500 flex items-center gap-0.5">
                🕐 {item.time}
              </span>
            )}
            {!item.time && item.startTime && (
              <span className="text-xs text-gray-500 flex items-center gap-0.5">
                {PERIOD_ICONS[item.startTime] ?? ""} {item.startTime}
              </span>
            )}
            {item.confirmed && (
              <span className="text-xs px-1.5 py-0.5 rounded-md border bg-green-100 text-green-700 border-green-200 font-medium">
                Confirmada
              </span>
            )}
          </div>

          {item.location && (
            <p className={`mt-1 text-xs text-gray-400 ${expanded ? "" : "truncate"}`}>
              📍 {item.location}
            </p>
          )}

          {item.notes && (
            <p className={`mt-1 text-xs text-gray-500 whitespace-pre-wrap ${expanded ? "" : "line-clamp-2"}`}>
              {item.notes}
            </p>
          )}

          {hasLongContent && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="mt-1.5 text-xs text-blue-500 hover:text-blue-700 font-medium transition-colors"
            >
              {expanded ? "▲ Ver menos" : "▼ Ver mais"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
