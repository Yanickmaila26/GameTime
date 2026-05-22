import React, { useState, useEffect } from 'react';
import client from '../../api/client';
import { 
  Users, Plus, Trash2, Edit2, Loader2, Sparkles, X, ChevronRight, Shirt, ArrowLeft, Check
} from 'lucide-react';

export default function Teams() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [players, setPlayers] = useState([]);
  const [playersLoading, setPlayersLoading] = useState(false);

  // Forms
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [teamForm, setTeamForm] = useState({ name: '', gender: 'masculino', short_name: '', logo_color: 'from-orange-500 to-amber-600' });

  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [playerForm, setPlayerForm] = useState({ name: '', number: '', position: 'Base', gender: 'masculino', status: 'activo' });

  const [error, setError] = useState(null);
  const [playerError, setPlayerError] = useState(null);

  const logoColors = [
    { name: 'Naranja Fuego', value: 'from-orange-500 to-amber-600' },
    { name: 'Azul Eléctrico', value: 'from-blue-600 to-cyan-500' },
    { name: 'Rojo Carmín', value: 'from-rose-600 to-red-500' },
    { name: 'Verde Esmeralda', value: 'from-emerald-500 to-teal-500' },
    { name: 'Morado Real', value: 'from-purple-600 to-pink-500' },
    { name: 'Dorado Épico', value: 'from-yellow-500 to-amber-400' },
  ];

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const res = await client.get('/teams');
      setTeams(res.data);
    } catch (err) {
      console.error('Error fetching teams', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const handleOpenTeamModal = (team = null) => {
    if (team) {
      setEditingTeam(team);
      setTeamForm({ name: team.name, gender: team.gender, short_name: team.short_name, logo_color: team.logo_color });
    } else {
      setEditingTeam(null);
      setTeamForm({ name: '', gender: 'masculino', short_name: '', logo_color: 'from-orange-500 to-amber-600' });
    }
    setError(null);
    setShowTeamModal(true);
  };

  const handleSaveTeam = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      if (editingTeam) {
        await client.put(`/teams/${editingTeam.id}`, teamForm);
      } else {
        await client.post('/teams', teamForm);
      }
      setShowTeamModal(false);
      fetchTeams();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar equipo');
    }
  };

  const handleDeleteTeam = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este equipo?')) {
      try {
        await client.delete(`/teams/${id}`);
        if (selectedTeam?.id === id) setSelectedTeam(null);
        fetchTeams();
      } catch (err) {
        alert('Error al eliminar equipo');
      }
    }
  };

  // ----- PLAYERS -----
  const selectTeam = async (team) => {
    setSelectedTeam(team);
    setPlayersLoading(true);
    try {
      const res = await client.get(`/teams/${team.id}/players`);
      setPlayers(res.data);
    } catch (err) {
      console.error('Error fetching players', err);
    } finally {
      setPlayersLoading(false);
    }
  };

  const handleOpenPlayerModal = (player = null) => {
    if (player) {
      setEditingPlayer(player);
      setPlayerForm({ 
        name: player.name, 
        number: player.number, 
        position: player.position || 'Base', 
        gender: player.gender, 
        status: player.status 
      });
    } else {
      setEditingPlayer(null);
      // Auto-assign gender based on team gender restriction
      const defaultGender = selectedTeam.gender === 'femenino' ? 'femenino' : 'masculino';
      setPlayerForm({ 
        name: '', 
        number: '', 
        position: 'Base', 
        gender: defaultGender, 
        status: 'activo' 
      });
    }
    setPlayerError(null);
    setShowPlayerModal(true);
  };

  const handleSavePlayer = async (e) => {
    e.preventDefault();
    setPlayerError(null);

    // Gender Validation
    if (selectedTeam.gender === 'masculino' && playerForm.gender !== 'masculino') {
      setPlayerError('Este equipo solo acepta jugadores masculinos');
      return;
    }
    if (selectedTeam.gender === 'femenino' && playerForm.gender !== 'femenino') {
      setPlayerError('Este equipo solo acepta jugadoras femeninas');
      return;
    }

    try {
      if (editingPlayer) {
        await client.put(`/teams/${selectedTeam.id}/players/${editingPlayer.id}`, playerForm);
      } else {
        await client.post(`/teams/${selectedTeam.id}/players`, playerForm);
      }
      setShowPlayerModal(false);
      selectTeam(selectedTeam);
    } catch (err) {
      setPlayerError(err.response?.data?.message || 'Error al guardar jugador');
    }
  };

  const handleDeletePlayer = async (playerId) => {
    if (window.confirm('¿Está seguro de eliminar este jugador?')) {
      try {
        await client.delete(`/teams/${selectedTeam.id}/players/${playerId}`);
        selectTeam(selectedTeam);
      } catch (err) {
        alert('Error al eliminar jugador');
      }
    }
  };

  // Group teams
  const groupedTeams = {
    masculino: teams.filter(t => t.gender === 'masculino'),
    femenino: teams.filter(t => t.gender === 'femenino'),
    mixto: teams.filter(t => t.gender === 'mixto'),
  };

  return (
    <div className="space-y-6">
      {/* If a team is selected, show roster layout, else show teams catalog */}
      {selectedTeam ? (
        <div className="space-y-6">
          {/* Header to go back */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSelectedTeam(null)}
              className="p-3 bg-[#0d0d0d] hover:bg-[#121212] border border-[#1a1a1a] rounded-2xl text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-white flex items-center space-x-2">
                <span>Róster de {selectedTeam.name}</span>
                <span className={`w-3.5 h-3.5 rounded-full bg-gradient-to-tr ${selectedTeam.logo_color}`} />
              </h1>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">
                Categoría: {selectedTeam.gender} • {selectedTeam.short_name}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Team details and controls */}
            <div className="bg-[#0d0d0d] border border-[#1a1a1a] p-6 rounded-3xl space-y-5 h-fit">
              <div className="flex justify-center py-6 bg-gradient-to-br from-[#121212] to-[#080808] border border-[#1a1a1a] rounded-2xl">
                <div className={`w-28 h-28 rounded-full bg-gradient-to-tr ${selectedTeam.logo_color} flex items-center justify-center font-black text-3xl text-black border-4 border-[#070707] shadow-xl`}>
                  {selectedTeam.short_name}
                </div>
              </div>
              <div className="space-y-2">
                <span className="block text-[10px] text-gray-500 font-black uppercase tracking-wider">Estadísticas</span>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#121212] p-4 border border-[#1e1e1e] rounded-2xl text-center">
                    <p className="text-2xl font-black text-white">{players.length}</p>
                    <p className="text-[10px] text-gray-400 font-bold">Jugadores</p>
                  </div>
                  <div className="bg-[#121212] p-4 border border-[#1e1e1e] rounded-2xl text-center">
                    <p className="text-2xl font-black text-white">0</p>
                    <p className="text-[10px] text-gray-400 font-bold">Partidos Jugados</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Players List */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold text-gray-500 tracking-wider">Róster oficial del equipo</span>
                <button
                  onClick={() => handleOpenPlayerModal()}
                  className="inline-flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-600 text-black font-extrabold text-xs rounded-xl shadow-md transform hover:scale-105 active:scale-95 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Agregar Jugador</span>
                </button>
              </div>

              {playersLoading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-[#F57C00]" />
                </div>
              ) : players.length === 0 ? (
                <div className="text-center py-16 bg-[#0d0d0d] border border-[#1a1a1a] rounded-3xl text-gray-500 font-bold text-sm">
                  <Shirt className="w-12 h-12 mx-auto mb-3 text-gray-600 animate-pulse" />
                  <span>No hay jugadores inscritos en este equipo aún.</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {players.map((player) => (
                    <div
                      key={player.id}
                      className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-2xl p-4 flex items-center justify-between hover:border-orange-500/30 transition-all"
                    >
                      <div className="flex items-center space-x-3.5">
                        <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center font-black text-[#F57C00] text-sm font-mono">
                          #{player.number}
                        </div>
                        <div>
                          <p className="text-sm font-black text-white">{player.name}</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase">{player.position} • {player.gender}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleOpenPlayerModal(player)}
                          className="p-2 bg-[#121212] hover:bg-[#1c1c1c] border border-[#1e1e1e] rounded-xl text-gray-400 hover:text-white transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeletePlayer(player.id)}
                          className="p-2 bg-red-950/10 hover:bg-red-950/30 border border-red-500/20 rounded-xl text-red-400 hover:text-red-300 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-8 animate-fade-in">
          {/* Catalog Title */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl md:text-2xl font-black text-white">Catálogo de Equipos</h1>
              <p className="text-xs text-gray-500">Gestiona los equipos y jugadores participantes del torneo</p>
            </div>
            <button
              onClick={() => handleOpenTeamModal()}
              className="inline-flex items-center space-x-2 px-5 py-3 bg-gradient-to-r from-orange-500 to-amber-600 text-black font-extrabold text-xs rounded-xl shadow-md transform hover:scale-105 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Equipo</span>
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-[#F57C00]" />
            </div>
          ) : (
            <div className="space-y-8">
              {['masculino', 'femenino', 'mixto'].map((gender) => {
                const teamList = groupedTeams[gender];
                return (
                  <div key={gender} className="space-y-3">
                    <span className="text-xs uppercase font-bold text-[#F57C00] tracking-widest bg-orange-500/10 border border-orange-500/20 px-3 py-1 rounded-full w-fit block">
                      Género: {gender}
                    </span>

                    {teamList.length === 0 ? (
                      <div className="text-center py-8 bg-[#0d0d0d] border border-[#161616] rounded-2xl text-xs text-gray-500 font-bold">
                        No hay equipos en la categoría {gender}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {teamList.map((team) => (
                          <div
                            key={team.id}
                            className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-3xl p-5 hover:border-orange-500/40 transition-all flex flex-col justify-between group"
                          >
                            <div className="flex items-center justify-between mb-4">
                              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Sigla: {team.short_name}</span>
                              <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleOpenTeamModal(team); }}
                                  className="p-1.5 bg-[#121212] hover:bg-[#1a1a1a] border border-[#1e1e1e] rounded-lg text-gray-400 hover:text-white"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleDeleteTeam(team.id); }}
                                  className="p-1.5 bg-red-950/20 hover:bg-red-950/40 border border-red-500/20 rounded-lg text-red-400 hover:text-red-300"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>

                            <div className="flex items-center space-x-3.5 mb-6">
                              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${team.logo_color} flex items-center justify-center font-black text-black text-sm shadow-md`}>
                                {team.short_name}
                              </div>
                              <div>
                                <h3 className="text-sm font-black text-white group-hover:text-[#F57C00] transition-colors">{team.name}</h3>
                                <p className="text-[10px] text-gray-500 uppercase font-bold">Categoría {team.gender}</p>
                              </div>
                            </div>

                            <button
                              onClick={() => selectTeam(team)}
                              className="w-full py-3 bg-[#121212] hover:bg-[#161616] border border-[#1e1e1e] rounded-2xl text-[10px] font-bold text-gray-400 hover:text-white flex items-center justify-center space-x-1.5 transition-colors"
                            >
                              <span>Ver Jugadores</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TEAM CREATION / EDIT MODAL */}
      {showTeamModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-gradient-to-b from-[#121212] to-[#0a0a0a] border border-[#1e1e1e] p-6 rounded-3xl shadow-2xl relative">
            <button
              onClick={() => setShowTeamModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-black text-white mb-4">
              {editingTeam ? 'Editar Equipo' : 'Nuevo Equipo'}
            </h2>

            {error && (
              <div className="mb-4 p-3 bg-red-950/40 border border-red-500/20 rounded-xl text-xs text-red-400 font-bold">
                {error}
              </div>
            )}

            <form onSubmit={handleSaveTeam} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Nombre del Equipo</label>
                <input
                  type="text"
                  value={teamForm.name}
                  onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })}
                  placeholder="Ej. Halcones del Norte"
                  className="w-full bg-[#121212] border border-[#222] text-sm text-white px-4 py-3 rounded-xl focus:border-orange-500 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Siglas (Max 5)</label>
                  <input
                    type="text"
                    value={teamForm.short_name}
                    onChange={(e) => setTeamForm({ ...teamForm, short_name: e.target.value })}
                    placeholder="Ej. HALCO"
                    className="w-full bg-[#121212] border border-[#222] text-sm text-white px-4 py-3 rounded-xl focus:border-orange-500 outline-none uppercase"
                    maxLength={5}
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Género</label>
                  <select
                    value={teamForm.gender}
                    onChange={(e) => setTeamForm({ ...teamForm, gender: e.target.value })}
                    className="w-full bg-[#121212] border border-[#222] text-sm text-white px-4 py-3 rounded-xl focus:border-orange-500 outline-none"
                  >
                    <option value="masculino">Masculino</option>
                    <option value="femenino">Femenino</option>
                    <option value="mixto">Mixto</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Color de Logo</label>
                <div className="grid grid-cols-3 gap-2">
                  {logoColors.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setTeamForm({ ...teamForm, logo_color: color.value })}
                      className={`p-2.5 rounded-xl border text-[9px] font-bold flex items-center justify-between text-left ${
                        teamForm.logo_color === color.value
                          ? 'border-orange-500 text-white bg-orange-500/10'
                          : 'border-[#222] text-gray-400 bg-transparent'
                      }`}
                    >
                      <span>{color.name}</span>
                      <span className={`w-3 h-3 rounded bg-gradient-to-tr ${color.value}`} />
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-600 text-black font-extrabold text-sm rounded-xl transform active:scale-95 transition-all shadow-md mt-4"
              >
                {editingTeam ? 'Guardar Cambios' : 'Crear Equipo'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* PLAYER CREATION / EDIT MODAL */}
      {showPlayerModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-gradient-to-b from-[#121212] to-[#0a0a0a] border border-[#1e1e1e] p-6 rounded-3xl shadow-2xl relative">
            <button
              onClick={() => setShowPlayerModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-black text-white mb-4">
              {editingPlayer ? 'Editar Jugador' : 'Inscribir Jugador'}
            </h2>

            {playerError && (
              <div className="mb-4 p-3 bg-red-950/40 border border-red-500/20 rounded-xl text-xs text-red-400 font-bold">
                {playerError}
              </div>
            )}

            <form onSubmit={handleSavePlayer} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Nombre Completo</label>
                <input
                  type="text"
                  value={playerForm.name}
                  onChange={(e) => setPlayerForm({ ...playerForm, name: e.target.value })}
                  placeholder="Ej. Roberto Bolaños"
                  className="w-full bg-[#121212] border border-[#222] text-sm text-white px-4 py-3 rounded-xl focus:border-orange-500 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Número de Camiseta</label>
                  <input
                    type="number"
                    value={playerForm.number}
                    onChange={(e) => setPlayerForm({ ...playerForm, number: e.target.value })}
                    placeholder="Ej. 10"
                    className="w-full bg-[#121212] border border-[#222] text-sm text-white px-4 py-3 rounded-xl focus:border-orange-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Posición de Juego</label>
                  <select
                    value={playerForm.position}
                    onChange={(e) => setPlayerForm({ ...playerForm, position: e.target.value })}
                    className="w-full bg-[#121212] border border-[#222] text-sm text-white px-4 py-3 rounded-xl focus:border-orange-500 outline-none"
                  >
                    <option value="Base">Base (PG)</option>
                    <option value="Escolta">Escolta (SG)</option>
                    <option value="Alero">Alero (SF)</option>
                    <option value="Ala-Pívot">Ala-Pívot (PF)</option>
                    <option value="Pívot">Pívot (C)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Género del Jugador</label>
                  <select
                    value={playerForm.gender}
                    onChange={(e) => setPlayerForm({ ...playerForm, gender: e.target.value })}
                    disabled={selectedTeam.gender !== 'mixto'}
                    className="w-full bg-[#121212] border border-[#222] text-sm text-white px-4 py-3 rounded-xl focus:border-orange-500 outline-none disabled:opacity-55"
                  >
                    <option value="masculino">Masculino</option>
                    <option value="femenino">Femenino</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Estado</label>
                  <select
                    value={playerForm.status}
                    onChange={(e) => setPlayerForm({ ...playerForm, status: e.target.value })}
                    className="w-full bg-[#121212] border border-[#222] text-sm text-white px-4 py-3 rounded-xl focus:border-orange-500 outline-none"
                  >
                    <option value="activo">Activo</option>
                    <option value="lesionado">Lesionado</option>
                    <option value="suspendido">Suspendido</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-600 text-black font-extrabold text-sm rounded-xl transform active:scale-95 transition-all shadow-md mt-4"
              >
                {editingPlayer ? 'Guardar Cambios' : 'Registrar Jugador'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
