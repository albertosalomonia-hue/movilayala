"use client";

import { useState } from "react";

type Usuario = {
  id: number;
  dni: string;
  name: string | null;
  role: "admin" | "user" | null;
  created_at: Date | null;
};

type Props = { usuariosIniciales: Usuario[] };

export default function AdminUsuarios({ usuariosIniciales }: Props) {
  const [usuarios, setUsuarios] = useState<Usuario[]>(usuariosIniciales);
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Formulario
  const [dni, setDni] = useState("");
  const [nombre, setNombre] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState<"user" | "admin">("user");

  const resetForm = () => {
    setDni("");
    setNombre("");
    setPassword("");
    setRol("user");
    setEditando(null);
    setShowForm(false);
    setError("");
  };

  const abrirEditar = (u: Usuario) => {
    setEditando(u);
    setDni(u.dni);
    setNombre(u.name ?? "");
    setPassword("");
    setRol(u.role === "admin" ? "admin" : "user");
    setShowForm(true);
  };

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (editando) {
        const res = await fetch(`/api/usuarios/${editando.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: nombre, role: rol, ...(password ? { password } : {}) }),
        });
        if (!res.ok) throw new Error((await res.json()).error);
        const updated: Usuario = await res.json();
        setUsuarios((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      } else {
        const res = await fetch("/api/usuarios", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dni, name: nombre, password, role: rol }),
        });
        if (!res.ok) throw new Error((await res.json()).error);
        const nuevo: Usuario = await res.json();
        setUsuarios((prev) => [nuevo, ...prev]);
      }
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async (u: Usuario) => {
    if (!confirm(`¿Eliminar al usuario ${u.name ?? u.dni}?`)) return;
    try {
      const res = await fetch(`/api/usuarios/${u.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error);
      setUsuarios((prev) => prev.filter((x) => x.id !== u.id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al eliminar");
    }
  };

  return (
    <div className="py-5 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Usuarios</h1>
          <p className="text-sm text-gray-500">{usuarios.length} registrados</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
        >
          + Nuevo
        </button>
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-5 space-y-4">
          <h2 className="font-semibold text-gray-800">
            {editando ? `Editar: ${editando.name ?? editando.dni}` : "Nuevo Usuario"}
          </h2>

          <form onSubmit={handleGuardar} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">DNI / Usuario</label>
              <input
                type="text"
                value={dni}
                onChange={(e) => setDni(e.target.value)}
                required={!editando}
                disabled={!!editando}
                placeholder="Ej: 12345678"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 disabled:bg-gray-50 disabled:text-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Juan Pérez"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña {editando && <span className="text-gray-400 font-normal">(dejar vacío para no cambiar)</span>}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required={!editando}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRol("user")}
                  className={`py-3 rounded-xl border-2 text-sm font-medium transition-colors ${
                    rol === "user"
                      ? "border-blue-700 bg-blue-50 text-blue-700"
                      : "border-gray-200 text-gray-500"
                  }`}
                >
                  👤 Operador
                </button>
                <button
                  type="button"
                  onClick={() => setRol("admin")}
                  className={`py-3 rounded-xl border-2 text-sm font-medium transition-colors ${
                    rol === "admin"
                      ? "border-blue-700 bg-blue-50 text-blue-700"
                      : "border-gray-200 text-gray-500"
                  }`}
                >
                  🛡️ Admin
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-700 hover:bg-blue-800 disabled:bg-blue-400 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                {loading ? "Guardando..." : editando ? "Guardar cambios" : "Crear usuario"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de usuarios */}
      <div className="space-y-2">
        {usuarios.map((u) => (
          <div
            key={u.id}
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${u.role === "admin" ? "bg-blue-700" : "bg-gray-400"}`}>
                {(u.name ?? u.dni).charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="font-medium text-gray-900 text-sm">{u.name ?? "—"}</div>
                <div className="text-xs text-gray-500">DNI: {u.dni}</div>
                <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium mt-0.5 ${u.role === "admin" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`}>
                  {u.role === "admin" ? "🛡️ Admin" : "👤 Operador"}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => abrirEditar(u)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors text-lg"
                title="Editar"
              >
                ✏️
              </button>
              <button
                onClick={() => handleEliminar(u)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors text-lg"
                title="Eliminar"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
