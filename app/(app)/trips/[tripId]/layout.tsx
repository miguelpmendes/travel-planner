import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { TripTabNav } from "@/components/trips/trip-tab-nav";
import { ManageMembersButton } from "@/components/trips/manage-members-button";
import { DeleteTripButton } from "@/components/trips/delete-trip-button";

export default async function TripLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  const session = await auth();

  const trip = await db.trip.findFirst({
    where: {
      id: tripId,
      members: { some: { userId: session!.user.id } },
    },
    include: {
      destination: true,
      members: {
        include: {
          user: { select: { id: true, name: true, username: true, avatarEmoji: true } },
        },
      },
    },
  });

  if (!trip) notFound();

  const members = trip.members.map((m) => m.user);

  return (
    <div className="flex flex-col min-h-dvh">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 md:px-8 max-w-6xl mx-auto">
          <div className="flex items-center gap-3 py-3">
            <Link href="/trips" className="text-gray-400 hover:text-gray-600 transition-colors text-sm flex-none">
              ← Viagens
            </Link>
            <span className="text-gray-300">|</span>
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span>{trip.destination.emoji ?? "🌍"}</span>
              <h1 className="font-semibold text-gray-900 truncate">{trip.title}</h1>
            </div>
            {session!.user.role === "ADMIN" && (
              <>
                <ManageMembersButton tripId={tripId} members={members} />
                <DeleteTripButton tripId={tripId} tripTitle={trip.title} />
              </>
            )}
          </div>
          <TripTabNav tripId={tripId} />
        </div>
      </header>
      <div className="flex-1">{children}</div>
    </div>
  );
}
