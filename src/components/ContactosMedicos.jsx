import { useEffect, useState } from "react";
import Header from "./Header";
import { loadContactos, saveContactos, rolesSugeridos } from "../data/contactosMedicos";

const emptyForm = { nombre: "", rol: rolesSugeridos[0], telefono: "" };

export default function ContactosMedicos({ onBack }) {
  const [contactos, setContactos] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    setContactos(loadContactos());
  }, []);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleGuardar = () => {
    if (!form.nombre.trim()) return;
    let next;
    if (editingId) {
      next = contactos.map((c) => (c.id === editingId ? { ...form, id: editingId } : c));
    } else {
      next = [...contactos, { ...form, id: Date.now().toString() }];
    }
    setContactos(next);
    saveContactos(next);
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleEditar = (c) => {
    setForm({ nombre: c.nombre, rol: c.rol, telefono: c.telefono });
    setEditingId(c.id);
  };

  const handleEliminar = (id) => {
    const next = contactos.filter((c) => c.id !== id);
    setContactos(next);
    saveContactos(next);
    if (editingId === id) {
      setEditingId(null);
      setForm(emptyForm);
    }
  };

  const cancelarEdicion = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  return (
    <div>
      {onBack && (
        <button
          onClick={onBack}
          className="text-sm text-gray-500 hover:text-rose-500 mb-4 flex items-center gap-1"
        >
          ← Volver a Mi Perfil
        </button>
      )}

      <Header
        title="📞 Contactos del equipo médico"
        subtitle="Todos los teléfonos importantes, a mano para una emergencia"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-rose-100 p-5 shadow-sm">
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            {editingId ? "Editar contacto" : "Agregar contacto"}
          </p>

          <label className="text-xs text-gray-500 block mb-1">Nombre</label>
          <input
            type="text"
            value={form.nombre}
            onChange={(e) => updateField("nombre", e.target.value)}
            placeholder="Ej: Dra. Pérez"
            className="w-full border border-rose-100 rounded-xl p-2 text-sm text-gray-700 mb-3 focus:outline-none focus:border-rose-300"
          />

          <label className="text-xs text-gray-500 block mb-1">Rol</label>
          <select
            value={form.rol}
            onChange={(e) => updateField("rol", e.target.value)}
            className="w-full border border-rose-100 rounded-xl p-2 text-sm text-gray-700 mb-3 focus:outline-none focus:border-rose-300"
          >
            {rolesSugeridos.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>

          <label className="text-xs text-gray-500 block mb-1">Teléfono</label>
          <input
            type="tel"
            value={form.telefono}
            onChange={(e) => updateField("telefono", e.target.value)}
            placeholder="Ej: 11 5555 5555"
            className="w-full border border-rose-100 rounded-xl p-2 text-sm text-gray-700 mb-4 focus:outline-none focus:border-rose-300"
          />

          <div className="flex items-center gap-3">
            <button
              onClick={handleGuardar}
              className="bg-rose-500 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-rose-600 transition-colors"
            >
              {editingId ? "Guardar cambios" : "+ Agregar"}
            </button>
            {editingId && (
              <button
                onClick={cancelarEdicion}
                className="text-sm text-gray-500 hover:text-rose-500"
              >
                Cancelar
              </button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-rose-100 p-5 shadow-sm">
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Tus contactos
          </p>
          {contactos.length === 0 ? (
            <p className="text-sm text-gray-400">Todavía no agregaste ningún contacto.</p>
          ) : (
            <ul className="space-y-2">
              {contactos.map((c) => (
                <li
                  key={c.id}
                  className="flex items-center justify-between bg-rose-50 border border-rose-100 rounded-xl px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-800">{c.nombre}</p>
                    <p className="text-xs text-gray-500">
                      {c.rol} {c.telefono && `· ${c.telefono}`}
                    </p>
                  </div>
                  <div className="flex gap-2 text-xs">
                    <button
                      onClick={() => handleEditar(c)}
                      className="text-rose-500 hover:underline"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleEliminar(c.id)}
                      className="text-gray-400 hover:text-red-500 hover:underline"
                    >
                      Eliminar
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
