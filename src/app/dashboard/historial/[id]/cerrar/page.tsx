"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import ImageCapture from "@/components/ImageCapture";

export default function CerrarRegistroPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [kmFinal, setKmFinal] = useState("");
  const [combustibleFinal, setCombustibleFinal] = useState("");
  const [fotoFinal, setFotoFinal] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`/api/registros/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mileage_end: kmFinal,
          fuel_end: combustibleFinal,
          photo_end: fotoFinal,
          time_end: new Date().toLocaleTimeString("es-MX"),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Error al cerrar");
      }

      router.push(`/dashboard/historial/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-5 space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Registrar Llegada</h1>
        <p className="text-sm text-gray-500">Cierre del registro #{id}</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2">
            <span>🏁</span> Kilometraje Final
          </h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kilometraje <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              inputMode="decimal"
              value={kmFinal}
              onChange={(e) => setKmFinal(e.target.value)}
              required
              placeholder="Ej: 125680"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            />
          </div>
          <ImageCapture
            label="Foto del Odómetro Final (opcional)"
            value={fotoFinal}
            onChange={setFotoFinal}
          />
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2">
            <span>⛽</span> Combustible Final
          </h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Combustible (Litros) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              value={combustibleFinal}
              onChange={(e) => setCombustibleFinal(e.target.value)}
              required
              placeholder="Ej: 30.0"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-4 rounded-2xl transition-colors"
          >
            ← Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-4 rounded-2xl transition-colors"
          >
            {loading ? "Guardando..." : "✓ Cerrar"}
          </button>
        </div>
      </form>
    </div>
  );
}
