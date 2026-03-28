"use client";

import { useState } from "react";
import Image from "next/image";
import { ITEM_TYPE_LABELS } from "@/lib/utils";
import { ItemType } from "@prisma/client";

const TYPES = Object.values(ItemType);

type SuggestionFormData = {
  title: string;
  type: ItemType;
  description: string;
  location: string;
  url: string;
  imageUrl: string;
};

type InitialData = Partial<SuggestionFormData> & { id?: string };

export function AddSuggestionModal({
  destination,
  initialData,
  onClose,
  onAdd,
  onEdit,
}: {
  destination?: string;
  initialData?: InitialData;
  onClose: () => void;
  onAdd?: (data: SuggestionFormData) => Promise<void>;
  onEdit?: (id: string, data: SuggestionFormData) => Promise<void>;
}) {
  const isEditing = !!initialData?.id;

  const [title, setTitle] = useState(initialData?.title ?? "");
  const [type, setType] = useState<ItemType>(initialData?.type ?? "ATTRACTION");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [location, setLocation] = useState(initialData?.location ?? "");
  const [url, setUrl] = useState(initialData?.url ?? "");
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl ?? "");
  const [loading, setLoading] = useState(false);
  const [enriching, setEnriching] = useState(false);

  async function handleEnrich() {
    if (!title.trim()) return;
    setEnriching(true);
    try {
      const res = await fetch("/api/ai/enrich-suggestion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, destination }),
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data.description && !description) setDescription(data.description);
      else if (data.description) setDescription(data.description);
      if (data.location) setLocation(data.location);
      if (data.url) setUrl(data.url);
      if (data.imageUrl) setImageUrl(data.imageUrl);
    } finally {
      setEnriching(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const data = { title, type, description, location, url, imageUrl };
    if (isEditing && onEdit) {
      await onEdit(initialData!.id!, data);
    } else if (onAdd) {
      await onAdd(data);
    }
    setLoading(false);
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl max-h-[90dvh] overflow-y-auto">
        <h2 className="font-bold text-gray-900 mb-4">
          {isEditing ? "Editar sugestão" : "Nova sugestão"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title + AI enrich button */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="ex: Borough Market"
                className="flex-1 px-3 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleEnrich}
                disabled={enriching || !title.trim()}
                title="Auto-preencher com IA"
                className="flex-none px-3 py-2.5 rounded-xl border border-purple-200 bg-purple-50 text-purple-700 text-sm font-medium hover:bg-purple-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {enriching ? "✨ A pesquisar…" : "✨ Auto-fill"}
              </button>
            </div>
            {!title.trim() && (
              <p className="mt-1 text-xs text-gray-400">Escreve o título para usar o auto-fill</p>
            )}
          </div>

          {/* Image preview */}
          {imageUrl && (
            <div className="relative">
              <Image
                src={imageUrl}
                alt={title}
                width={400}
                height={200}
                className="w-full h-40 object-cover rounded-xl border border-gray-200"
                unoptimized
              />
              <button
                type="button"
                onClick={() => setImageUrl("")}
                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 text-white text-xs flex items-center justify-center hover:bg-black/70"
              >
                ✕
              </button>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
            <div className="grid grid-cols-3 gap-2">
              {TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`py-2 rounded-xl border text-xs font-medium transition-colors ${
                    type === t
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {ITEM_TYPE_LABELS[t]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Porquê visitar, o que é especial…"
              className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Localização</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="ex: 8 Southwark St, London"
              className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Link (opcional)</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL da foto (opcional)
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
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
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading
                ? isEditing
                  ? "A guardar…"
                  : "A submeter…"
                : isEditing
                ? "Guardar"
                : "Submeter"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
