"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ImageCapture from "@/components/ImageCapture";

type Step = "inicio" | "fin";

export default function NuevoRegistroPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("inicio");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [registroId, setRegistroId] = useState<number | null>(null);

  // Datos de inicio
  const [kmInicial, setKmInicial] = useState("");
  const [combustibleInicial, setCombustibleInicial] = useState("");
  const [fotoInicial, setFotoInicial] = useState<string | null>(null);

  // Datos de fin
  const [kmFinal, setKmFinal] = useState("");
  const [combustibleFinal, setCombustibleFinal] = useState("");
  const [fotoFinal, setFotoFinal] = useState<string | null>(null);

  const handleGuardarInicio = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/registros", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mileage_start: kmInicial,
          fuel_start: combustibleInicial,
          photo_start: fotoInicial,
          date: new Date().toLocaleDateString("es-MX"),
          time_start: new Date().toLocaleTimeString("es-MX"),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Error al guardar");
      }

      const data = await res.json();
      setRegistroId(data.id);
      setStep("fin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  const handleGuardarFin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registroId) return;
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`/api/registros/${registroId}`, {
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

      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-5 space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Nuevo Registro</h1>
        <p className="text-sm text-gray-500">
          {step === "inicio" ? "Datos de salida" : "Datos de llegada"}
        </p>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-2">
        <div className={`flex-1 h-2 rounded-full ${step === "inicio" || step === "fin" ? "bg-blue-700" : "bg-gray-200"}`} />
        <div className={`flex-1 h-2 rounded-full ${step === "fin" ? "bg-blue-700" : "bg-gray-200"}`} />
      </div>
      <div className="flex justify-between text-xs text-gray-500 -mt-3">
        <span className={step === "inicio" ? "text-blue-700 font-semibold" : "text-green-600"}>
          {step === "fin" ? "✓ " : ""}Salida
        </span>
        <span className={step === "fin" ? "text-blue-700 font-semibold" : ""}>Llegada</span>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {step === "inicio" ? (
        <form onSubmit={handleGuardarInicio} className="space-y-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
              <span>🚗</span> Kilometraje Inicial
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kilometraje <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                inputMode="decimal"
                value={kmInicial}
                onChange={(e) => setKmInicial(e.target.value)}
                required
                placeholder="Ej: 125430"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>
            <ImageCapture
              label="Foto del Odómetro (opcional)"
              value={fotoInicial}
              onChange={setFotoInicial}
            />
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
              <span>⛽</span> Combustible Inicial
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Combustible (Litros) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                value={combustibleInicial}
                onChange={(e) => setCombustibleInicial(e.target.value)}
                required
                placeholder="Ej: 45.5"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-700 hover:bg-blue-800 disabled:bg-blue-400 text-white font-semibold py-4 rounded-2xl transition-colors"
          >
            {loading ? "Guardando..." : "Guardar y continuar →"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleGuardarFin} className="space-y-4">
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
            {kmInicial && kmFinal && parseFloat(kmFinal) > parseFloat(kmInicial) && (
              <div className="bg-blue-50 text-blue-700 text-sm px-4 py-2 rounded-xl">
                📍 Distancia: <strong>{(parseFloat(kmFinal) - parseFloat(kmInicial)).toFixed(1)} km</strong>
              </div>
            )}
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
            {combustibleInicial && combustibleFinal && (
              <div className="bg-green-50 text-green-700 text-sm px-4 py-2 rounded-xl">
                ⛽ Consumo: <strong>{(parseFloat(combustibleInicial) - parseFloat(combustibleFinal)).toFixed(2)} L</strong>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep("inicio")}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-4 rounded-2xl transition-colors"
            >
              ← Atrás
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-4 rounded-2xl transition-colors"
            >
              {loading ? "Guardando..." : "✓ Cerrar Registro"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
