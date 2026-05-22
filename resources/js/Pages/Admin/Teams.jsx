import { useState } from 'react'
import { useForm } from '@inertiajs/react'
import AdminLayout from '../../Components/AdminLayout'
import { Users, Plus, Trash2, Edit2, X, ChevronRight, Shirt, Sparkles } from 'lucide-react'

const LOGO_COLORS = [
  { name: 'Naranja', value: 'from-orange-500 to-amber-600' },
  { name: 'Azul', value: 'from-blue-600 to-cyan-500' },
  { name: 'Rojo', value: 'from-rose-600 to-red-500' },
  { name: 'Verde', value: 'from-emerald-500 to-teal-500' },
  { name: 'Morado', value: 'from-purple-600 to-pink-500' },
  { name: 'Dorado', value: 'from-yellow-500 to-amber-400' },
]

function TeamModal({ team, onClose }) {
  const { data, setData, post, put, processing, errors } = useForm({
    name: team?.name ?? '',
    gender: team?.gender ?? 'masculino',
    short_name: team?.short_name ?? '',
    logo_color: team?.logo_color ?? 'from-orange-500 to-amber-600',
  })

  const submit = (e) => {
    e.preventDefault()
    if (team) {
      put(`/admin/equipos/${team.id}`, { onSuccess: onClose })
    } else {
      post('/admin/equipos', { onSuccess: onClose })
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-[#0d0d0d] border border-[#222] rounded-3xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-black text-white">{team ? 'Editar Equipo' : 'Nuevo Equipo'}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <input value={data.name} onChange={e => setData('name', e.target.value)} placeholder="Nombre del equipo" required
            className="w-full bg-[#121212] border border-[#222] text-white text-sm px-4 py-3 rounded-2xl outline-none focus:border-orange-500" />
          {errors.name && <p className="text-xs text-red-400">{errors.name}</p>}

          <select value={data.gender} onChange={e => setData('gender', e.target.value)}
            className="w-full bg-[#121212] border border-[#222] text-white text-sm px-4 py-3 rounded-2xl outline-none focus:border-orange-500">
            <option value="masculino">Masculino</option>
            <option value="femenino">Femenino</option>
            <option value="mixto">Mixto</option>
          </select>

          <input value={data.short_name} onChange={e => setData('short_name', e.target.value)} placeholder="Abrev. (máx 5)" maxLength={5} required
            className="w-full bg-[#121212] border border-[#222] text-white text-sm px-4 py-3 rounded-2xl outline-none focus:border-orange-500" />

          <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Color del equipo</p>
            <div className="grid grid-cols-3 gap-2">
              {LOGO_COLORS.map(c => (
                <button key={c.value} type="button" onClick={() => setData('logo_color', c.value)}
                  className={`h-10 bg-gradient-to-r ${c.value} rounded-xl text-[10px] font-bold text-black ${data.logo_color === c.value ? 'ring-2 ring-white' : ''}`}>
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" disabled={processing}
            className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-600 text-black font-bold text-sm rounded-2xl disabled:opacity-50">
            {processing ? 'Guardando...' : team ? 'Actualizar' : 'Crear Equipo'}
          </button>
        </form>
      </div>
    </div>
  )
}

function PlayerModal({ team, player, onClose }) {
  const { data, setData, post, put, processing, errors } = useForm({
    name: player?.name ?? '',
    number: player?.number ?? '',
    position: player?.position ?? 'Base',
    gender: player?.gender ?? 'masculino',
    status: player?.status ?? 'activo',
  })

  const submit = (e) => {
    e.preventDefault()
    if (player) {
      put(`/admin/equipos/${team.id}/jugadores/${player.id}`, { onSuccess: onClose })
    } else {
      post(`/admin/equipos/${team.id}/jugadores`, { onSuccess: onClose })
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-[#0d0d0d] border border-[#222] rounded-3xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-black text-white">{player ? 'Editar Jugador' : 'Nuevo Jugador'}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <input value={data.name} onChange={e => setData('name', e.target.value)} placeholder="Nombre completo" required
            className="w-full bg-[#121212] border border-[#222] text-white text-sm px-4 py-3 rounded-2xl outline-none focus:border-orange-500" />
          <div className="grid grid-cols-2 gap-3">
            <input value={data.number} onChange={e => setData('number', e.target.value)} placeholder="Número" type="number" min={0} max={99} required
              className="bg-[#121212] border border-[#222] text-white text-sm px-4 py-3 rounded-2xl outline-none focus:border-orange-500" />
            <select value={data.position} onChange={e => setData('position', e.target.value)}
              className="bg-[#121212] border border-[#222] text-white text-sm px-4 py-3 rounded-2xl outline-none focus:border-orange-500">
              {['Base', 'Escolta', 'Alero', 'Ala-Pivot', 'Pivot'].map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <select value={data.gender} onChange={e => setData('gender', e.target.value)}
              className="bg-[#121212] border border-[#222] text-white text-sm px-4 py-3 rounded-2xl outline-none focus:border-orange-500">
              <option value="masculino">Masculino</option>
              <option value="femenino">Femenino</option>
            </select>
            <select value={data.status} onChange={e => setData('status', e.target.value)}
              className="bg-[#121212] border border-[#222] text-white text-sm px-4 py-3 rounded-2xl outline-none focus:border-orange-500">
              <option value="activo">Activo</option>
              <option value="lesionado">Lesionado</option>
              <option value="suspendido">Suspendido</option>
            </select>
          </div>
          <button type="submit" disabled={processing}
            className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-600 text-black font-bold text-sm rounded-2xl disabled:opacity-50">
            {processing ? 'Guardando...' : player ? 'Actualizar' : 'Agregar Jugador'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function Teams({ teams }) {
  const [modal, setModal] = useState(null)
  const [selectedTeam, setSelectedTeam] = useState(null)
  const { delete: destroy, processing } = useForm()

  const deleteTeam = (id) => {
    if (!confirm('¿Eliminar equipo?')) return
    destroy(`/admin/equipos/${id}`)
  }

  const deletePlayer = (team, playerId) => {
    if (!confirm('¿Eliminar jugador?')) return
    destroy(`/admin/equipos/${team.id}/jugadores/${playerId}`)
  }

  const activeTeam = selectedTeam ? teams.find(t => t.id === selectedTeam.id) : null

  return (
    <AdminLayout title="Equipos">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="inline-flex items-center bg-orange-500/10 border border-orange-500/20 text-[10px] font-black text-orange-500 px-3 py-1 rounded-full uppercase tracking-wider">
              <Sparkles className="w-3 h-3 mr-1" /> Gestión de Equipos
            </span>
            <h1 className="text-xl font-black text-white mt-1">Equipos y Jugadores</h1>
          </div>
          <button onClick={() => setModal({ type: 'team' })}
            className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-600 text-black text-xs font-bold rounded-2xl">
            <Plus className="w-4 h-4" />
            <span>Nuevo Equipo</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Team list */}
          <div className="space-y-3">
            {teams.map(team => (
              <div key={team.id}
                className={`bg-[#0d0d0d] border rounded-2xl p-4 cursor-pointer transition-all ${selectedTeam?.id === team.id ? 'border-orange-500/50' : 'border-[#1a1a1a] hover:border-[#333]'}`}
                onClick={() => setSelectedTeam(team)}>
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 bg-gradient-to-br ${team.logo_color} rounded-xl flex items-center justify-center font-black text-black text-xs`}>
                    {team.short_name}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{team.name}</p>
                    <p className="text-[10px] text-gray-500 capitalize">{team.gender} · {team.players?.length ?? 0} jugadores</p>
                  </div>
                  <div className="flex space-x-1">
                    <button onClick={(e) => { e.stopPropagation(); setModal({ type: 'team', team }) }}
                      className="p-2 text-gray-500 hover:text-white rounded-lg hover:bg-[#222]">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); deleteTeam(team.id) }}
                      className="p-2 text-gray-500 hover:text-red-400 rounded-lg hover:bg-red-950/20">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <ChevronRight className="w-4 h-4 text-gray-600 self-center" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Players panel */}
          {activeTeam && (
            <div className="lg:col-span-2 bg-[#0d0d0d] border border-[#1a1a1a] rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 bg-gradient-to-br ${activeTeam.logo_color} rounded-xl flex items-center justify-center font-black text-black text-xs`}>
                    {activeTeam.short_name}
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white">{activeTeam.name}</h3>
                    <p className="text-[10px] text-gray-500">{activeTeam.players?.length} jugadores</p>
                  </div>
                </div>
                <button onClick={() => setModal({ type: 'player', team: activeTeam })}
                  className="flex items-center space-x-1 px-3 py-2 bg-[#1a1a1a] hover:bg-[#222] border border-[#222] text-white text-xs font-bold rounded-xl">
                  <Plus className="w-3.5 h-3.5" />
                  <span>Jugador</span>
                </button>
              </div>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {activeTeam.players?.map(player => (
                  <div key={player.id} className="flex items-center justify-between bg-[#121212] border border-[#1a1a1a] rounded-xl p-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-[#1a1a1a] rounded-lg flex items-center justify-center">
                        <Shirt className="w-4 h-4 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">#{player.number} {player.name}</p>
                        <p className="text-[10px] text-gray-500">{player.position} · {player.status}</p>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <button onClick={() => setModal({ type: 'player', team: activeTeam, player })}
                        className="p-1.5 text-gray-500 hover:text-white rounded-lg hover:bg-[#222]">
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button onClick={() => deletePlayer(activeTeam, player.id)}
                        className="p-1.5 text-gray-500 hover:text-red-400 rounded-lg hover:bg-red-950/20">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {modal?.type === 'team' && (
        <TeamModal team={modal.team} onClose={() => setModal(null)} />
      )}
      {modal?.type === 'player' && (
        <PlayerModal team={modal.team} player={modal.player} onClose={() => setModal(null)} />
      )}
    </AdminLayout>
  )
}
