import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const where =
    session.user.role === "admin" ? {} : { user_dni: session.user.dni };

  const [totalRegistros, abiertos, cerradosHoy] = await Promise.all([
    prisma.daily_logs.count({ where }),
    prisma.daily_logs.count({ where: { ...where, status: "started" } }),
    prisma.daily_logs.count({
      where: {
        ...where,
        status: "ended",
        date: new Date().toLocaleDateString("es-MX"),
      },
    }),
  ]);

  const ultimosRegistros = await prisma.daily_logs.findMany({
    where,
    include: { users: { select: { name: true, dni: true } } },
    orderBy: { created_at: "desc" },
    take: 5,
  });

  return (
    <div className="py-5 space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">
          Hola, {session.user.name ?? session.user.dni} 👋
        </h1>
        <p className="text-sm text-gray-500">
          {new Date().toLocaleDateString("es-MX", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-blue-700 text-white rounded-2xl p-4 text-center">
          <div className="text-3xl font-bold">{totalRegistros}</div>
          <div className="text-xs text-blue-200 mt-1">Total</div>
        </div>
        <div className="bg-orange-500 text-white rounded-2xl p-4 text-center">
          <div className="text-3xl font-bold">{abiertos}</div>
          <div className="text-xs text-orange-100 mt-1">En curso</div>
        </div>
        <div className="bg-green-600 text-white rounded-2xl p-4 text-center">
          <div className="text-3xl font-bold">{cerradosHoy}</div>
          <div className="text-xs text-green-100 mt-1">Hoy cerrados</div>
        </div>
      </div>

      {/* Acceso rapido */}
      <Link
        href="/dashboard/nuevo"
        className="block bg-blue-700 hover:bg-blue-800 text-white rounded-2xl p-5 text-center transition-colors shadow"
      >
        <div className="text-3xl mb-1">➕</div>
        <div className="font-semibold text-lg">Nuevo Registro</div>
        <div className="text-blue-200 text-sm">Registrar kilometraje y combustible</div>
      </Link>

      {/* Ultimos registros */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-800">Últimos Registros</h2>
          <Link href="/dashboard/historial" className="text-blue-600 text-sm">
            Ver todos
          </Link>
        </div>

        {ultimosRegistros.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 text-center text-gray-400 text-sm">
            Sin registros aún
          </div>
        ) : (
          <div className="space-y-2">
            {ultimosRegistros.map((r: (typeof ultimosRegistros)[number]) => (
              <Link
                key={r.id}
                href={`/dashboard/historial/${r.id}`}
                className="block bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:border-blue-200 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900 text-sm">
                      KM: {r.mileage_start}
                      {r.mileage_end ? ` → ${r.mileage_end}` : ""}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      ⛽ {r.fuel_start}L{r.fuel_end ? ` → ${r.fuel_end}L` : ""}
                      {r.distance ? ` • ${r.distance} km` : ""}
                    </div>
                    {session.user.role === "admin" && (
                      <div className="text-xs text-gray-400 mt-0.5">
                        {r.users?.name ?? r.user_dni}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-block text-xs px-2 py-1 rounded-full font-medium ${
                        r.status === "started"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {r.status === "started" ? "En curso" : "Cerrado"}
                    </span>
                    <div className="text-xs text-gray-400 mt-1">{r.date}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
