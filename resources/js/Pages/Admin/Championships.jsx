import { useState } from 'react'
import { useForm } from '@inertiajs/react'
import AdminLayout from '../../Components/AdminLayout'
import { Trophy, Plus, Trash2, Edit2, X, Sparkles, Users } from 'lucide-react'

function ChampionshipModal({ championship, teams, onClose }) {
  const { data, setData, post, put, processing, errors } = useForm({
    name: championship?.name ?? '',
    gender: championship?.gender ?? 'masculino',
    total_teams: championship?.total_teams ?? 4,
    team_ids: championship?.teams?.map(t => t.id) ?? [],
  })

  const toggleTeam = (id) => {
    setData('team_ids', data.team_ids.includes(id)
      ? data.team_ids.filter(x => x !== id)
      : [...data.team_ids, id])
  }

  const submit = (e) => {
    e.preventDefault()
    if (championship) {
      put(`/admin/campeonatos/${championship.id}`, { onSuccess: onClose })
    } else {
      post('/admin/campeonatos', { onSuccess: onClose })
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-[#0d0d0d] border border-[#222] rounded-3xl p-6 w-full max-w-lg">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-black text-white">{championship ? 'Editar Campeonato' : 'Nuevo Campeonato'}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <input value={data.name} onChange={e => setData('name', e.target.value)} placeholder="Nombre del campeonato" required
            className="w-full bg-[#121212] border border-[#222] text-white text-sm px-4 py-3 rounded-2xl outline-none focus:border-orange-500" />
          <div className="grid grid-cols-2 gap-3">
            <select value={data.gender} onChange={e => setData('gender', e.target.value)}
              className="bg-[#121212] border border-[#222] text-white text-sm px-4 py-3 rounded-2xl outline-none">
              <option value="masculino">Masculino</option>
              <option value="femenino">Femenino</option>
              <option value="mixto">Mixto</option>
            </select>
            <input value={data.total_teams} onChange={e => setData('total_teams', +e.target.value)} type="number" min={2} placeholder="Nº equipos"
              className="bg-[#121212] border border-[#222] text-white text-sm px-4 py-3 rounded-2xl outline-none" />
          </div>
          {!championship && (
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Seleccionar Equipos</p>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {teams.map(team => (
                  <button key={team.id} type="button" onClick={() => toggleTeam(team.id)}
                    className={`flex items-center space-x-2 p-2.5 rounded-xl text-xs font-bold border transition-all ${
                      data.team_ids.includes(team.id)
                        ? 'border-orange-500 bg-orange-500/10 text-orange-400'
                        : 'border-[#222] bg-[#121212] text-gray-400'
                    }`}>
                    <div className={`w-5 h-5 rounded bg-gradient-to-br ${team.logo_color} flex-shrink-0`} />
                    <span className="truncate">{team.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          <button type="submit" disabled={processing}
            className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-600 text-black font-bold text-sm rounded-2xl disabled:opacity-50">
            {processing ? 'Guardando...' : championship ? 'Actualizar' : 'Crear Campeonato'}
          </button>
        </form>
      </div>
    </div>
  )
}

const STATUS_LABEL = { draft: 'Borrador', active: 'Activo', finished: 'Finalizado' }
const STATUS_COLOR = { draft: 'bg-gray-500/10 text-gray-400', active: 'bg-emerald-500/10 text-emerald-400', finished: 'bg-blue-500/10 text-blue-400' }

export default function Championships({ championships, teams }) {
  const [modal, setModal] = useState(null)
  const { delete: destroy, put, processing } = useForm()

  const deleteChampionship = (id) => {
    if (!confirm('¿Eliminar campeonato?')) return
    destroy(`/admin/campeonatos/${id}`)
  }

  const activate = (champ) => {
    put(`/admin/campeonatos/${champ.id}`, { status: 'active' })
  }

  return (
    <AdminLayout title="Campeonatos">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="inline-flex items-center bg-orange-500/10 border border-orange-500/20 text-[10px] font-black text-orange-500 px-3 py-1 rounded-full uppercase tracking-wider">
              <Sparkles className="w-3 h-3 mr-1" /> Gestión de Torneos
            </span>
            <h1 className="text-xl font-black text-white mt-1">Campeonatos</h1>
          </div>
          <button onClick={() => setModal({})}
            className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-600 text-black text-xs font-bold rounded-2xl">
            <Plus className="w-4 h-4" />
            <span>Nuevo Campeonato</span>
          </button>
        </div>

        <div className="space-y-4">
          {championships.map(champ => (
            <div key={champ.id} className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-2xl p-5 hover:border-[#333] transition-all">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{champ.name}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLOR[champ.status]}`}>
                        {STATUS_LABEL[champ.status]}
                      </span>
                      <span className="text-[10px] text-gray-500 capitalize">{champ.gender}</span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <button onClick={() => setModal({ championship: champ })}
                    className="p-2 text-gray-500 hover:text-white rounded-lg hover:bg-[#222]">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => deleteChampionship(champ.id)}
                    className="p-2 text-gray-500 hover:text-red-400 rounded-lg hover:bg-red-950/20">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="mt-3 flex items-center space-x-2 text-[10px] text-gray-500">
                <Users className="w-3 h-3" />
                <span>{champ.teams?.length ?? 0} equipos participantes</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {modal !== null && (
        <ChampionshipModal championship={modal.championship} teams={teams} onClose={() => setModal(null)} />
      )}
    </AdminLayout>
  )
}
