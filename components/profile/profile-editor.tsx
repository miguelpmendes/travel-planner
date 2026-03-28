"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

const AVATAR_EMOJIS = [
  "😀","😎","🤩","🥳","😇","🤓","😋","🥸",
  "🧑","👦","👧","🧒","👨","👩","🧔","👴",
  "🧙","🦸","🕵️","👷","🧑‍🍳","🧑‍🎨","🧑‍✈️","🧑‍🚀",
  "🐶","🐱","🦊","🐻","🐼","🦁","🐯","🐨",
  "🦋","🐢","🦜","🐬","🦄","🐲","🦅","🐙",
  "⚽","🎸","🎮","🎨","📚","🚀","🌍","🏔️",
];

export function ProfileEditor({
  currentEmoji,
  userName,
  username,
}: {
  currentEmoji: string | null;
  userName: string;
  username: string;
}) {
  const { update } = useSession();
  const [selected, setSelected] = useState<string | null>(currentEmoji);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ avatarEmoji: selected }),
    });
    await update({ avatarEmoji: selected });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-6">
      {/* Current avatar preview */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-3xl flex-none">
          {selected ?? userName[0]?.toUpperCase()}
        </div>
        <div>
          <p className="font-semibold text-gray-900">{userName}</p>
          <p className="text-sm text-gray-400">@{username}</p>
        </div>
      </div>

      {/* Emoji picker */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <p className="text-sm font-medium text-gray-700 mb-3">Escolhe o teu ícone</p>
        <div className="grid grid-cols-8 gap-2">
          {/* Remove option */}
          <button
            onClick={() => setSelected(null)}
            className={`w-full aspect-square rounded-xl flex items-center justify-center text-lg transition-colors border-2 ${
              selected === null
                ? "border-blue-500 bg-blue-50"
                : "border-transparent hover:bg-gray-100"
            }`}
            title="Usar inicial do nome"
          >
            <span className="text-sm font-bold text-gray-400">A</span>
          </button>

          {AVATAR_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => setSelected(emoji)}
              className={`w-full aspect-square rounded-xl flex items-center justify-center text-2xl transition-colors border-2 ${
                selected === emoji
                  ? "border-blue-500 bg-blue-50"
                  : "border-transparent hover:bg-gray-100"
              }`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
      >
        {saving ? "A guardar…" : saved ? "✓ Guardado!" : "Guardar"}
      </button>
    </div>
  );
}
