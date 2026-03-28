"use client";

import { useState, useRef } from "react";

type Item = {
  id: string;
  text: string;
  checked: boolean;
};

export function ChecklistView({
  tripId,
  initialItems,
}: {
  tripId: string;
  initialItems: Item[];
}) {
  const [items, setItems] = useState(initialItems);
  const [newText, setNewText] = useState("");
  const [adding, setAdding] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const done = items.filter((i) => i.checked).length;

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newText.trim()) return;
    setAdding(true);
    const res = await fetch(`/api/trips/${tripId}/checklist`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: newText.trim() }),
    });
    setAdding(false);
    if (!res.ok) return;
    const item = await res.json();
    setItems((prev) => [...prev, item]);
    setNewText("");
    inputRef.current?.focus();
  }

  async function handleToggle(item: Item) {
    const res = await fetch(`/api/trips/${tripId}/checklist/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ checked: !item.checked }),
    });
    if (!res.ok) return;
    const updated = await res.json();
    setItems((prev) => prev.map((i) => (i.id === item.id ? updated : i)));
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/trips/${tripId}/checklist/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) return;
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  const pending = items.filter((i) => !i.checked);
  const checked = items.filter((i) => i.checked);

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Não Esquecer</h2>
        {items.length > 0 && (
          <p className="text-sm text-gray-500 mt-0.5">
            {done} de {items.length} {items.length === 1 ? "item" : "itens"} concluído{done !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      {/* Add item */}
      <form onSubmit={handleAdd} className="flex gap-2 mb-6">
        <input
          ref={inputRef}
          type="text"
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          placeholder="Adicionar item..."
          className="flex-1 px-3 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={adding || !newText.trim()}
          className="px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-40"
        >
          +
        </button>
      </form>

      {items.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">✅</div>
          <p className="text-gray-500">Adiciona o que não podes esquecer na viagem.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Pending items */}
          {pending.length > 0 && (
            <div className="space-y-2">
              {pending.map((item) => (
                <ChecklistRow
                  key={item.id}
                  item={item}
                  onToggle={() => handleToggle(item)}
                  onDelete={() => handleDelete(item.id)}
                />
              ))}
            </div>
          )}

          {/* Checked items */}
          {checked.length > 0 && (
            <div>
              {pending.length > 0 && (
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Concluído
                </p>
              )}
              <div className="space-y-2">
                {checked.map((item) => (
                  <ChecklistRow
                    key={item.id}
                    item={item}
                    onToggle={() => handleToggle(item)}
                    onDelete={() => handleDelete(item.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ChecklistRow({
  item,
  onToggle,
  onDelete,
}: {
  item: Item;
  onToggle: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 px-3 py-2.5 group">
      <button
        onClick={onToggle}
        className={`flex-none w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
          item.checked
            ? "bg-green-500 border-green-500 text-white"
            : "border-gray-300 hover:border-blue-400"
        }`}
        aria-label={item.checked ? "Desmarcar" : "Marcar"}
      >
        {item.checked && (
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>
      <span className={`flex-1 text-sm ${item.checked ? "line-through text-gray-400" : "text-gray-800"}`}>
        {item.text}
      </span>
      <button
        onClick={onDelete}
        className="flex-none text-gray-300 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 text-xs p-1"
        aria-label="Eliminar"
      >
        ✕
      </button>
    </div>
  );
}
