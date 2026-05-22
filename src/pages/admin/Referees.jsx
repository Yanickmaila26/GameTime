import React, { useState, useEffect } from 'react';
import client from '../../api/client';
import { 
  UserCheck, Plus, Trash2, Edit2, Loader2, X, Sparkles, Phone, Mail, Award
} from 'lucide-react';

export default function Referees() {
  const [referees, setReferees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRef, setEditingRef] = useState(null);
  const [form, setForm] = useState({ name: '', certification: 'FIBA', phone: '', email: '', status: 'activo' });
  const [error, setError] = useState(null);

  const fetchReferees = async () => {
    try {
      setLoading(true);
      const res = await client.get('/referees');
      setReferees(res.data);
    } catch (err) {
      console.error('Error fetching referees', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferees();
  }, []);

  const handleOpenModal = (ref = null) => {
    if (ref) {
      setEditingRef(ref);
      setForm({
        name: ref.name,
        certification: ref.certification || 'FIBA',
        phone: ref.phone || '',
        email: ref.email || '',
        status: ref.status || 'activo'
      });
    } else {
      setEditingRef(null);
      setForm({ name: '', certification: 'FIBA', phone: '', email: '', status: 'activo' });
    }
    setError(null);
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      if (editingRef) {
        await client.put(`/referees/${editingRef.id}`, form);
      } else {
        await client.post('/referees', form);
      }
      setShowModal(false);
      fetchReferees();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar árbitro');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de desactivar este árbitro?')) {
      try {
        await client.delete(`/referees/${id}`);
        fetchReferees();
      } catch (err) {
        alert('Error al desactivar árbitro');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Title block */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-white flex items-center space-x-2">
            <UserCheck className="w-6 h-6 text-[#F57C00]" />
            <span>Colegio de Árbitros</span>
          </h1>
          <p className="text-xs text-gray-500">Administra el personal arbitral y jueces de mesa para el campeonato</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center space-x-2 px-5 py-3 bg-gradient-to-r from-orange-500 to-amber-600 text-black font-extrabold text-xs rounded-xl shadow-md transform hover:scale-105 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Árbitro</span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-[#F57C00]" />
        </div>
      ) : referees.length === 0 ? (
        <div className="text-center py-16 bg-[#0d0d0d] border border-[#1a1a1a] rounded-3xl text-gray-500 font-bold">
          No hay árbitros registrados en el sistema.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {referees.map((ref) => (
            <div
              key={ref.id}
              className={`bg-[#0d0d0d] border rounded-3xl p-5 hover:border-orange-500/30 transition-all flex flex-col justify-between group ${
                ref.status === 'inactivo' ? 'opacity-50 border-dashed border-[#222]' : 'border-[#1a1a1a]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="inline-flex items-center space-x-1 bg-blue-500/10 border border-blue-500/20 text-[9px] font-black text-blue-400 px-2 py-0.5 rounded-full uppercase">
                    <Award className="w-3 h-3 mr-0.5" /> Juez {ref.certification}
                  </span>
                  <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleOpenModal(ref)}
                      className="p-1.5 bg-[#121212] hover:bg-[#1a1a1a] border border-[#1e1e1e] rounded-lg text-gray-400 hover:text-white"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    {ref.status === 'activo' && (
                      <button
                        onClick={() => handleDelete(ref.id)}
                        className="p-1.5 bg-red-950/20 hover:bg-red-950/40 border border-red-500/20 rounded-lg text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                <h3 className="text-sm font-black text-white mb-4 group-hover:text-[#F57C00] transition-colors">{ref.name}</h3>

                <div className="space-y-2 text-xs text-gray-400 font-bold">
                  {ref.phone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="w-3.5 h-3.5 text-gray-500" />
                      <span>{ref.phone}</span>
                    </div>
                  )}
                  {ref.email && (
                    <div className="flex items-center space-x-2">
                      <Mail className="w-3.5 h-3.5 text-gray-500" />
                      <span>{ref.email}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-[#121212] flex items-center justify-between">
                <span className="text-[10px] text-gray-500 font-mono">ID: REF-{ref.id}</span>
                <span className={`text-[10px] font-black uppercase tracking-wider ${
                  ref.status === 'activo' ? 'text-emerald-400' : 'text-red-400'
                }`}>
                  • {ref.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* REFEREE FORM MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-gradient-to-b from-[#121212] to-[#0a0a0a] border border-[#1e1e1e] p-6 rounded-3xl shadow-2xl relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-black text-white mb-4">
              {editingRef ? 'Editar Árbitro' : 'Registrar Árbitro'}
            </h2>

            {error && (
              <div className="mb-4 p-3 bg-red-950/40 border border-red-500/20 rounded-xl text-xs text-red-400 font-bold">
                {error}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Nombre Completo</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ej. Juan Carlos Pérez"
                  className="w-full bg-[#121212] border border-[#222] text-sm text-white px-4 py-3 rounded-xl focus:border-orange-500 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Certificación / Licencia</label>
                  <select
                    value={form.certification}
                    onChange={(e) => setForm({ ...form, certification: e.target.value })}
                    className="w-full bg-[#121212] border border-[#222] text-sm text-white px-4 py-3 rounded-xl focus:border-orange-500 outline-none"
                  >
                    <option value="FIBA">FIBA Internacional</option>
                    <option value="Nacional">Nacional A</option>
                    <option value="Provincial">Provincial B</option>
                    <option value="Mesa">Juez de Mesa</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Estado</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full bg-[#121212] border border-[#222] text-sm text-white px-4 py-3 rounded-xl focus:border-orange-500 outline-none"
                  >
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Teléfono</label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="Ej. +593 999 999 999"
                    className="w-full bg-[#121212] border border-[#222] text-sm text-white px-4 py-3 rounded-xl focus:border-orange-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Correo Electrónico</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="Ej. juan@ref.gametime.ec"
                    className="w-full bg-[#121212] border border-[#222] text-sm text-white px-4 py-3 rounded-xl focus:border-orange-500 outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-600 text-black font-extrabold text-sm rounded-xl transform active:scale-95 transition-all shadow-md mt-4"
              >
                {editingRef ? 'Guardar Cambios' : 'Registrar Árbitro'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
