"use client";

import { useState } from "react";
import { ManageMembersModal } from "./manage-members-modal";

type Member = {
  id: string;
  name: string;
  username: string;
  avatarEmoji: string | null;
};

export function ManageMembersButton({
  tripId,
  members,
}: {
  tripId: string;
  members: Member[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
        title="Gerir membros"
      >
        <div className="flex -space-x-1.5">
          {members.slice(0, 3).map((m) => (
            <div
              key={m.id}
              className="w-5 h-5 rounded-full bg-blue-100 border border-white flex items-center justify-center text-xs"
            >
              {m.avatarEmoji ?? m.name[0].toUpperCase()}
            </div>
          ))}
        </div>
        <span>{members.length}</span>
      </button>

      {open && (
        <ManageMembersModal
          tripId={tripId}
          initialMembers={members}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
