import { useState } from 'react'
import { useForm, Link } from '@inertiajs/react'
import AdminLayout from '../../Components/AdminLayout'
import { Swords, Plus, Trash2, Edit2, X, Sparkles, Play, Calendar } from 'lucide-react'
import { TeamLogo } from './Teams'
import { confirmDelete } from '../../lib/swal'

const STATUS_LABEL = { scheduled: 'Programado', live: 'En Vivo', finished: 'Finalizado' }
const STATUS_COLOR = {
  scheduled: 'bg-gray-500/10 text-gray-400',
  live: 'bg-red-500/10 text-red-400',
  finished: 'bg-blue-500/10 text-blue-400',
}

function MatchModal({ match, championships, teams, referees, onClose }) {
  const { data, setData, post, put, processing, errors } = useForm({
    championship_id: match?.championship_id ?? '',
    round: match?.round ?? 1,
    home_team_id: match?.home_team_id ?? '',
    away_team_id: match?.away_team_id ?? '',
    referee_id: match?.referee_id ?? '',
    court: match?.court ?? 'Coliseo Principal',
    scheduled_at: match?.scheduled_at ?? '',
  })

  const [sameTeamError, setSameTeamError] = useState(false)

  const submit = (e) => {
    e.preventDefault()
    if (data.home_team_id && data.away_team_id && String(data.home_team_id) === String(data.away_team_id)) {
      setSameTeamError(true)
      return
    }
    setSameTeamError(false)
    if (match) {
      put(`/admin/partidos/${match.id}`, { onSuccess: onClose })
    } else {
      post('/admin/partidos', { onSuccess: onClose })
    }
  }

  const labelClass = "block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5"
  const selectClass = "w-full bg-[#121212] border border-[#222] text-white text-sm px-4 py-3 rounded-2xl outline-none focus:border-orange-500 transition-colors"
  const inputClass  = "w-full bg-[#121212] border border-[#222] text-white text-sm px-4 py-3 rounded-2xl outline-none focus:border-orange-500 transition-colors placeholder:text-gray-600"

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-[#0d0d0d] border border-[#222] rounded-3xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-sm font-black text-white">{match ? 'Editar Partido' : 'Nuevo Partido'}</h3>
            <p className="text-[11px] text-gray-500 mt-0.5">Completa todos los campos para registrar el partido</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={submit} className="space-y-5">

          {/* Campeonato */}
          <div>
            <label className={labelClass}>🏆 Campeonato</label>
            <select value={data.championship_id} onChange={e => setData('championship_id', e.target.value)} required className={selectClass}>
              <option value="">Seleccionar campeonato al que pertenece el partido</option>
              {championships.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            {errors.championship_id && <p className="text-red-400 text-xs mt-1">{errors.championship_id}</p>}
          </div>

          {/* Equipos */}
          <div>
            <label className={labelClass}>⚡ Equipos enfrentados</label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] text-gray-600 mb-1 font-semibold">🏠 Local (de casa)</p>
                <select
                  value={data.home_team_id}
                  onChange={e => { setData('home_team_id', e.target.value); setSameTeamError(false) }}
                  required
                  className={selectClass}
                >
                  <option value="">Seleccionar equipo</option>
                  {teams.map(t => (
                    <option key={t.id} value={t.id} disabled={String(t.id) === String(data.away_team_id)}>
                      {t.name}{String(t.id) === String(data.away_team_id) ? ' (ya seleccionado)' : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <p className="text-[10px] text-gray-600 mb-1 font-semibold">✈ Visitante (foráneo)</p>
                <select
                  value={data.away_team_id}
                  onChange={e => { setData('away_team_id', e.target.value); setSameTeamError(false) }}
                  required
                  className={selectClass}
                >
                  <option value="">Seleccionar equipo</option>
                  {teams.map(t => (
                    <option key={t.id} value={t.id} disabled={String(t.id) === String(data.home_team_id)}>
                      {t.name}{String(t.id) === String(data.home_team_id) ? ' (ya seleccionado)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {sameTeamError && (
              <p className="text-red-400 text-xs font-semibold mt-2 px-1">⚠ El equipo local y visitante no pueden ser el mismo.</p>
            )}
          </div>

          {/* Árbitro */}
          <div>
            <label className={labelClass}>🦺 Árbitro principal</label>
            <select value={data.referee_id} onChange={e => setData('referee_id', e.target.value)} className={selectClass}>
              <option value="">Sin árbitro asignado (opcional)</option>
              {referees.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>

          {/* Cancha */}
          <div>
            <label className={labelClass}>📍 Cancha / Lugar del partido</label>
            <input
              value={data.court}
              onChange={e => setData('court', e.target.value)}
              placeholder="Ej: Coliseo Mayor de Latacunga"
              className={inputClass}
            />
          </div>

          {/* Fecha y Ronda en fila */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>📅 Fecha y hora</label>
              <input
                value={data.scheduled_at}
                onChange={e => setData('scheduled_at', e.target.value)}
                type="datetime-local"
                className={inputClass}
              />
              <p className="text-[10px] text-gray-600 mt-1">Cuándo se jugará el partido</p>
            </div>
            <div>
              <label className={labelClass}>🔢 Ronda</label>
              <input
                value={data.round}
                onChange={e => setData('round', +e.target.value)}
                type="number"
                min={1}
                placeholder="1"
                className={inputClass}
              />
            </div>
          </div>

          <button type="submit" disabled={processing}
            className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-600 text-black font-bold text-sm rounded-2xl disabled:opacity-50 hover:opacity-90 transition-opacity mt-2">
            {processing ? 'Guardando...' : match ? 'Actualizar Partido' : 'Crear Partido'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function Matches({ matches, championships, teams, referees }) {
  const [modal, setModal] = useState(null)
  const { delete: destroy } = useForm()

  const deleteMatch = async (id) => {
    const result = await confirmDelete('¿Eliminar partido?', 'Se perderán todos los datos del partido.')
    if (result.isConfirmed) destroy(`/admin/partidos/${id}`)
  }

  return (
    <AdminLayout title="Partidos">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="inline-flex items-center bg-orange-500/10 border border-orange-500/20 text-[10px] font-black text-orange-500 px-3 py-1 rounded-full uppercase tracking-wider">
              <Sparkles className="w-3 h-3 mr-1" /> Programación
            </span>
            <h1 className="text-xl font-black text-white mt-1">Partidos</h1>
          </div>
          <button onClick={() => setModal({})}
            className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-600 text-black text-xs font-bold rounded-2xl">
            <Plus className="w-4 h-4" />
            <span>Nuevo Partido</span>
          </button>
        </div>

        <div className="space-y-3">
          {matches.map(match => (
            <div key={match.id} className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-2xl p-4 hover:border-[#333] transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-center flex flex-col items-center">
                    <TeamLogo team={match.home_team} className="w-8 h-8 mb-1" />
                    <p className="text-[10px] font-bold text-gray-400">{match.home_team?.short_name}</p>
                    {match.status !== 'scheduled' && (
                      <p className="text-lg font-black text-white mt-0.5">{match.home_score}</p>
                    )}
                  </div>
                  <div className="text-center px-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLOR[match.status]}`}>
                      {STATUS_LABEL[match.status]}
                    </span>
                    <p className="text-[10px] text-gray-600 mt-1 font-bold">VS</p>
                  </div>
                  <div className="text-center flex flex-col items-center">
                    <TeamLogo team={match.away_team} className="w-8 h-8 mb-1" />
                    <p className="text-[10px] font-bold text-gray-400">{match.away_team?.short_name}</p>
                    {match.status !== 'scheduled' && (
                      <p className="text-lg font-black text-white mt-0.5">{match.away_score}</p>
                    )}
                  </div>
                  <div className="ml-4 hidden sm:block">
                    <p className="text-xs font-bold text-white">{match.home_team?.name} vs {match.away_team?.name}</p>
                    <div className="flex items-center space-x-2 text-[10px] text-gray-500 mt-1">
                      <Calendar className="w-3 h-3" />
                      <span>{match.scheduled_at ? new Date(match.scheduled_at).toLocaleString('es') : 'Sin fecha'}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {match.status === 'scheduled' && (
                    <Link href={`/admin/partidos/${match.id}/live`}
                      className="flex items-center space-x-1 px-3 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold rounded-xl hover:bg-emerald-500/20 transition-all">
                      <Play className="w-3.5 h-3.5" />
                      <span>Iniciar</span>
                    </Link>
                  )}
                  {match.status === 'live' && (
                    <Link href={`/admin/partidos/${match.id}/live`}
                      className="flex items-center space-x-1 px-3 py-2 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold rounded-xl hover:bg-red-500/20 transition-all">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
                      </span>
                      <span>En Vivo</span>
                    </Link>
                  )}
                  <button onClick={() => setModal({ match })}
                    className="p-2 text-gray-500 hover:text-white rounded-lg hover:bg-[#222]">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => deleteMatch(match.id)}
                    className="p-2 text-gray-500 hover:text-red-400 rounded-lg hover:bg-red-950/20">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {modal !== null && (
        <MatchModal match={modal.match} championships={championships} teams={teams} referees={referees} onClose={() => setModal(null)} />
      )}
    </AdminLayout>
  )
}
