"use client";

import { useState } from "react";

type Member = {
  id: string;
  name: string;
  username: string;
  avatarEmoji: string | null;
};

export function ManageMembersModal({
  tripId,
  initialMembers,
  onClose,
}: {
  tripId: string;
  initialMembers: Member[];
  onClose: () => void;
}) {
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    setAdding(true);
    setError("");

    const res = await fetch(`/api/trips/${tripId}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: input.trim() }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Erro ao adicionar");
    } else {
      const user = await res.json();
      setMembers((prev) => [...prev, user]);
      setInput("");
    }
    setAdding(false);
  }

  async function handleRemove(userId: string) {
    const res = await fetch(`/api/trips/${tripId}/members`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    if (!res.ok) return;
    setMembers((prev) => prev.filter((m) => m.id !== userId));
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl">
        <h2 className="font-bold text-gray-900 mb-4">Membros da viagem</h2>

        {/* Current members */}
        <div className="space-y-2 mb-5">
          {members.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-2">Sem membros.</p>
          )}
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center gap-3 px-3 py-2 rounded-xl bg-gray-50"
            >
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-base flex-none">
                {member.avatarEmoji ?? (
                  <span className="text-xs font-bold text-blue-700">
                    {member.name[0].toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{member.name}</p>
                <p className="text-xs text-gray-400">@{member.username}</p>
              </div>
              <button
                onClick={() => handleRemove(member.id)}
                className="flex-none text-xs text-red-500 hover:text-red-700 font-medium transition-colors px-2 py-1"
              >
                Remover
              </button>
            </div>
          ))}
        </div>

        {/* Add member */}
        <form onSubmit={handleAdd} className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Adicionar por username
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => { setInput(e.target.value); setError(""); }}
              placeholder="ex: joao.silva"
              className="flex-1 px-3 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={adding || !input.trim()}
              className="px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {adding ? "…" : "Adicionar"}
            </button>
          </div>
          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}
        </form>

        <button
          onClick={onClose}
          className="mt-4 w-full py-2.5 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Fechar
        </button>
      </div>
    </div>
  );
}
