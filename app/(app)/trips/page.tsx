import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CreateTripButton } from "@/components/trips/create-trip-button";

export default async function TripsPage() {
  const session = await auth();

  const trips = await db.trip.findMany({
    where: { members: { some: { userId: session!.user.id } } },
    include: {
      destination: true,
      members: { include: { user: { select: { name: true } } } },
    },
    orderBy: { startDate: "asc" },
  });

  const destinations = await db.destination.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Viagens</h1>
          <p className="text-gray-500 mt-1">Todas as viagens planeadas</p>
        </div>
        {session!.user.role === "ADMIN" && (
          <CreateTripButton destinations={destinations} />
        )}
      </div>

      {trips.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🧳</div>
          <p className="text-gray-500">Ainda sem viagens.</p>
          {session!.user.role === "ADMIN" && (
            <p className="text-sm text-gray-400 mt-2">Cria a primeira viagem com o botão acima.</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {trips.map((trip) => (
            <Link
              key={trip.id}
              href={`/trips/${trip.id}`}
              className="bg-white rounded-2xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-md active:scale-[0.98] transition-all group"
            >
              <div className="text-3xl mb-2">{trip.destination.emoji ?? "🌍"}</div>
              <h2 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                {trip.title}
              </h2>
              <p className="text-sm text-gray-400 mt-0.5">{trip.destination.name}</p>
              <div className="mt-3 text-xs text-gray-500">
                {format(trip.startDate, "d MMM", { locale: ptBR })} →{" "}
                {format(trip.endDate, "d MMM yyyy", { locale: ptBR })}
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {trip.members.map((m) => (
                  <span
                    key={m.user.name}
                    className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
                  >
                    {m.user.name}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
