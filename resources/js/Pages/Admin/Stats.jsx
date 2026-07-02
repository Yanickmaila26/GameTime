import { useState, useEffect } from 'react'
import AdminLayout from '../../Components/AdminLayout'
import { BarChart3, Users, Sparkles, Check, Trash2 } from 'lucide-react'
import { confirmDelete, toastSuccess, toastError } from '../../lib/swal'

export default function Stats({ matches = [] }) {
  const [selectedMatchId, setSelectedMatchId] = useState('')
  const [selectedMatch, setSelectedMatch] = useState(null)
  const [stats, setStats] = useState({ home: [], away: [] })
  const [allPlayers, setAllPlayers] = useState([])
  const [loadingStats, setLoadingStats] = useState(false)
  const [saving, setSaving] = useState(null)
  const [newPlayer, setNewPlayer] = useState({ team: 'home', player_id: '' })

  useEffect(() => {
    if (matches.length > 0) {
      const defaultMatch = matches.find(m => m.status === 'finished') || matches.find(m => m.status === 'live') || matches[0]
      if (defaultMatch) {
        setSelectedMatchId(defaultMatch.id)
        setSelectedMatch(defaultMatch)
      }
    }
  }, [matches])

  const fetchMatchStats = (matchId) => {
    if (!matchId) return
    setLoadingStats(true)
    fetch(`/admin/partidos/${matchId}/estadisticas`, {
      headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
    })
      .then(res => res.json())
      .then(data => {
        setStats({ home: data.home || [], away: data.away || [] })
        setAllPlayers(data.players || [])
      })
      .catch(() => toastError && toastError('Error al cargar las estadísticas'))
      .finally(() => setLoadingStats(false))
  }

  useEffect(() => {
    if (selectedMatchId) {
      const found = matches.find(m => String(m.id) === String(selectedMatchId))
      setSelectedMatch(found || null)
      fetchMatchStats(selectedMatchId)
    }
  }, [selectedMatchId])

  const csrf = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''

  const handleSave = (stat) => {
    if (!selectedMatch) return
    setSaving(stat.player_id)
    fetch(`/admin/partidos/${selectedMatch.id}/estadisticas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-CSRF-TOKEN': csrf, 'X-Requested-With': 'XMLHttpRequest' },
      body: JSON.stringify({ player_id: stat.player_id, points: stat.points, fouls: stat.fouls, triples: stat.triples }),
    })
      .then(res => { if (!res.ok) throw new Error(); return res.json() })
      .then(() => { toastSuccess && toastSuccess('Estadística guardada'); fetchMatchStats(selectedMatch.id) })
      .catch(() => toastError && toastError('Error al guardar'))
      .finally(() => setSaving(null))
  }

  const handleDelete = (playerId) => {
    if (!selectedMatch) return
    confirmDelete('¿Eliminar estadística?', 'Se eliminará la estadística de este jugador en este partido.')
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

  const handleAdd = () => {
    if (!selectedMatch || !newPlayer.player_id) return
    setSaving('adding')
    fetch(`/admin/partidos/${selectedMatch.id}/estadisticas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-CSRF-TOKEN': csrf, 'X-Requested-With': 'XMLHttpRequest' },
      body: JSON.stringify({ player_id: newPlayer.player_id, points: 0, fouls: 0, triples: 0 }),
    })
      .then(res => { if (!res.ok) throw new Error(); return res.json() })
      .then(() => { toastSuccess && toastSuccess('Jugador agregado'); setNewPlayer({ team: 'home', player_id: '' }); fetchMatchStats(selectedMatch.id) })
      .catch(() => toastError && toastError('Error al agregar jugador'))
      .finally(() => setSaving(null))
  }

  const updateStat = (side, index, field, value) => {
    setStats(prev => {
      const updated = { ...prev }
      updated[side] = [...updated[side]]
      updated[side][index] = { ...updated[side][index], [field]: Number(value) }
      return updated
    })
  }

  const inputClass = "w-20 bg-[#121212] border border-[#222] text-white text-xs text-center px-2 py-1.5 rounded-xl outline-none focus:border-orange-500 font-bold"

  const homePlayers = allPlayers.filter(p => selectedMatch && p.team_id === selectedMatch.home_team_id)
  const awayPlayers = allPlayers.filter(p => selectedMatch && p.team_id === selectedMatch.away_team_id)
  const availablePlayers = newPlayer.team === 'home' ? homePlayers : awayPlayers
  const existingPlayerIds = [...stats.home, ...stats.away].map(s => s.player_id)
  const filteredPlayers = availablePlayers.filter(p => !existingPlayerIds.includes(p.id))

  const renderTable = (side, teamName, playerStats) => (
    <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-3xl p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-[#1a1a1a] pb-3">
        <h3 className="text-xs font-black text-orange-500 uppercase tracking-wider">{teamName}</h3>
        <span className="text-[10px] text-gray-500 font-bold">{playerStats.length} Jugadores registrados</span>
      </div>
      {playerStats.length === 0 ? (
        <p className="text-xs text-gray-500 italic text-center py-6">No hay estadísticas registradas para este equipo.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#222] text-gray-500">
                <th className="pb-3 pr-4 text-[10px] uppercase font-bold">Jugador</th>
                <th className="pb-3 px-2 text-center text-[10px] uppercase font-bold">Puntos</th>
                <th className="pb-3 px-2 text-center text-[10px] uppercase font-bold">Faltas</th>
                <th className="pb-3 px-2 text-center text-[10px] uppercase font-bold">Triples (3pt)</th>
                <th className="pb-3 pl-2 text-center text-[10px] uppercase font-bold">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#111]">
              {playerStats.map((stat, i) => (
                <tr key={stat.player_id} className="hover:bg-[#121212]/50 transition-colors">
                  <td className="py-3 pr-4">
                    <span className="font-extrabold text-white text-xs">{stat.player_name}</span>
                    <span className="text-gray-500 text-[10px] ml-2 font-bold">#{stat.player_number}</span>
                  </td>
                  <td className="py-3 px-2 text-center">
                    <input type="number" min={0} value={stat.points} onChange={e => updateStat(side, i, 'points', e.target.value)} className={inputClass} />
                  </td>
                  <td className="py-3 px-2 text-center">
                    <input type="number" min={0} value={stat.fouls} onChange={e => updateStat(side, i, 'fouls', e.target.value)} className={inputClass} />
                  </td>
                  <td className="py-3 px-2 text-center">
                    <input type="number" min={0} value={stat.triples} onChange={e => updateStat(side, i, 'triples', e.target.value)} className={inputClass} />
                  </td>
                  <td className="py-3 pl-2 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => handleSave(stat)}
                        disabled={saving === stat.player_id}
                        className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold rounded-xl hover:bg-emerald-500/20 disabled:opacity-50 transition-all flex items-center space-x-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{saving === stat.player_id ? '...' : 'Guardar'}</span>
                      </button>
                      <button
                        onClick={() => handleDelete(stat.player_id)}
                        className="p-1.5 text-gray-500 hover:text-red-400 rounded-xl hover:bg-red-950/20 transition-colors"
                        title="Eliminar registro"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )

  return (
    <AdminLayout title="Estadísticas Individuales">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center bg-orange-500/10 border border-orange-500/20 text-[10px] font-black text-orange-500 px-3 py-1 rounded-full uppercase tracking-wider">
              <Sparkles className="w-3 h-3 mr-1" /> Control de Estadísticas
            </span>
            <h1 className="text-xl font-black text-white mt-1">Estadísticas Individuales de Jugadores</h1>
            <p className="text-xs text-gray-500 mt-0.5">Edita puntos, faltas y triples para corregir los números mostrados en los líderes del cliente.</p>
          </div>

          {/* Match selector dropdown */}
          <div className="w-full md:w-80">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Seleccionar Partido</label>
            <select
              value={selectedMatchId}
              onChange={e => setSelectedMatchId(e.target.value)}
              className="w-full bg-[#0d0d0d] border border-[#222] text-white text-xs px-4 py-3 rounded-2xl outline-none focus:border-orange-500 font-bold"
            >
              <option value="">Selecciona un partido...</option>
              {matches.map(m => (
                <option key={m.id} value={m.id}>
                  [{m.status === 'finished' ? 'Finalizado' : m.status === 'live' ? 'En Vivo' : 'Programado'}] {m.home_team?.name} vs {m.away_team?.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedMatch ? (
          loadingStats ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {renderTable('home', selectedMatch.home_team?.name || 'Equipo Local', stats.home)}
                {renderTable('away', selectedMatch.away_team?.name || 'Equipo Visitante', stats.away)}
              </div>

              {/* Formulario Agregar Jugador */}
              <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-3xl p-5 space-y-4">
                <h3 className="text-xs font-black text-orange-500 uppercase tracking-wider">➕ Agregar Jugador al Registro del Partido</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Equipo</label>
                    <select
                      value={newPlayer.team}
                      onChange={e => setNewPlayer({ team: e.target.value, player_id: '' })}
                      className="w-full bg-[#121212] border border-[#222] text-white text-xs px-4 py-3 rounded-2xl outline-none focus:border-orange-500"
                    >
                      <option value="home">{selectedMatch.home_team?.name || 'Local'}</option>
                      <option value="away">{selectedMatch.away_team?.name || 'Visitante'}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Jugador</label>
                    <select
                      value={newPlayer.player_id}
                      onChange={e => setNewPlayer(prev => ({ ...prev, player_id: e.target.value }))}
                      className="w-full bg-[#121212] border border-[#222] text-white text-xs px-4 py-3 rounded-2xl outline-none focus:border-orange-500"
                    >
                      <option value="">Seleccionar jugador...</option>
                      {filteredPlayers.map(p => (
                        <option key={p.id} value={p.id}>#{p.number} - {p.name}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={handleAdd}
                    disabled={!newPlayer.player_id || saving === 'adding'}
                    className="py-3 bg-gradient-to-r from-orange-500 to-amber-600 text-black text-xs font-bold rounded-2xl disabled:opacity-50"
                  >
                    {saving === 'adding' ? 'Agregando...' : 'Agregar Jugador'}
                  </button>
                </div>
              </div>
            </div>
          )
        ) : (
          <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-3xl p-12 text-center text-gray-500 text-xs font-bold">
            Selecciona un partido arriba para comenzar a gestionar y corregir las estadísticas de los jugadores.
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
