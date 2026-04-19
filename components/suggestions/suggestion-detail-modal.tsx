"use client";

import { ITEM_TYPE_ICONS, ITEM_TYPE_LABELS, ITEM_TYPE_COLORS } from "@/lib/utils";
import type { Suggestion } from "@prisma/client";

type SuggestionWithVotes = Suggestion & {
  createdBy: { name: string; avatarEmoji: string | null };
  votes: { userId: string; value: number; user: { name: string } }[];
};

export function SuggestionDetailModal({
  suggestion,
  rank,
  currentUserId,
  isAdmin,
  onClose,
  onVote,
  onAddToItinerary,
  onEdit,
  onDelete,
}: {
  suggestion: SuggestionWithVotes;
  rank: number;
  currentUserId: string;
  isAdmin: boolean;
  onClose: () => void;
  onVote: (value: number) => void;
  onAddToItinerary: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const totalScore = suggestion.votes.reduce((acc, v) => acc + v.value, 0);
  const myVote = suggestion.votes.find((v) => v.userId === currentUserId)?.value ?? 0;
  const isOwner = suggestion.createdById === currentUserId;
  const yesVoters = suggestion.votes.filter((v) => v.value === 1).map((v) => v.user.name);
  const noVoters = suggestion.votes.filter((v) => v.value === -1).map((v) => v.user.name);
  const canDelete = isOwner || isAdmin;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl overflow-hidden max-h-[90dvh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image */}
        {suggestion.imageUrl && (
          <div className="relative h-52 flex-none">
            <img
              src={suggestion.imageUrl}
              alt={suggestion.title}
              className="w-full h-full object-cover"
            />
            <button
              onClick={onClose}
              className="absolute top-3 right-3 w-8 h-8 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center text-sm transition-colors"
              aria-label="Fechar"
            >
              ✕
            </button>
          </div>
        )}

        <div className="overflow-y-auto flex-1">
          <div className="p-5">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-1">
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className={`flex-none w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    rank === 1
                      ? "bg-yellow-100 text-yellow-700"
                      : rank === 2
                      ? "bg-gray-100 text-gray-600"
                      : rank === 3
                      ? "bg-orange-100 text-orange-600"
                      : "bg-gray-50 text-gray-400"
                  }`}
                >
                  {rank}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span>{ITEM_TYPE_ICONS[suggestion.type]}</span>
                    <h2 className="font-bold text-gray-900 text-lg leading-tight">{suggestion.title}</h2>
                  </div>
                  <span
                    className={`inline-block mt-1 text-xs px-1.5 py-0.5 rounded-md border ${ITEM_TYPE_COLORS[suggestion.type]}`}
                  >
                    {ITEM_TYPE_LABELS[suggestion.type]}
                  </span>
                </div>
              </div>
              {!suggestion.imageUrl && (
                <button
                  onClick={onClose}
                  className="flex-none text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Fechar"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Vote score */}
            <div className="flex items-center gap-2 mt-3">
              <div className="relative group/yes">
                <button
                  onClick={() => onVote(1)}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-colors ${
                    myVote === 1
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-400 hover:bg-green-50 hover:text-green-600"
                  }`}
                  aria-label="Voto positivo"
                >
                  👍
                </button>
                {yesVoters.length > 0 && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover/yes:block z-20 pointer-events-none">
                    <div className="bg-gray-900 text-white text-xs rounded-lg px-2.5 py-1.5 whitespace-nowrap shadow-lg">
                      <span className="font-semibold text-green-400">Sim:</span> {yesVoters.join(", ")}
                    </div>
                    <div className="w-2 h-2 bg-gray-900 rotate-45 mx-auto -mt-1" />
                  </div>
                )}
              </div>
              <span
                className={`text-sm font-bold w-6 text-center ${
                  totalScore > 0 ? "text-green-600" : totalScore < 0 ? "text-red-600" : "text-gray-400"
                }`}
              >
                {totalScore > 0 ? `+${totalScore}` : totalScore}
              </span>
              <div className="relative group/no">
                <button
                  onClick={() => onVote(-1)}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-colors ${
                    myVote === -1
                      ? "bg-red-100 text-red-700"
                      : "bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-500"
                  }`}
                  aria-label="Voto negativo"
                >
                  👎
                </button>
                {noVoters.length > 0 && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover/no:block z-20 pointer-events-none">
                    <div className="bg-gray-900 text-white text-xs rounded-lg px-2.5 py-1.5 whitespace-nowrap shadow-lg">
                      <span className="font-semibold text-red-400">Não:</span> {noVoters.join(", ")}
                    </div>
                    <div className="w-2 h-2 bg-gray-900 rotate-45 mx-auto -mt-1" />
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            {suggestion.description && (
              <p className="mt-4 text-sm text-gray-700 whitespace-pre-wrap">{suggestion.description}</p>
            )}

            {/* Location */}
            {suggestion.location && (
              <p className="mt-3 text-sm text-gray-500">📍 {suggestion.location}</p>
            )}

            {/* URL */}
            {suggestion.url && (
              <a
                href={suggestion.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 text-sm text-blue-500 hover:underline break-all block"
              >
                🔗 {suggestion.url}
              </a>
            )}

            {/* Author */}
            <div className="mt-4 flex items-center gap-1.5">
              {suggestion.createdBy.avatarEmoji ? (
                <span className="text-base">{suggestion.createdBy.avatarEmoji}</span>
              ) : (
                <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                  {suggestion.createdBy.name[0]?.toUpperCase()}
                </div>
              )}
              <p className="text-xs text-gray-400">Sugerido por {suggestion.createdBy.name}</p>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-gray-100 flex items-center justify-between gap-2 flex-none">
          <div className="flex items-center gap-2">
            {isOwner && (
              <button
                onClick={() => { onClose(); onEdit(); }}
                className="text-sm text-gray-500 hover:text-blue-600 transition-colors font-medium"
              >
                ✏️ Editar
              </button>
            )}
            {canDelete && (
              <button
                onClick={() => { onClose(); onDelete(); }}
                className="text-sm text-gray-500 hover:text-red-500 transition-colors font-medium"
              >
                🗑️ Apagar
              </button>
            )}
          </div>

          {suggestion.addedToItinerary ? (
            <span className="text-sm text-green-600 font-medium bg-green-50 px-3 py-1.5 rounded-xl">
              ✓ No itinerário
            </span>
          ) : (
            <button
              onClick={() => { onClose(); onAddToItinerary(); }}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors"
            >
              + Adicionar ao itinerário
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
