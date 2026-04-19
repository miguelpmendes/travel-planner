"use client";

import { ITEM_TYPE_ICONS, ITEM_TYPE_LABELS, ITEM_TYPE_COLORS } from "@/lib/utils";
import type { Suggestion } from "@prisma/client";

type SuggestionWithVotes = Suggestion & {
  createdBy: { name: string; avatarEmoji: string | null };
  votes: { userId: string; value: number; user: { name: string } }[];
};

export function SuggestionCard({
  suggestion,
  rank,
  currentUserId,
  isAdmin,
  onVote,
  onAddToItinerary,
  onEdit,
  onDelete,
  onDetail,
}: {
  suggestion: SuggestionWithVotes;
  rank: number;
  currentUserId: string;
  isAdmin: boolean;
  onVote: (value: number) => void;
  onAddToItinerary: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onDetail: () => void;
}) {
  const totalScore = suggestion.votes.reduce((acc, v) => acc + v.value, 0);
  const myVote = suggestion.votes.find((v) => v.userId === currentUserId)?.value ?? 0;
  const isOwner = suggestion.createdById === currentUserId;
  const yesVoters = suggestion.votes.filter((v) => v.value === 1).map((v) => v.user.name);
  const noVoters = suggestion.votes.filter((v) => v.value === -1).map((v) => v.user.name);
  const canDelete = isOwner || isAdmin;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Rank badge */}
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

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <button onClick={onDetail} className="flex items-center gap-1.5 text-left w-full">
                  <span>{ITEM_TYPE_ICONS[suggestion.type]}</span>
                  <h3 className="font-semibold text-gray-900 truncate hover:text-blue-700 transition-colors">{suggestion.title}</h3>
                </button>
                <span
                  className={`inline-block mt-1 text-xs px-1.5 py-0.5 rounded-md border ${ITEM_TYPE_COLORS[suggestion.type]}`}
                >
                  {ITEM_TYPE_LABELS[suggestion.type]}
                </span>
              </div>

              {/* Vote buttons */}
              <div className="flex items-center gap-1 flex-none">
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
                    totalScore > 0
                      ? "text-green-600"
                      : totalScore < 0
                      ? "text-red-600"
                      : "text-gray-400"
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
            </div>

            {suggestion.description && (
              <p className="mt-2 text-sm text-gray-600 line-clamp-2">{suggestion.description}</p>
            )}

            {suggestion.location && (
              <p className="mt-1 text-xs text-gray-400">📍 {suggestion.location}</p>
            )}

            {suggestion.url && (
              <a
                href={suggestion.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 text-xs text-blue-500 hover:underline truncate block"
              >
                🔗 {suggestion.url}
              </a>
            )}

            <div className="mt-3 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <button onClick={onDetail} className="flex items-center gap-1.5 text-xs text-blue-500 hover:text-blue-700 font-medium transition-colors">
                  Ver mais
                </button>
                <span className="text-gray-200">·</span>
                <div className="flex items-center gap-1">
                  {suggestion.createdBy.avatarEmoji ? (
                    <span className="text-sm">{suggestion.createdBy.avatarEmoji}</span>
                  ) : (
                    <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold" style={{ fontSize: "9px" }}>
                      {suggestion.createdBy.name[0]?.toUpperCase()}
                    </div>
                  )}
                  <p className="text-xs text-gray-400">{suggestion.createdBy.name}</p>
                </div>
                {isOwner && (
                  <button
                    onClick={onEdit}
                    className="text-xs text-gray-400 hover:text-blue-600 transition-colors"
                    title="Editar sugestão"
                  >
                    ✏️ Editar
                  </button>
                )}
                {canDelete && (
                  <button
                    onClick={onDelete}
                    className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                    title="Apagar sugestão"
                  >
                    🗑️ Apagar
                  </button>
                )}
              </div>

              {suggestion.addedToItinerary ? (
                <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-lg">
                  ✓ No itinerário
                </span>
              ) : (
                <button
                  onClick={onAddToItinerary}
                  className="text-xs text-blue-600 font-medium hover:underline"
                >
                  + Adicionar ao itinerário
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
