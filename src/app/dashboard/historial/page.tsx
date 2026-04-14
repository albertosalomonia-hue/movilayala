import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function HistorialPage() {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const where =
    session.user.role === "admin" ? {} : { user_dni: session.user.dni };

  const registros = await prisma.daily_logs.findMany({
    where,
    include: { users: { select: { name: true, dni: true } } },
    orderBy: { created_at: "desc" },
    take: 50,
  });

  return (
    <div className="py-5 space-y-4">
      <h1 className="text-xl font-bold text-gray-900">Historial</h1>

      {registros.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center text-gray-400">
          <div className="text-4xl mb-2">📋</div>
          <p>Sin registros aún</p>
        </div>
      ) : (
        <div className="space-y-2">
          {registros.map((r) => (
            <Link
              key={r.id}
              href={`/dashboard/historial/${r.id}`}
              className="block bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:border-blue-200 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${
                        r.status === "started"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {r.status === "started" ? "En curso" : "Cerrado"}
                    </span>
                    <span className="text-xs text-gray-400">{r.date}</span>
                  </div>

                  <div className="text-sm font-medium text-gray-900">
                    🚗 {r.mileage_start} km
                    {r.mileage_end ? ` → ${r.mileage_end} km` : ""}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    ⛽ {r.fuel_start} L{r.fuel_end ? ` → ${r.fuel_end} L` : ""}
                    {r.distance ? ` • Recorrido: ${r.distance} km` : ""}
                  </div>

                  {session.user.role === "admin" && (
                    <div className="text-xs text-blue-600 mt-1">
                      👤 {r.users?.name ?? r.user_dni}
                    </div>
                  )}
                </div>

                <div className="text-gray-400 text-lg">›</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
