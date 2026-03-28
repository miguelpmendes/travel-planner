"use client";

import { useState } from "react";
import { SuggestionCard } from "./suggestion-card";
import { SuggestionDetailModal } from "./suggestion-detail-modal";
import { AddSuggestionModal } from "./add-suggestion-modal";
import { AddToItineraryModal } from "./add-to-itinerary-modal";
import type { Suggestion, ItemType } from "@prisma/client";

type SuggestionWithVotes = Suggestion & {
  createdBy: { name: string; avatarEmoji: string | null };
  votes: { userId: string; value: number }[];
};

type Day = { id: string; date: Date };

function score(s: SuggestionWithVotes) {
  return s.votes.reduce((acc, v) => acc + v.value, 0);
}

export function SuggestionsView({
  tripId,
  destination,
  initialSuggestions,
  days,
  currentUserId,
  isAdmin,
}: {
  tripId: string;
  destination: string;
  initialSuggestions: SuggestionWithVotes[];
  days: Day[];
  currentUserId: string;
  isAdmin: boolean;
}) {
  const [suggestions, setSuggestions] = useState(initialSuggestions);
  const [showAdd, setShowAdd] = useState(false);
  const [detail, setDetail] = useState<SuggestionWithVotes | null>(null);
  const [editing, setEditing] = useState<SuggestionWithVotes | null>(null);
  const [addToItinerary, setAddToItinerary] = useState<SuggestionWithVotes | null>(null);

  const sorted = [...suggestions].sort((a, b) => score(b) - score(a));

  async function handleVote(suggestionId: string, value: number) {
    const res = await fetch(`/api/trips/${tripId}/suggestions/${suggestionId}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value }),
    });
    if (!res.ok) return;
    const newVotes = await res.json();
    setSuggestions((prev) =>
      prev.map((s) => (s.id === suggestionId ? { ...s, votes: newVotes } : s))
    );
    setDetail((prev) => (prev?.id === suggestionId ? { ...prev, votes: newVotes } : prev));
  }

  async function handleAdd(data: {
    title: string;
    type: ItemType;
    description: string;
    location: string;
    url: string;
    imageUrl: string;
  }) {
    const res = await fetch(`/api/trips/${tripId}/suggestions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) return;
    const suggestion = await res.json();
    setSuggestions((prev) => [suggestion, ...prev]);
    setShowAdd(false);
  }

  async function handleEdit(
    id: string,
    data: {
      title: string;
      type: ItemType;
      description: string;
      location: string;
      url: string;
      imageUrl: string;
    }
  ) {
    const res = await fetch(`/api/trips/${tripId}/suggestions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) return;
    const updated = await res.json();
    setSuggestions((prev) => prev.map((s) => (s.id === id ? updated : s)));
    setEditing(null);
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/trips/${tripId}/suggestions/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) return;
    setSuggestions((prev) => prev.filter((s) => s.id !== id));
    setDetail((prev) => (prev?.id === id ? null : prev));
  }

  async function handleAddToItinerary(
    suggestionId: string,
    dayId: string,
    startTime: string,
    endTime: string
  ) {
    const res = await fetch(
      `/api/trips/${tripId}/suggestions/${suggestionId}/add-to-itinerary`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dayId, startTime, endTime }),
      }
    );
    if (!res.ok) return;
    setSuggestions((prev) =>
      prev.map((s) => (s.id === suggestionId ? { ...s, addedToItinerary: true } : s))
    );
    setAddToItinerary(null);
  }

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Sugestões</h2>
          <p className="text-sm text-gray-500">Vota nos preferidos!</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors"
        >
          + Sugerir
        </button>
      </div>

      {sorted.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">💡</div>
          <p className="text-gray-500 mb-4">Ainda sem sugestões.</p>
          <button
            onClick={() => setShowAdd(true)}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-xl hover:bg-blue-700 transition-colors"
          >
            Ser o primeiro a sugerir
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((s, i) => (
            <SuggestionCard
              key={s.id}
              suggestion={s}
              rank={i + 1}
              currentUserId={currentUserId}
              isAdmin={isAdmin}
              onVote={(value) => handleVote(s.id, value)}
              onAddToItinerary={() => setAddToItinerary(s)}
              onEdit={() => setEditing(s)}
              onDelete={() => handleDelete(s.id)}
              onDetail={() => setDetail(s)}
            />
          ))}
        </div>
      )}

      {detail && (
        <SuggestionDetailModal
          suggestion={detail}
          rank={sorted.findIndex((s) => s.id === detail.id) + 1}
          currentUserId={currentUserId}
          isAdmin={isAdmin}
          onClose={() => setDetail(null)}
          onVote={(value) => handleVote(detail.id, value)}
          onAddToItinerary={() => { setDetail(null); setAddToItinerary(detail); }}
          onEdit={() => { setDetail(null); setEditing(detail); }}
          onDelete={() => handleDelete(detail.id)}
        />
      )}

      {showAdd && (
        <AddSuggestionModal
          destination={destination}
          onClose={() => setShowAdd(false)}
          onAdd={handleAdd}
        />
      )}

      {editing && (
        <AddSuggestionModal
          destination={destination}
          initialData={{
            id: editing.id,
            title: editing.title,
            type: editing.type,
            description: editing.description ?? "",
            location: editing.location ?? "",
            url: editing.url ?? "",
            imageUrl: editing.imageUrl ?? "",
          }}
          onClose={() => setEditing(null)}
          onEdit={handleEdit}
        />
      )}

      {addToItinerary && (
        <AddToItineraryModal
          suggestion={addToItinerary}
          days={days}
          onClose={() => setAddToItinerary(null)}
          onAdd={(dayId, startTime, endTime) =>
            handleAddToItinerary(addToItinerary.id, dayId, startTime, endTime)
          }
        />
      )}
    </div>
  );
}
