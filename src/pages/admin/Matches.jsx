import React, { useState, useEffect } from 'react';
import client from '../../api/client';
import { useNavigate } from 'react-router-dom';
import { 
  Swords, Settings, Play, CheckCircle, Loader2, X, Sparkles, MapPin, Calendar, Users
} from 'lucide-react';

export default function Matches() {
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  // Configure referee modal
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [referees, setReferees] = useState([]);
  const [configForm, setConfigForm] = useState({
    referee_id: '',
    ref1_id: '',
    ref2_id: '',
    court: 'Coliseo Principal',
    scheduled_at: ''
  });
  const [configError, setConfigError] = useState(null);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const res = await client.get('/matches');
      setMatches(res.data);
    } catch (err) {
      console.error('Error fetching matches', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReferees = async () => {
    try {
      const res = await client.get('/referees/active');
      setReferees(res.data);
    } catch (err) {
      console.error('Error fetching active referees', err);
    }
  };

  useEffect(() => {
    fetchMatches();
    fetchReferees();
  }, []);

  const handleOpenConfig = (match) => {
    setSelectedMatch(match);
    setConfigForm({
      referee_id: match.referee_id || '',
      ref1_id: match.ref1_id || '',
      ref2_id: match.ref2_id || '',
      court: match.court || 'Coliseo Principal',
      scheduled_at: match.scheduled_at ? match.scheduled_at.substring(0, 16) : ''
    });
    setConfigError(null);
    setShowConfigModal(true);
  };

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    setConfigError(null);

    // Validate different referees
    const { referee_id, ref1_id, ref2_id } = configForm;
    if (referee_id && (referee_id === ref1_id || referee_id === ref2_id)) {
      setConfigError('El árbitro principal no puede ser asistente simultáneamente');
      return;
    }
    if (ref1_id && ref1_id === ref2_id) {
      setConfigError('Los árbitros asistentes deben ser distintos');
      return;
    }

    try {
      await client.put(`/matches/${selectedMatch.id}/setup`, configForm);
      setShowConfigModal(false);
      fetchMatches();
    } catch (err) {
      setConfigError('Error al configurar partido');
    }
  };

  const handleStartMatch = async (matchId) => {
    try {
      await client.post(`/matches/${matchId}/start`);
      navigate(`/admin/matches/${matchId}/live`);
    } catch (err) {
      alert(err.response?.data?.message || 'Error al iniciar partido');
    }
  };

  return (
    <div className="space-y-6">
      {/* Title block */}
      <div>
        <h1 className="text-xl md:text-2xl font-black text-white flex items-center space-x-2">
          <Swords className="w-6 h-6 text-[#F57C00]" />
          <span>Control de Partidos</span>
        </h1>
        <p className="text-xs text-gray-500">Asigna árbitros, programa canchas e inicia el marcador digital en vivo</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-[#F57C00]" />
        </div>
      ) : matches.length === 0 ? (
        <div className="text-center py-16 bg-[#0d0d0d] border border-[#1a1a1a] rounded-3xl text-gray-500 font-bold">
          No hay partidos generados en el fixture. Primero crea un campeonato y realiza el sorteo.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {matches.map((match) => (
            <div
              key={match.id}
              className={`bg-[#0d0d0d] border rounded-3xl p-5 hover:border-orange-500/30 transition-all flex flex-col justify-between group ${
                match.status === 'live' ? 'border-red-500/40 shadow-[0_0_20px_rgba(239,68,68,0.05)]' : 'border-[#1a1a1a]'
              }`}
            >
              <div>
                {/* Header state */}
                <div className="flex items-center justify-between mb-4">
                  <span className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                    match.status === 'live' ? 'bg-red-500/10 border border-red-500/20 text-red-500 animate-pulse' :
                    match.status === 'finished' ? 'bg-gray-500/10 border border-gray-800 text-gray-500' :
                    'bg-blue-500/10 border border-blue-500/20 text-blue-400'
                  }`}>
                    {match.status === 'live' && <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />}
                    <span>{match.status === 'live' ? 'En Juego' : match.status === 'finished' ? 'Finalizado' : 'Programado'}</span>
                  </span>

                  <span className="text-[10px] text-gray-500 font-bold">
                    Jornada {match.round} • {match.championship_name}
                  </span>
                </div>

                {/* Match Score / Matchup */}
                <div className="bg-[#121212] border border-[#1e1e1e] rounded-2xl p-4 space-y-3 mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <span className={`w-6 h-6 rounded-lg bg-gradient-to-tr ${match.home_color} flex items-center justify-center font-black text-[10px] text-black`}>
                        {match.home_short}
                      </span>
                      <span className="text-xs font-black text-white">{match.home_team_name}</span>
                    </div>
                    {match.status !== 'scheduled' && (
                      <span className="text-sm font-black text-white">{match.home_score}</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <span className={`w-6 h-6 rounded-lg bg-gradient-to-tr ${match.away_color} flex items-center justify-center font-black text-[10px] text-black`}>
                        {match.away_short}
                      </span>
                      <span className="text-xs font-black text-white">{match.away_team_name}</span>
                    </div>
                    {match.status !== 'scheduled' && (
                      <span className="text-sm font-black text-white">{match.away_score}</span>
                    )}
                  </div>
                </div>

                {/* Referees & Setup Details */}
                <div className="space-y-2 text-[11px] text-gray-400 font-bold px-1 mb-6">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-3.5 h-3.5 text-gray-500" />
                    <span>Cancha: {match.court || 'Por definir'}</span>
                  </div>
                  {match.scheduled_at && (
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-3.5 h-3.5 text-gray-500" />
                      <span>{new Date(match.scheduled_at).toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <Users className="w-3.5 h-3.5 text-gray-500" />
                    <span>
                      Árbitros: {match.referee_name || 'Sin designar'}
                      {match.ref1_name && ` / Asistentes: ${match.ref1_name}`}
                      {match.ref2_name && `, ${match.ref2_name}`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-[#121212] flex gap-3">
                {match.status === 'scheduled' && (
                  <>
                    <button
                      onClick={() => handleOpenConfig(match)}
                      className="flex-1 py-3 bg-[#121212] hover:bg-[#1a1a1a] border border-[#1e1e1e] rounded-xl text-xs font-bold text-gray-400 hover:text-white flex items-center justify-center space-x-1.5 transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Configurar</span>
                    </button>
                    <button
                      onClick={() => handleStartMatch(match.id)}
                      className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-amber-600 text-black font-extrabold text-xs rounded-xl shadow-md transform hover:scale-105 active:scale-95 flex items-center justify-center space-x-1.5 transition-all"
                    >
                      <Play className="w-4 h-4 fill-black" />
                      <span>Iniciar Partido</span>
                    </button>
                  </>
                )}

                {match.status === 'live' && (
                  <button
                    onClick={() => navigate(`/admin/matches/${match.id}/live`)}
                    className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow-md transform hover:scale-105 active:scale-95 flex items-center justify-center space-x-1.5 transition-all animate-pulse"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>Controlar Marcador En Vivo</span>
                  </button>
                )}

                {match.status === 'finished' && (
                  <button
                    disabled
                    className="w-full py-3 bg-emerald-950/20 border border-emerald-500/20 text-emerald-400 font-extrabold text-xs rounded-xl flex items-center justify-center space-x-1.5"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Partido Finalizado</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CONFIGURE REFEREES MODAL */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-gradient-to-b from-[#121212] to-[#0a0a0a] border border-[#1e1e1e] p-6 rounded-3xl shadow-2xl relative">
            <button
              onClick={() => setShowConfigModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-black text-white mb-4">Configurar Partido</h2>

            {configError && (
              <div className="mb-4 p-3 bg-red-950/40 border border-red-500/20 rounded-xl text-xs text-red-400 font-bold">
                {configError}
              </div>
            )}

            <form onSubmit={handleSaveConfig} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Cancha</label>
                  <input
                    type="text"
                    value={configForm.court}
                    onChange={(e) => setConfigForm({ ...configForm, court: e.target.value })}
                    className="w-full bg-[#121212] border border-[#222] text-sm text-white px-4 py-3 rounded-xl focus:border-orange-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Fecha y Hora</label>
                  <input
                    type="datetime-local"
                    value={configForm.scheduled_at}
                    onChange={(e) => setConfigForm({ ...configForm, scheduled_at: e.target.value })}
                    className="w-full bg-[#121212] border border-[#222] text-sm text-[#888] px-4 py-3 rounded-xl focus:border-orange-500 outline-none font-sans"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Árbitro Principal (1)</label>
                <select
                  value={configForm.referee_id}
                  onChange={(e) => setConfigForm({ ...configForm, referee_id: e.target.value })}
                  className="w-full bg-[#121212] border border-[#222] text-sm text-white px-4 py-3 rounded-xl focus:border-orange-500 outline-none"
                >
                  <option value="">Seleccionar árbitro...</option>
                  {referees.map(r => (
                    <option key={r.id} value={r.id}>{r.name} ({r.certification})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Asistente 1</label>
                  <select
                    value={configForm.ref1_id}
                    onChange={(e) => setConfigForm({ ...configForm, ref1_id: e.target.value })}
                    className="w-full bg-[#121212] border border-[#222] text-sm text-white px-4 py-3 rounded-xl focus:border-orange-500 outline-none"
                  >
                    <option value="">Ninguno</option>
                    {referees.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Asistente 2</label>
                  <select
                    value={configForm.ref2_id}
                    onChange={(e) => setConfigForm({ ...configForm, ref2_id: e.target.value })}
                    className="w-full bg-[#121212] border border-[#222] text-sm text-white px-4 py-3 rounded-xl focus:border-orange-500 outline-none"
                  >
                    <option value="">Ninguno</option>
                    {referees.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-600 text-black font-extrabold text-sm rounded-xl transform active:scale-95 transition-all shadow-md mt-4"
              >
                Guardar Configuración
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
