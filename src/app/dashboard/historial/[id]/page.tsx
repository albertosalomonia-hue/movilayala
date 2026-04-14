import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";

export default async function DetalleRegistroPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const { id } = await params;
  const r = await prisma.daily_logs.findUnique({
    where: { id: parseInt(id) },
    include: { users: { select: { name: true, dni: true } } },
  });

  if (!r) notFound();

  if (r.user_dni !== session.user.dni && session.user.role !== "admin") {
    redirect("/dashboard");
  }

  const distancia = r.distance ? parseFloat(r.distance) : null;
  const fuelUsed =
    r.fuel_start && r.fuel_end
      ? (parseFloat(r.fuel_start) - parseFloat(r.fuel_end)).toFixed(2)
      : null;

  return (
    <div className="py-5 space-y-4">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/historial" className="text-blue-600 text-lg">
          ←
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Detalle #{r.id}</h1>
          <p className="text-sm text-gray-500">{r.date}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span
          className={`inline-block text-sm px-3 py-1 rounded-full font-medium ${
            r.status === "started"
              ? "bg-orange-100 text-orange-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {r.status === "started" ? "🔄 En curso" : "✅ Cerrado"}
        </span>
        {r.users && (
          <span className="text-sm text-gray-500">
            👤 {r.users.name ?? r.user_dni}
          </span>
        )}
      </div>

      {/* Resumen */}
      {distancia !== null && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-700 text-white rounded-2xl p-4 text-center">
            <div className="text-2xl font-bold">{distancia}</div>
            <div className="text-xs text-blue-200 mt-1">Km Recorridos</div>
          </div>
          {fuelUsed && (
            <div className="bg-green-600 text-white rounded-2xl p-4 text-center">
              <div className="text-2xl font-bold">{fuelUsed}</div>
              <div className="text-xs text-green-100 mt-1">Litros Usados</div>
            </div>
          )}
        </div>
      )}

      {/* Datos de salida */}
      <div className="bg-white rounded-2xl p-5 shadow-sm space-y-3">
        <h2 className="font-semibold text-gray-800">🚗 Salida</h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-gray-500 block">Kilometraje</span>
            <span className="font-semibold text-gray-900">{r.mileage_start} km</span>
          </div>
          <div>
            <span className="text-gray-500 block">Combustible</span>
            <span className="font-semibold text-gray-900">{r.fuel_start} L</span>
          </div>
          {r.time_start && (
            <div>
              <span className="text-gray-500 block">Hora</span>
              <span className="font-semibold text-gray-900">{r.time_start}</span>
            </div>
          )}
        </div>
        {r.photo_start && (
          <div className="mt-2">
            <span className="text-xs text-gray-500 block mb-1">Foto odómetro salida</span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={r.photo_start}
              alt="Odómetro inicial"
              className="w-full h-48 object-cover rounded-xl border border-gray-200"
            />
          </div>
        )}
      </div>

      {/* Datos de llegada */}
      {r.mileage_end ? (
        <div className="bg-white rounded-2xl p-5 shadow-sm space-y-3">
          <h2 className="font-semibold text-gray-800">🏁 Llegada</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-500 block">Kilometraje</span>
              <span className="font-semibold text-gray-900">{r.mileage_end} km</span>
            </div>
            <div>
              <span className="text-gray-500 block">Combustible</span>
              <span className="font-semibold text-gray-900">{r.fuel_end} L</span>
            </div>
            {r.time_end && (
              <div>
                <span className="text-gray-500 block">Hora</span>
                <span className="font-semibold text-gray-900">{r.time_end}</span>
              </div>
            )}
          </div>
          {r.photo_end && (
            <div className="mt-2">
              <span className="text-xs text-gray-500 block mb-1">Foto odómetro llegada</span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={r.photo_end}
                alt="Odómetro final"
                className="w-full h-48 object-cover rounded-xl border border-gray-200"
              />
            </div>
          )}
        </div>
      ) : (
        <Link
          href={`/dashboard/historial/${r.id}/cerrar`}
          className="block bg-orange-500 hover:bg-orange-600 text-white rounded-2xl p-4 text-center font-semibold transition-colors"
        >
          Registrar llegada →
        </Link>
      )}
    </div>
  );
}
