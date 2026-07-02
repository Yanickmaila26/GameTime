import { useState, useEffect } from 'react'
import AdminLayout from '../../Components/AdminLayout'
import { BarChart3, Users, Sparkles, Check, Trash2, Search, Filter } from 'lucide-react'
import { confirmDelete, toastSuccess, toastError } from '../../lib/swal'

export default function Stats({ matches = [] }) {
  const [activeTab, setActiveTab] = useState('general') // 'general' | 'per_match'

  // Tab 1: General Cumulative Stats State
  const [generalPlayers, setGeneralPlayers] = useState([])
  const [teamsList, setTeamsList] = useState([])
  const [loadingGeneral, setLoadingGeneral] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTeamFilter, setSelectedTeamFilter] = useState('')
  const [savingGeneralId, setSavingGeneralId] = useState(null)

  // Tab 2: Per Match Stats State
  const [selectedMatchId, setSelectedMatchId] = useState('')
  const [selectedMatch, setSelectedMatch] = useState(null)
  const [matchStats, setMatchStats] = useState({ home: [], away: [] })
  const [allMatchPlayers, setAllMatchPlayers] = useState([])
  const [loadingMatchStats, setLoadingMatchStats] = useState(false)
  const [savingMatchStatId, setSavingMatchStatId] = useState(null)
  const [newMatchPlayer, setNewMatchPlayer] = useState({ team: 'home', player_id: '' })

  const csrf = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''

  // ─── Fetch General Cumulative Stats ─────────────────────────────────────────
  const fetchGeneralStats = () => {
    setLoadingGeneral(true)
    fetch('/admin/estadisticas-generales', {
      headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
    })
      .then(res => res.json())
      .then(data => {
        setGeneralPlayers(data.players || [])
        setTeamsList(data.teams || [])
      })
      .catch(() => toastError && toastError('Error al cargar estadísticas generales'))
      .finally(() => setLoadingGeneral(false))
  }

  // ─── Fetch Per-Match Stats ────────────────────────────────────────────────────
  const fetchMatchStats = (matchId) => {
    if (!matchId) return
    setLoadingMatchStats(true)
    fetch(`/admin/partidos/${matchId}/estadisticas`, {
      headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
    })
      .then(res => res.json())
      .then(data => {
        setMatchStats({ home: data.home || [], away: data.away || [] })
        setAllMatchPlayers(data.players || [])
      })
      .catch(() => toastError && toastError('Error al cargar las estadísticas'))
      .finally(() => setLoadingMatchStats(false))
  }

  useEffect(() => {
    fetchGeneralStats()
    if (matches.length > 0) {
      const defaultMatch = matches.find(m => m.status === 'finished') || matches.find(m => m.status === 'live') || matches[0]
      if (defaultMatch) {
        setSelectedMatchId(defaultMatch.id)
        setSelectedMatch(defaultMatch)
      }
    }
  }, [matches])

  useEffect(() => {
    if (selectedMatchId) {
      const found = matches.find(m => String(m.id) === String(selectedMatchId))
      setSelectedMatch(found || null)
      fetchMatchStats(selectedMatchId)
    }
  }, [selectedMatchId])

  // ─── General Stats Handlers ──────────────────────────────────────────────────
  const updateGeneralField = (index, field, value) => {
    setGeneralPlayers(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: Number(value) }
      return updated
    })
  }

  const handleSaveGeneral = (player) => {
    setSavingGeneralId(player.player_id)
    fetch('/admin/estadisticas-generales', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-CSRF-TOKEN': csrf, 'X-Requested-With': 'XMLHttpRequest' },
      body: JSON.stringify({
        player_id: player.player_id,
        total_points: player.total_points,
        total_triples: player.total_triples,
        total_baskets: player.total_baskets,
        total_fouls: player.total_fouls,
      }),
    })
      .then(res => { if (!res.ok) throw new Error(); return res.json() })
      .then(() => {
        toastSuccess && toastSuccess(`Estadísticas de ${player.name} guardadas`)
        fetchGeneralStats()
      })
      .catch(() => toastError && toastError('Error al guardar'))
      .finally(() => setSavingGeneralId(null))
  }

  // ─── Per Match Handlers ──────────────────────────────────────────────────────
  const handleSaveMatchStat = (stat) => {
    if (!selectedMatch) return
    setSavingMatchStatId(stat.player_id)
    fetch(`/admin/partidos/${selectedMatch.id}/estadisticas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-CSRF-TOKEN': csrf, 'X-Requested-With': 'XMLHttpRequest' },
      body: JSON.stringify({ player_id: stat.player_id, points: stat.points, fouls: stat.fouls, triples: stat.triples }),
    })
      .then(res => { if (!res.ok) throw new Error(); return res.json() })
      .then(() => { toastSuccess && toastSuccess('Estadística guardada'); fetchMatchStats(selectedMatch.id) })
      .catch(() => toastError && toastError('Error al guardar'))
      .finally(() => setSavingMatchStatId(null))
  }

  const handleDeleteMatchStat = (playerId) => {
    if (!selectedMatch) return
    confirmDelete('¿Eliminar estadística?', 'Se eliminará el registro del jugador.')
      .then(result => {
        if (result.isConfirmed) {
          fetch(`/admin/partidos/${selectedMatch.id}/estadisticas`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-CSRF-TOKEN': csrf, 'X-Requested-With': 'XMLHttpRequest' },
            body: JSON.stringify({ player_id: playerId }),
          })
            .then(res => { if (!res.ok) throw new Error(); return res.json() })
            .then(() => { toastSuccess && toastSuccess('Estadística eliminada'); fetchMatchStats(selectedMatch.id) })
            .catch(() => toastError && toastError('Error al eliminar'))
        }
      })
  }

  const handleAddMatchPlayer = () => {
    if (!selectedMatch || !newMatchPlayer.player_id) return
    setSavingMatchStatId('adding')
    fetch(`/admin/partidos/${selectedMatch.id}/estadisticas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-CSRF-TOKEN': csrf, 'X-Requested-With': 'XMLHttpRequest' },
      body: JSON.stringify({ player_id: newMatchPlayer.player_id, points: 0, fouls: 0, triples: 0 }),
    })
      .then(res => { if (!res.ok) throw new Error(); return res.json() })
      .then(() => { toastSuccess && toastSuccess('Jugador agregado'); setNewMatchPlayer({ team: 'home', player_id: '' }); fetchMatchStats(selectedMatch.id) })
      .catch(() => toastError && toastError('Error al agregar'))
      .finally(() => setSavingMatchStatId(null))
  }

  const updateMatchStatField = (side, index, field, value) => {
    setMatchStats(prev => {
      const updated = { ...prev }
      updated[side] = [...updated[side]]
      updated[side][index] = { ...updated[side][index], [field]: Number(value) }
      return updated
    })
  }

  const inputClass = "w-20 bg-[#121212] border border-[#222] text-white text-xs text-center px-2 py-1.5 rounded-xl outline-none focus:border-orange-500 font-bold"

  const filteredGeneralPlayers = generalPlayers.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          String(p.number).includes(searchQuery) ||
                          p.team_name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTeam = !selectedTeamFilter || String(p.team_id) === String(selectedTeamFilter)
    return matchesSearch && matchesTeam
  })

  const homePlayers = allMatchPlayers.filter(p => selectedMatch && p.team_id === selectedMatch.home_team_id)
  const awayPlayers = allMatchPlayers.filter(p => selectedMatch && p.team_id === selectedMatch.away_team_id)
  const availableMatchPlayers = newMatchPlayer.team === 'home' ? homePlayers : awayPlayers
  const existingMatchPlayerIds = [...matchStats.home, ...matchStats.away].map(s => s.player_id)
  const filteredMatchPlayers = availableMatchPlayers.filter(p => !existingMatchPlayerIds.includes(p.id))

  return (
    <AdminLayout title="Estadísticas">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1a1a1a] pb-5">
          <div>
            <span className="inline-flex items-center bg-orange-500/10 border border-orange-500/20 text-[10px] font-black text-orange-500 px-3 py-1 rounded-full uppercase tracking-wider">
              <Sparkles className="w-3 h-3 mr-1" /> Panel de Estadísticas
            </span>
            <h1 className="text-xl font-black text-white mt-1">Gestión de Estadísticas Individuales</h1>
            <p className="text-xs text-gray-500 mt-0.5">Edita puntos, triples, aros y faltas acumulados de todos los jugadores.</p>
          </div>

          <div className="flex bg-[#0d0d0d] border border-[#222] p-1 rounded-2xl">
            <button
              onClick={() => setActiveTab('general')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center space-x-2 ${
                activeTab === 'general'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-black shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Estadísticas Acumuladas (Liga)</span>
            </button>
            <button
              onClick={() => setActiveTab('per_match')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center space-x-2 ${
                activeTab === 'per_match'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-black shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Por Partido</span>
            </button>
          </div>
        </div>

        {/* TAB 1: GENERAL ACUMULADAS */}
        {activeTab === 'general' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-[#0d0d0d] border border-[#1a1a1a] p-4 rounded-3xl">
              <div className="relative md:col-span-2">
                <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Buscar jugador por nombre, número o equipo..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-[#121212] border border-[#222] text-white text-xs pl-10 pr-4 py-2.5 rounded-2xl outline-none focus:border-orange-500"
                />
              </div>
              <div className="relative">
                <Filter className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
                <select
                  value={selectedTeamFilter}
                  onChange={e => setSelectedTeamFilter(e.target.value)}
                  className="w-full bg-[#121212] border border-[#222] text-white text-xs pl-10 pr-4 py-2.5 rounded-2xl outline-none focus:border-orange-500 font-bold"
                >
                  <option value="">Todos los Equipos</option>
                  {teamsList.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {loadingGeneral ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
              </div>
            ) : (
              <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-3xl p-5 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#222] text-gray-500">
                      <th className="pb-3 pr-4 text-[10px] uppercase font-bold">Jugador</th>
                      <th className="pb-3 px-3 text-[10px] uppercase font-bold">Equipo</th>
                      <th className="pb-3 px-2 text-center text-[10px] uppercase font-bold">Puntos Totales</th>
                      <th className="pb-3 px-2 text-center text-[10px] uppercase font-bold">Triples Totales</th>
                      <th className="pb-3 px-2 text-center text-[10px] uppercase font-bold">Aros (Score2)</th>
                      <th className="pb-3 px-2 text-center text-[10px] uppercase font-bold">Faltas Totales</th>
                      <th className="pb-3 pl-2 text-center text-[10px] uppercase font-bold">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#111]">
                    {filteredGeneralPlayers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-8 text-gray-500 text-xs italic">
                          No se encontraron jugadores.
                        </td>
                      </tr>
                    ) : (
                      filteredGeneralPlayers.map((player, idx) => {
                        const globalIndex = generalPlayers.findIndex(p => p.player_id === player.player_id)
                        return (
                          <tr key={player.player_id} className="hover:bg-[#121212]/50 transition-colors">
                            <td className="py-3 pr-4">
                              <span className="font-extrabold text-white text-xs">{player.name}</span>
                              <span className="text-gray-500 text-[10px] ml-2 font-bold">#{player.number}</span>
                              <span className="text-[9px] bg-[#1a1a1a] border border-[#333] px-1.5 py-0.5 rounded text-gray-400 font-bold ml-2 uppercase">
                                {player.position}
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              <span className="text-gray-300 font-bold text-xs">{player.team_name}</span>
                            </td>
                            <td className="py-3 px-2 text-center">
                              <input
                                type="number"
                                min={0}
                                value={player.total_points}
                                onChange={e => updateGeneralField(globalIndex, 'total_points', e.target.value)}
                                className={inputClass}
                              />
                            </td>
                            <td className="py-3 px-2 text-center">
                              <input
                                type="number"
                                min={0}
                                value={player.total_triples}
                                onChange={e => updateGeneralField(globalIndex, 'total_triples', e.target.value)}
                                className={inputClass}
                              />
                            </td>
                            <td className="py-3 px-2 text-center">
                              <input
                                type="number"
                                min={0}
                                value={player.total_baskets}
                                onChange={e => updateGeneralField(globalIndex, 'total_baskets', e.target.value)}
                                className={inputClass}
                              />
                            </td>
                            <td className="py-3 px-2 text-center">
                              <input
                                type="number"
                                min={0}
                                value={player.total_fouls}
                                onChange={e => updateGeneralField(globalIndex, 'total_fouls', e.target.value)}
                                className={inputClass}
                              />
                            </td>
                            <td className="py-3 pl-2 text-center">
                              <button
                                onClick={() => handleSaveGeneral(player)}
                                disabled={savingGeneralId === player.player_id}
                                className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold rounded-xl hover:bg-emerald-500/20 disabled:opacity-50 transition-all flex items-center space-x-1 mx-auto"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>{savingGeneralId === player.player_id ? '...' : 'Guardar'}</span>
                              </button>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: POR PARTIDO */}
        {activeTab === 'per_match' && (
          <div className="space-y-6">
            <div className="bg-[#0d0d0d] border border-[#1a1a1a] p-4 rounded-3xl flex items-center justify-between">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Seleccionar Partido:</span>
              <select
                value={selectedMatchId}
                onChange={e => setSelectedMatchId(e.target.value)}
                className="w-full md:w-96 bg-[#121212] border border-[#222] text-white text-xs px-4 py-2.5 rounded-2xl outline-none focus:border-orange-500 font-bold"
              >
                <option value="">Selecciona un partido...</option>
                {matches.map(m => (
                  <option key={m.id} value={m.id}>
                    [{m.status === 'finished' ? 'Finalizado' : m.status === 'live' ? 'En Vivo' : 'Programado'}] {m.home_team?.name} vs {m.away_team?.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedMatch ? (
              loadingMatchStats ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Home team */}
                    <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-3xl p-5 space-y-4">
                      <h3 className="text-xs font-black text-orange-500 uppercase tracking-wider">{selectedMatch.home_team?.name || 'Local'}</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-[#222] text-gray-500">
                              <th className="pb-2 text-[10px] uppercase font-bold">Jugador</th>
                              <th className="pb-2 text-center text-[10px] uppercase font-bold">Pts</th>
                              <th className="pb-2 text-center text-[10px] uppercase font-bold">Faltas</th>
                              <th className="pb-2 text-center text-[10px] uppercase font-bold">Triples</th>
                              <th className="pb-2 text-center text-[10px] uppercase font-bold">Acción</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#111]">
                            {matchStats.home.map((stat, i) => (
                              <tr key={stat.player_id}>
                                <td className="py-2.5">
                                  <span className="font-extrabold text-white text-xs">{stat.player_name}</span>
                                  <span className="text-gray-500 text-[10px] ml-1">#{stat.player_number}</span>
                                </td>
                                <td className="py-2.5 text-center">
                                  <input type="number" min={0} value={stat.points} onChange={e => updateMatchStatField('home', i, 'points', e.target.value)} className={inputClass} />
                                </td>
                                <td className="py-2.5 text-center">
                                  <input type="number" min={0} value={stat.fouls} onChange={e => updateMatchStatField('home', i, 'fouls', e.target.value)} className={inputClass} />
                                </td>
                                <td className="py-2.5 text-center">
                                  <input type="number" min={0} value={stat.triples} onChange={e => updateMatchStatField('home', i, 'triples', e.target.value)} className={inputClass} />
                                </td>
                                <td className="py-2.5 text-center">
                                  <div className="flex items-center justify-center space-x-1">
                                    <button onClick={() => handleSaveMatchStat(stat)} disabled={savingMatchStatId === stat.player_id} className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold rounded-lg hover:bg-emerald-500/20">
                                      {savingMatchStatId === stat.player_id ? '...' : '✓'}
                                    </button>
                                    <button onClick={() => handleDeleteMatchStat(stat.player_id)} className="px-2 py-1 bg-red-500/10 text-red-400 text-[10px] font-bold rounded-lg hover:bg-red-500/20">
                                      ✕
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Away team */}
                    <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-3xl p-5 space-y-4">
                      <h3 className="text-xs font-black text-orange-500 uppercase tracking-wider">{selectedMatch.away_team?.name || 'Visitante'}</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-[#222] text-gray-500">
                              <th className="pb-2 text-[10px] uppercase font-bold">Jugador</th>
                              <th className="pb-2 text-center text-[10px] uppercase font-bold">Pts</th>
                              <th className="pb-2 text-center text-[10px] uppercase font-bold">Faltas</th>
                              <th className="pb-2 text-center text-[10px] uppercase font-bold">Triples</th>
                              <th className="pb-2 text-center text-[10px] uppercase font-bold">Acción</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#111]">
                            {matchStats.away.map((stat, i) => (
                              <tr key={stat.player_id}>
                                <td className="py-2.5">
                                  <span className="font-extrabold text-white text-xs">{stat.player_name}</span>
                                  <span className="text-gray-500 text-[10px] ml-1">#{stat.player_number}</span>
                                </td>
                                <td className="py-2.5 text-center">
                                  <input type="number" min={0} value={stat.points} onChange={e => updateMatchStatField('away', i, 'points', e.target.value)} className={inputClass} />
                                </td>
                                <td className="py-2.5 text-center">
                                  <input type="number" min={0} value={stat.fouls} onChange={e => updateMatchStatField('away', i, 'fouls', e.target.value)} className={inputClass} />
                                </td>
                                <td className="py-2.5 text-center">
                                  <input type="number" min={0} value={stat.triples} onChange={e => updateMatchStatField('away', i, 'triples', e.target.value)} className={inputClass} />
                                </td>
                                <td className="py-2.5 text-center">
                                  <div className="flex items-center justify-center space-x-1">
                                    <button onClick={() => handleSaveMatchStat(stat)} disabled={savingMatchStatId === stat.player_id} className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold rounded-lg hover:bg-emerald-500/20">
                                      {savingMatchStatId === stat.player_id ? '...' : '✓'}
                                    </button>
                                    <button onClick={() => handleDeleteMatchStat(stat.player_id)} className="px-2 py-1 bg-red-500/10 text-red-400 text-[10px] font-bold rounded-lg hover:bg-red-500/20">
                                      ✕
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* Formulario Agregar Jugador */}
                  <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-3xl p-5 space-y-4">
                    <h3 className="text-xs font-black text-orange-500 uppercase tracking-wider">➕ Agregar Jugador a la Planilla del Partido</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Equipo</label>
                        <select
                          value={newMatchPlayer.team}
                          onChange={e => setNewMatchPlayer({ team: e.target.value, player_id: '' })}
                          className="w-full bg-[#121212] border border-[#222] text-white text-xs px-4 py-2.5 rounded-2xl outline-none"
                        >
                          <option value="home">{selectedMatch.home_team?.name || 'Local'}</option>
                          <option value="away">{selectedMatch.away_team?.name || 'Visitante'}</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Jugador</label>
                        <select
                          value={newMatchPlayer.player_id}
                          onChange={e => setNewMatchPlayer(prev => ({ ...prev, player_id: e.target.value }))}
                          className="w-full bg-[#121212] border border-[#222] text-white text-xs px-4 py-2.5 rounded-2xl outline-none"
                        >
                          <option value="">Seleccionar jugador...</option>
                          {filteredMatchPlayers.map(p => (
                            <option key={p.id} value={p.id}>#{p.number} - {p.name}</option>
                          ))}
                        </select>
                      </div>
                      <button
                        onClick={handleAddMatchPlayer}
                        disabled={!newMatchPlayer.player_id || savingMatchStatId === 'adding'}
                        className="py-2.5 bg-gradient-to-r from-orange-500 to-amber-600 text-black text-xs font-bold rounded-2xl disabled:opacity-50"
                      >
                        {savingMatchStatId === 'adding' ? 'Agregando...' : 'Agregar Jugador'}
                      </button>
                    </div>
                  </div>
                </div>
              )
            ) : (
              <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-3xl p-12 text-center text-gray-500 text-xs font-bold">
                Selecciona un partido arriba para gestionar sus estadísticas.
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
