import React, { useState, useEffect } from 'react';
import client from '../../api/client';
import { 
  Trophy, Plus, Trash2, Loader2, X, Sparkles, ArrowLeft, Users, Calendar, Award, CheckCircle2, ChevronRight, Shuffle
} from 'lucide-react';

export default function Championships() {
  const [championships, setChampionships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChamp, setSelectedChamp] = useState(null);
  const [champDetails, setChampDetails] = useState(null);
  const [champLoading, setChampLoading] = useState(false);

  // Catalogs
  const [availableTeams, setAvailableTeams] = useState([]);

  // Forms
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [form, setForm] = useState({ name: '', gender: 'masculino', total_teams: 4 });
  const [error, setError] = useState(null);

  // Micro-animation for random draw
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawMsg, setDrawMsg] = useState('');

  const fetchChampionships = async () => {
    try {
      setLoading(true);
      const res = await client.get('/championships');
      setChampionships(res.data);
    } catch (err) {
      console.error('Error fetching championships', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChampionships();
  }, []);

  const selectChampionship = async (champ) => {
    setSelectedChamp(champ);
    setChampLoading(true);
    try {
      const res = await client.get(`/championships/${champ.id}`);
      setChampDetails(res.data);
      
      // If draft, fetch available teams of this gender to add
      if (res.data.status === 'draft') {
        const teamsRes = await client.get(`/teams?gender=${res.data.gender}`);
        // Filter out teams already in championship
        const addedIds = res.data.teams.map(t => t.team_id);
        const filtered = teamsRes.data.filter(t => !addedIds.includes(t.id));
        setAvailableTeams(filtered);
      }
    } catch (err) {
      console.error('Error loading championship detail', err);
    } finally {
      setChampLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await client.post('/championships', form);
      setShowCreateModal(false);
      fetchChampionships();
      selectChampionship(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al crear campeonato');
    }
  };

  const handleAddTeam = async (teamId) => {
    try {
      await client.post(`/championships/${selectedChamp.id}/teams`, { team_id: teamId });
      selectChampionship(selectedChamp);
    } catch (err) {
      alert(err.response?.data?.message || 'Error al agregar equipo');
    }
  };

  const handleRemoveTeam = async (teamId) => {
    try {
      await client.delete(`/championships/${selectedChamp.id}/teams/${teamId}`);
      selectChampionship(selectedChamp);
    } catch (err) {
      alert('Error al eliminar equipo');
    }
  };

  const handleTriggerDraw = async () => {
    if (champDetails.teams.length < 2) {
      alert('Se necesitan al menos 2 equipos para realizar el sorteo');
      return;
    }
    setIsDrawing(true);
    setDrawMsg('Iniciando sorteo oficial...');
    
    // Simulate interactive micro-animations for premium factor
    setTimeout(() => {
      setDrawMsg('Revolviendo bombos de equipos...');
      setTimeout(() => {
        setDrawMsg('Asignando cabezas de serie aleatorios...');
        setTimeout(async () => {
          try {
            await client.post(`/championships/${selectedChamp.id}/draw`);
            setIsDrawing(false);
            selectChampionship(selectedChamp);
          } catch (err) {
            alert('Error durante el sorteo');
            setIsDrawing(false);
          }
        }, 1500);
      }, 1200);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Detail view of a championship */}
      {selectedChamp && champDetails ? (
        <div className="space-y-6 animate-fade-in">
          {/* Header block */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => { setSelectedChamp(null); setChampDetails(null); fetchChampionships(); }}
                className="p-3 bg-[#0d0d0d] hover:bg-[#121212] border border-[#1a1a1a] rounded-2xl text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h1 className="text-xl md:text-2xl font-black text-white flex items-center space-x-2">
                  <span>{champDetails.name}</span>
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                    champDetails.status === 'draft' ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400' :
                    champDetails.status === 'active' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' :
                    'bg-gray-500/10 border border-gray-500/20 text-gray-400'
                  }`}>
                    {champDetails.status === 'draft' ? 'Fase de Inscripción' :
                     champDetails.status === 'active' ? 'En Juego' : 'Finalizado'}
                  </span>
                </h1>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">
                  Categoría {champDetails.gender} • Límite de {champDetails.total_teams} Equipos
                </p>
              </div>
            </div>

            {/* Actions header depending on status */}
            {champDetails.status === 'draft' && (
              <button
                onClick={handleTriggerDraw}
                disabled={isDrawing || champDetails.teams.length < 2}
                className="inline-flex items-center space-x-2 px-5 py-3 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-black font-extrabold text-xs rounded-xl shadow-md transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:transform-none transition-all"
              >
                {isDrawing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Shuffle className="w-4 h-4" />
                )}
                <span>Realizar Sorteo Oficial</span>
              </button>
            )}
          </div>

          {/* Sorteo interactive loader overlay */}
          {isDrawing && (
            <div className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center space-y-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full border-4 border-orange-500/20 border-t-orange-500 animate-spin" />
                <Trophy className="w-10 h-10 text-orange-500 absolute top-7 left-7 animate-pulse" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-lg font-black text-white tracking-tight">Sorteo del Fixture en Proceso</h3>
                <p className="text-sm text-gray-400 font-medium animate-pulse">{drawMsg}</p>
              </div>
            </div>
          )}

          {champLoading ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-[#F57C00]" />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* DRAFT STATE: Manage subscription and teams list */}
              {champDetails.status === 'draft' ? (
                <>
                  {/* Subscribed Teams list */}
                  <div className="bg-[#0d0d0d] border border-[#1a1a1a] p-6 rounded-3xl space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase font-bold text-gray-500 tracking-wider">Inscriptos ({champDetails.teams.length}/{champDetails.total_teams})</span>
                    </div>

                    {champDetails.teams.length === 0 ? (
                      <div className="text-center py-8 text-xs text-gray-500 font-bold bg-[#121212] border border-[#1e1e1e] rounded-2xl">
                        Ningún equipo inscripto todavía
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {champDetails.teams.map((t) => (
                          <div
                            key={t.team_id}
                            className="bg-[#121212] border border-[#1e1e1e] rounded-2xl p-4 flex items-center justify-between"
                          >
                            <div className="flex items-center space-x-3">
                              <span className={`w-8 h-8 rounded-lg bg-gradient-to-tr ${t.logo_color} flex items-center justify-center font-black text-black text-xs`}>
                                {t.short_name}
                              </span>
                              <div>
                                <p className="text-xs font-black text-white">{t.name}</p>
                                <p className="text-[9px] text-[#F57C00] font-bold uppercase tracking-wider">{t.gender}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleRemoveTeam(t.team_id)}
                              className="p-2 bg-red-950/20 hover:bg-red-950/40 rounded-xl text-red-400 hover:text-red-300 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Add Teams Catalogue */}
                  <div className="lg:col-span-2 bg-[#0d0d0d] border border-[#1a1a1a] p-6 rounded-3xl space-y-4">
                    <span className="text-xs uppercase font-bold text-gray-500 tracking-wider block">Equipos Disponibles ({champDetails.gender})</span>

                    {champDetails.teams.length >= champDetails.total_teams ? (
                      <div className="text-center py-10 bg-emerald-950/10 border border-emerald-500/20 text-emerald-400 rounded-2xl text-xs font-bold flex flex-col items-center space-y-2">
                        <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                        <span>¡Cupos de Equipos Completados! Listo para sortear el fixture.</span>
                      </div>
                    ) : availableTeams.length === 0 ? (
                      <div className="text-center py-8 text-xs text-gray-500 font-bold">
                        No hay más equipos registrados de esta categoría en el sistema.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {availableTeams.map((team) => (
                          <div
                            key={team.id}
                            className="bg-[#121212] border border-[#1e1e1e] rounded-2xl p-4 flex items-center justify-between hover:border-orange-500/30 transition-all"
                          >
                            <div className="flex items-center space-x-3">
                              <span className={`w-8 h-8 rounded-lg bg-gradient-to-tr ${team.logo_color} flex items-center justify-center font-black text-black text-xs`}>
                                {team.short_name}
                              </span>
                              <div>
                                <p className="text-xs font-black text-white">{team.name}</p>
                                <p className="text-[9px] text-gray-500 uppercase font-mono">{team.short_name}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleAddTeam(team.id)}
                              className="px-3.5 py-2 bg-orange-500/10 hover:bg-[#F57C00] border border-orange-500/20 text-[#F57C00] hover:text-black font-extrabold text-[10px] rounded-xl transition-all"
                            >
                              Inscribir
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  {/* ACTIVE / FINISHED STATE: Standings table */}
                  <div className="bg-[#0d0d0d] border border-[#1a1a1a] p-6 rounded-3xl space-y-4 h-fit">
                    <span className="text-xs uppercase font-bold text-gray-500 tracking-wider block">Tabla de Clasificación</span>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left text-gray-400">
                        <thead className="text-[10px] text-gray-500 uppercase font-black border-b border-[#1a1a1a]">
                          <tr>
                            <th className="py-2.5">Equipo</th>
                            <th className="py-2.5 text-center">PJ</th>
                            <th className="py-2.5 text-center">PTS</th>
                            <th className="py-2.5 text-center">DIF</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#121212]">
                          {champDetails.teams.map((t, idx) => (
                            <tr key={t.id} className="hover:bg-[#121212]/50 transition-colors">
                              <td className="py-3 flex items-center space-x-2 font-bold text-white">
                                <span className="text-[10px] font-mono text-gray-500">{idx + 1}</span>
                                <span className={`w-2 h-2 rounded bg-gradient-to-tr ${t.logo_color}`} />
                                <span className="truncate max-w-[120px]">{t.name}</span>
                              </td>
                              <td className="py-3 text-center font-bold">{t.pj}</td>
                              <td className="py-3 text-center font-extrabold text-[#F57C00]">{t.pts}</td>
                              <td className="py-3 text-center font-mono font-bold">{t.dif > 0 ? `+${t.dif}` : t.dif}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* ROUND ROBIN FIXTURE BRACKET */}
                  <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase font-bold text-gray-500 tracking-wider">Fixture del Campeonato (Rondas Round Robin)</span>
                    </div>

                    {champDetails.matches.length === 0 ? (
                      <div className="text-center py-10 bg-[#0d0d0d] border border-[#1a1a1a] rounded-3xl text-gray-500 font-bold text-sm">
                        No hay fixture generado aún.
                      </div>
                    ) : (
                      <div className="space-y-8">
                        {/* Group matches by Round (Jornada) */}
                        {Array.from(new Set(champDetails.matches.map(m => m.round))).map(roundNum => {
                          const roundMatches = champDetails.matches.filter(m => m.round === roundNum);
                          return (
                            <div key={roundNum} className="space-y-3">
                              <span className="text-xs font-black text-gray-400 bg-[#121212] border border-[#1e1e1e] px-4 py-2 rounded-2xl w-fit block shadow-sm">
                                Jornada {roundNum}
                              </span>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {roundMatches.map((m) => (
                                  <div
                                    key={m.id}
                                    className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-2xl p-4 flex flex-col justify-between hover:border-orange-500/20 transition-all"
                                  >
                                    <div className="flex items-center justify-between mb-3 text-[9px] font-mono text-gray-500">
                                      <span className={`uppercase font-black px-1.5 py-0.2 rounded border ${
                                        m.status === 'live' ? 'text-red-500 border-red-500/30 bg-red-950/15 animate-pulse' :
                                        m.status === 'finished' ? 'text-gray-500 border-gray-800' :
                                        'text-blue-400 border-blue-500/25 bg-blue-950/10'
                                      }`}>
                                        {m.status === 'live' ? 'En Vivo' : m.status === 'finished' ? 'Finalizado' : 'Programado'}
                                      </span>
                                      <span>Jornada {m.round}</span>
                                    </div>

                                    {/* Match teams & score */}
                                    <div className="space-y-2 py-1">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                          <span className={`w-5 h-5 rounded-md bg-gradient-to-tr ${m.home_color} flex items-center justify-center font-black text-[9px] text-black`}>
                                            {m.home_short}
                                          </span>
                                          <span className="text-xs font-bold text-white truncate max-w-[100px]">{m.home_team_name}</span>
                                        </div>
                                        {m.status !== 'scheduled' && (
                                          <span className="text-xs font-black text-white">{m.home_score}</span>
                                        )}
                                      </div>

                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                          <span className={`w-5 h-5 rounded-md bg-gradient-to-tr ${m.away_color} flex items-center justify-center font-black text-[9px] text-black`}>
                                            {m.away_short}
                                          </span>
                                          <span className="text-xs font-bold text-white truncate max-w-[100px]">{m.away_team_name}</span>
                                        </div>
                                        {m.status !== 'scheduled' && (
                                          <span className="text-xs font-black text-white">{m.away_score}</span>
                                        )}
                                      </div>
                                    </div>

                                    {/* Match Referee / Court Info */}
                                    <div className="mt-3 pt-2.5 border-t border-[#121212] flex justify-between items-center text-[9px] text-gray-500 font-bold uppercase">
                                      <span>{m.referee_name || 'Sin Árbitro Asignado'}</span>
                                      <span>{m.court || 'Cancha'}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6 animate-fade-in">
          {/* Main Titles Catalog */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl md:text-2xl font-black text-white flex items-center space-x-2">
                <Trophy className="w-6 h-6 text-[#F57C00]" />
                <span>Gestión de Campeonatos</span>
              </h1>
              <p className="text-xs text-gray-500">Crea torneos oficiales, inscribe equipos por género y realiza el sorteo</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center space-x-2 px-5 py-3 bg-gradient-to-r from-orange-500 to-amber-600 text-black font-extrabold text-xs rounded-xl shadow-md transform hover:scale-105 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Crear Campeonato</span>
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-[#F57C00]" />
            </div>
          ) : championships.length === 0 ? (
            <div className="text-center py-16 bg-[#0d0d0d] border border-[#1a1a1a] rounded-3xl text-gray-500 font-bold">
              No hay campeonatos creados todavía. ¡Crea el primero!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {championships.map((champ) => (
                <div
                  key={champ.id}
                  onClick={() => selectChampionship(champ)}
                  className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-3xl p-5 hover:border-orange-500/40 transition-all flex flex-col justify-between group cursor-pointer"
                >
                  <div className="flex justify-between items-center mb-4">
                    <span className="inline-flex items-center space-x-1 bg-orange-500/10 border border-orange-500/20 text-[9px] font-black text-[#F57C00] px-2 py-0.5 rounded-full uppercase">
                      • {champ.gender}
                    </span>
                    <span className={`text-[9px] font-bold uppercase ${
                      champ.status === 'draft' ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      {champ.status === 'draft' ? 'Borrador' : 'Activo'}
                    </span>
                  </div>

                  <h3 className="text-sm font-black text-white group-hover:text-[#F57C00] transition-colors mb-6">
                    {champ.name}
                  </h3>

                  <div className="space-y-3 pt-3 border-t border-[#121212]">
                    <div className="flex items-center justify-between text-xs text-gray-400 font-bold">
                      <span className="flex items-center space-x-1">
                        <Users className="w-3.5 h-3.5 text-gray-500" />
                        <span>Equipos Inscriptos</span>
                      </span>
                      <span className="text-white">{champ.teams_count} / {champ.total_teams}</span>
                    </div>

                    <div className="w-full bg-[#121212] h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-orange-500 to-amber-600 h-full rounded-full"
                        style={{ width: `${Math.min(100, (champ.teams_count / champ.total_teams) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CREATE TOURNAMENT MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-gradient-to-b from-[#121212] to-[#0a0a0a] border border-[#1e1e1e] p-6 rounded-3xl shadow-2xl relative">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-black text-white mb-4">Nuevo Campeonato</h2>

            {error && (
              <div className="mb-4 p-3 bg-red-950/40 border border-red-500/20 rounded-xl text-xs text-red-400 font-bold">
                {error}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Nombre del Campeonato</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ej. Torneo de Invierno Pifo 2026"
                  className="w-full bg-[#121212] border border-[#222] text-sm text-white px-4 py-3 rounded-xl focus:border-orange-500 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Género</label>
                  <select
                    value={form.gender}
                    onChange={(e) => setForm({ ...form, gender: e.target.value })}
                    className="w-full bg-[#121212] border border-[#222] text-sm text-white px-4 py-3 rounded-xl focus:border-orange-500 outline-none"
                  >
                    <option value="masculino">Masculino</option>
                    <option value="femenino">Femenino</option>
                    <option value="mixto">Mixto</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Nro. Equipos</label>
                  <select
                    value={form.total_teams}
                    onChange={(e) => setForm({ ...form, total_teams: parseInt(e.target.value) })}
                    className="w-full bg-[#121212] border border-[#222] text-sm text-white px-4 py-3 rounded-xl focus:border-orange-500 outline-none"
                  >
                    <option value={4}>4 Equipos</option>
                    <option value={6}>6 Equipos</option>
                    <option value={8}>8 Equipos</option>
                    <option value={10}>10 Equipos</option>
                    <option value={12}>12 Equipos</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-600 text-black font-extrabold text-sm rounded-xl transform active:scale-95 transition-all shadow-md mt-4"
              >
                Crear e Ir a Configuración
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
