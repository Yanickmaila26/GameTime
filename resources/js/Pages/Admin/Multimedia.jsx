import React, { useState, useMemo } from 'react';
import { useForm, router } from '@inertiajs/react';
import AdminLayout from '../../Components/AdminLayout';
import { Image, Upload, Trash2, Shield, Globe, Plus, AlertCircle } from 'lucide-react';

export default function Multimedia({ teams = [], multimedia = [] }) {
  const [activeTab, setActiveTab] = useState('general'); // 'general' or 'teams'
  const [selectedTeamId, setSelectedTeamId] = useState(teams[0]?.id || '');

  // Split media into general and team-based
  const generalMedia = useMemo(() => {
    return multimedia.filter(m => !m.team_id);
  }, [multimedia]);

  const teamMedia = useMemo(() => {
    if (!selectedTeamId) return [];
    return multimedia.filter(m => m.team_id === Number(selectedTeamId));
  }, [multimedia, selectedTeamId]);

  // General upload form
  const generalForm = useForm({
    files: [],
    team_id: '',
    title: ''
  });

  // Team upload form
  const teamForm = useForm({
    files: [],
    team_id: selectedTeamId,
    title: ''
  });

  const handleGeneralSubmit = (e) => {
    e.preventDefault();
    generalForm.post('/admin/multimedia', {
      onSuccess: () => {
        generalForm.reset();
        // Reset file input element manually
        document.getElementById('general-file-input').value = '';
      }
    });
  };

  const handleTeamSubmit = (e) => {
    e.preventDefault();
    // Ensure the correct team ID is sent
    teamForm.setData('team_id', selectedTeamId);
    teamForm.post('/admin/multimedia', {
      onSuccess: () => {
        teamForm.reset();
        document.getElementById('team-file-input').value = '';
      }
    });
  };

  const handleDelete = (id) => {
    if (confirm('¿Estás seguro de que deseas eliminar esta imagen de la galería?')) {
      router.delete(`/admin/multimedia/${id}`);
    }
  };

  return (
    <AdminLayout title="Galería y Multimedia">
      <div className="space-y-6">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0d0d0d] p-6 rounded-3xl border border-[#1a1a1a]">
          <div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">Gestión de Galería y Multimedia</h2>
            <p className="text-xs text-gray-400 mt-1">
              Sube fotos para las galerías públicas. Puedes añadir imágenes al hilo general del torneo o asignarlas a clubes específicos.
            </p>
          </div>
          
          {/* Tab Switcher */}
          <div className="bg-[#050505] p-1 rounded-xl border border-[#161616] flex space-x-1 self-start md:self-center">
            <button
              onClick={() => setActiveTab('general')}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'general'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-black shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Galería General</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('teams');
                if (teams.length > 0 && !selectedTeamId) {
                  setSelectedTeamId(teams[0].id);
                }
              }}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'teams'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-black shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Galerías por Equipo</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Galería General */}
        {activeTab === 'general' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Upload Box */}
            <div className="lg:col-span-4 bg-[#0d0d0d] p-5 rounded-3xl border border-[#1a1a1a] h-fit">
              <div className="flex items-center space-x-2 border-b border-[#1a1a1a] pb-3 mb-4">
                <Globe className="w-4 h-4 text-orange-500" />
                <h3 className="font-extrabold text-xs text-white uppercase tracking-wider">Subir Foto General</h3>
              </div>

              <form onSubmit={handleGeneralSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Título / Descripción (Opcional)</label>
                  <input
                    type="text"
                    placeholder="Ej. Inauguración del Campeonato"
                    value={generalForm.data.title}
                    onChange={(e) => generalForm.setData('title', e.target.value)}
                    className="w-full bg-[#050505] border border-[#1c1c1c] rounded-xl text-xs font-bold text-white px-3 py-2.5 focus:outline-none focus:border-basketball focus:ring-1 focus:ring-basketball/50"
                  />
                  {generalForm.errors.title && (
                    <span className="text-[10px] text-red-500 font-bold block mt-1">{generalForm.errors.title}</span>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Imágenes</label>
                  <div className="relative group border border-dashed border-[#222] hover:border-basketball/50 rounded-xl p-6 text-center cursor-pointer transition-colors bg-[#050505]">
                    <input
                      id="general-file-input"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => generalForm.setData('files', Array.from(e.target.files))}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Upload className="w-7 h-7 text-gray-500 group-hover:text-basketball mx-auto mb-2 transition-colors" />
                    <span className="block text-[11px] font-bold text-gray-300">
                      {generalForm.data.files && generalForm.data.files.length > 0
                        ? `${generalForm.data.files.length} archivos seleccionados`
                        : 'Selecciona o arrastra imágenes'}
                    </span>
                    {generalForm.data.files && generalForm.data.files.length > 0 && (
                      <span className="block text-[9px] text-gray-400 mt-1 max-w-xs mx-auto truncate">
                        {generalForm.data.files.map(f => f.name).join(', ')}
                      </span>
                    )}
                    <span className="block text-[8px] text-gray-500 mt-1.5">Formatos: JPG, PNG, WEBP, GIF. Max: 5MB por archivo</span>
                  </div>
                  {Object.keys(generalForm.errors).filter(k => k.startsWith('files') || k === 'files').map((errKey) => (
                    <span key={errKey} className="text-[10px] text-red-500 font-bold block mt-1">
                      {generalForm.errors[errKey]}
                    </span>
                  ))}
                </div>

                 <button
                  type="submit"
                  disabled={generalForm.processing || !generalForm.data.files || generalForm.data.files.length === 0}
                  className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 disabled:from-gray-800 disabled:to-gray-800 text-black disabled:text-gray-500 font-black text-xs py-3 rounded-xl transition-all shadow-[0_4px_15px_rgba(245,124,0,0.1)] flex items-center justify-center space-x-2"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>{generalForm.processing ? 'Subiendo...' : 'SUBIR FOTOS'}</span>
                </button>
              </form>
            </div>

            {/* General Grid */}
            <div className="lg:col-span-8 bg-[#0d0d0d] p-5 rounded-3xl border border-[#1a1a1a]">
              <div className="flex items-center justify-between border-b border-[#1a1a1a] pb-3 mb-4">
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">
                  Fotos del Torneo
                </span>
                <span className="text-[10px] text-orange-500 font-extrabold uppercase">
                  {generalMedia.length} Imágenes
                </span>
              </div>

              {generalMedia.length === 0 ? (
                <div className="text-center py-16 text-xs text-gray-500 font-bold border border-[#161616] bg-[#050505] rounded-2xl flex flex-col items-center justify-center p-6">
                  <Image className="w-8 h-8 text-gray-600 mb-2" />
                  <p>Aún no hay fotos en la galería general del torneo.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {generalMedia.map((mediaItem) => (
                    <div key={mediaItem.id} className="relative group rounded-xl overflow-hidden border border-[#161616] bg-[#050505] aspect-video">
                      <img src={mediaItem.file_path} alt={mediaItem.title || 'Torneo'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3">
                        <button
                          onClick={() => handleDelete(mediaItem.id)}
                          className="self-end p-1.5 bg-red-600/20 hover:bg-red-600 border border-red-500/20 hover:border-red-500 text-red-500 hover:text-white rounded-lg transition-all"
                          title="Eliminar imagen"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <div>
                          <p className="text-[11px] font-black text-white truncate">{mediaItem.title || 'Sin Título'}</p>
                          <span className="text-[8px] text-gray-400 font-bold uppercase tracking-wider block mt-0.5">
                            {new Date(mediaItem.created_at).toLocaleDateString('es-EC')}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Galerías por Equipo */}
        {activeTab === 'teams' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left side: Upload Form + Team Selector */}
            <div className="lg:col-span-4 space-y-4">
              
              {/* Team Selector card */}
              <div className="bg-[#0d0d0d] p-5 rounded-3xl border border-[#1a1a1a]">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Selecciona el Club</label>
                <select
                  value={selectedTeamId}
                  onChange={(e) => setSelectedTeamId(e.target.value)}
                  className="w-full bg-[#050505] border border-[#1c1c1c] rounded-xl text-xs font-bold text-white px-3 py-2.5 focus:outline-none focus:border-basketball focus:ring-1 focus:ring-basketball/50"
                >
                  <option value="" disabled>Seleccionar equipo...</option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              {/* Upload Box */}
              {selectedTeamId && (
                <div className="bg-[#0d0d0d] p-5 rounded-3xl border border-[#1a1a1a]">
                  <div className="flex items-center space-x-2 border-b border-[#1a1a1a] pb-3 mb-4">
                    <Shield className="w-4 h-4 text-orange-500" />
                    <h3 className="font-extrabold text-xs text-white uppercase tracking-wider">Subir Foto del Club</h3>
                  </div>

                  <form onSubmit={handleTeamSubmit} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Título / Descripción (Opcional)</label>
                      <input
                        type="text"
                        placeholder="Ej. Plantilla 2026 o Victoria vs Spartans"
                        value={teamForm.data.title}
                        onChange={(e) => teamForm.setData('title', e.target.value)}
                        className="w-full bg-[#050505] border border-[#1c1c1c] rounded-xl text-xs font-bold text-white px-3 py-2.5 focus:outline-none focus:border-basketball focus:ring-1 focus:ring-basketball/50"
                      />
                      {teamForm.errors.title && (
                        <span className="text-[10px] text-red-500 font-bold block mt-1">{teamForm.errors.title}</span>
                      )}
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Imágenes</label>
                      <div className="relative group border border-dashed border-[#222] hover:border-basketball/50 rounded-xl p-6 text-center cursor-pointer transition-colors bg-[#050505]">
                        <input
                          id="team-file-input"
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={(e) => teamForm.setData('files', Array.from(e.target.files))}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <Upload className="w-7 h-7 text-gray-500 group-hover:text-basketball mx-auto mb-2 transition-colors" />
                        <span className="block text-[11px] font-bold text-gray-300">
                          {teamForm.data.files && teamForm.data.files.length > 0
                            ? `${teamForm.data.files.length} archivos seleccionados`
                            : 'Selecciona o arrastra imágenes'}
                        </span>
                        {teamForm.data.files && teamForm.data.files.length > 0 && (
                          <span className="block text-[9px] text-gray-400 mt-1 max-w-xs mx-auto truncate">
                            {teamForm.data.files.map(f => f.name).join(', ')}
                          </span>
                        )}
                        <span className="block text-[8px] text-gray-500 mt-1.5">Formatos: JPG, PNG, WEBP, GIF. Max: 5MB por archivo</span>
                      </div>
                      {Object.keys(teamForm.errors).filter(k => k.startsWith('files') || k === 'files').map((errKey) => (
                        <span key={errKey} className="text-[10px] text-red-500 font-bold block mt-1">
                          {teamForm.errors[errKey]}
                        </span>
                      ))}
                    </div>

                    <button
                      type="submit"
                      disabled={teamForm.processing || !teamForm.data.files || teamForm.data.files.length === 0}
                      className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 disabled:from-gray-800 disabled:to-gray-800 text-black disabled:text-gray-500 font-black text-xs py-3 rounded-xl transition-all shadow-[0_4px_15px_rgba(245,124,0,0.1)] flex items-center justify-center space-x-2"
                    >
                      <Plus className="w-4 h-4 stroke-[3]" />
                      <span>{teamForm.processing ? 'Subiendo...' : 'SUBIR FOTOS'}</span>
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Right side: Team Grid */}
            <div className="lg:col-span-8 bg-[#0d0d0d] p-5 rounded-3xl border border-[#1a1a1a]">
              <div className="flex items-center justify-between border-b border-[#1a1a1a] pb-3 mb-4">
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">
                  {selectedTeamId ? `Fotos de: ${teams.find(t => t.id === Number(selectedTeamId))?.name || ''}` : 'Galería del Equipo'}
                </span>
                <span className="text-[10px] text-orange-500 font-extrabold uppercase">
                  {teamMedia.length} Imágenes
                </span>
              </div>

              {!selectedTeamId ? (
                <div className="text-center py-16 text-xs text-gray-500 font-bold border border-dashed border-[#1a1a1a] rounded-2xl p-6 bg-[#050505]">
                  <AlertCircle className="w-7 h-7 text-gray-600 mx-auto mb-2" />
                  <p>Por favor, selecciona un club en el menú lateral para gestionar sus fotos.</p>
                </div>
              ) : teamMedia.length === 0 ? (
                <div className="text-center py-16 text-xs text-gray-500 font-bold border border-[#161616] bg-[#050505] rounded-2xl flex flex-col items-center justify-center p-6">
                  <Image className="w-8 h-8 text-gray-600 mb-2" />
                  <p>Aún no hay fotos registradas para este equipo.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {teamMedia.map((mediaItem) => (
                    <div key={mediaItem.id} className="relative group rounded-xl overflow-hidden border border-[#161616] bg-[#050505] aspect-video">
                      <img src={mediaItem.file_path} alt={mediaItem.title || 'Equipo'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3">
                        <button
                          onClick={() => handleDelete(mediaItem.id)}
                          className="self-end p-1.5 bg-red-600/20 hover:bg-red-600 border border-red-500/20 hover:border-red-500 text-red-500 hover:text-white rounded-lg transition-all"
                          title="Eliminar imagen"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <div>
                          <p className="text-[11px] font-black text-white truncate">{mediaItem.title || 'Sin Título'}</p>
                          <span className="text-[8px] text-gray-400 font-bold uppercase tracking-wider block mt-0.5">
                            {new Date(mediaItem.created_at).toLocaleDateString('es-EC')}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
