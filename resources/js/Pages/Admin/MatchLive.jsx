import { router } from '@inertiajs/react'
import AdminLayout from '../../Components/AdminLayout'
import { Trophy, Flag, ChevronRight } from 'lucide-react'

function ScoreButton({ label, onClick, color = 'orange' }) {
  const colors = {
    orange: 'bg-orange-500/10 border-orange-500/20 text-orange-400 hover:bg-orange-500/20',
    red: 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20',
    blue: 'bg-blue-500/10 border-blue-500/20 text-blue-400 hover:bg-blue-500/20',
  }
  return (
    <button onClick={onClick}
      className={`px-3 py-2 border rounded-xl text-xs font-bold transition-all ${colors[color]}`}>
      {label}
    </button>
  )
}

function TeamPanel({ match, side }) {
  const isHome = side === 'home'
  const team = isHome ? match.home_team : match.away_team
  const score = isHome ? match.home_score : match.away_score
  const fouls = isHome ? match.home_fouls_q : match.away_fouls_q
  const matchPlayers = match.players?.filter(p => p.team_id === team.id) ?? []

  const addScore = (points, playerId = null) => {
    router.post(`/admin/partidos/${match.id}/score`, { team: side, points, player_id: playerId })
  }

  const addFoul = (playerId = null) => {
    router.post(`/admin/partidos/${match.id}/foul`, { team: side, player_id: playerId })
  }

  return (
    <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-3xl p-5 flex-1">
      <div className="flex items-center space-x-3 mb-4">
        <div className={`w-10 h-10 bg-gradient-to-br ${team.logo_color} rounded-xl flex items-center justify-center font-black text-black text-xs`}>
          {team.short_name}
        </div>
        <div>
          <h3 className="text-sm font-bold text-white">{team.name}</h3>
          <p className="text-[10px] text-gray-500">Faltas: {fouls}/5 {fouls >= 5 && '⚠️ Bonus'}</p>
        </div>
      </div>

      <div className="text-5xl font-black text-white text-center my-6">{score}</div>

      <div className="flex flex-wrap gap-2 justify-center mb-4">
        <ScoreButton label="+1" onClick={() => addScore(1)} />
        <ScoreButton label="+2" onClick={() => addScore(2)} />
        <ScoreButton label="+3" onClick={() => addScore(3)} />
        <ScoreButton label="Falta" onClick={() => addFoul()} color="red" />
      </div>

      <div className="space-y-1 max-h-48 overflow-y-auto">
        {team.players?.map(player => {
          const stat = matchPlayers.find(p => p.player_id === player.id)
          return (
            <div key={player.id} className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs ${stat?.is_ejected ? 'bg-red-950/20 border border-red-500/20' : 'bg-[#121212] border border-[#1a1a1a]'}`}>
              <span className="text-white font-bold">#{player.number} {player.name}</span>
              <div className="flex items-center space-x-2">
                <span className="text-gray-500">{stat?.points ?? 0}pts / {stat?.fouls ?? 0}F</span>
                {!stat?.is_ejected && (
                  <>
                    <button onClick={() => addScore(2, player.id)} className="text-orange-400 hover:text-orange-300 font-black">+2</button>
                    <button onClick={() => addFoul(player.id)} className="text-red-400 hover:text-red-300 font-black">F</button>
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function MatchLive({ match }) {
  const startMatch = () => router.post(`/admin/partidos/${match.id}/start`)
  const nextQuarter = () => router.post(`/admin/partidos/${match.id}/next-quarter`)
  const finishMatch = () => {
    if (!confirm('¿Finalizar el partido?')) return
    router.post(`/admin/partidos/${match.id}/finish`)
  }

  return (
    <AdminLayout title="Partido en Vivo">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <span className="inline-flex items-center bg-red-500/10 border border-red-500/20 text-[10px] font-black text-red-400 px-3 py-1 rounded-full uppercase tracking-wider">
              {match.status === 'live' ? (
                <>
                  <span className="relative flex h-2 w-2 mr-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
                  </span>
                  En Vivo · Cuarto {match.current_quarter}
                </>
              ) : match.status === 'finished' ? '✓ Finalizado' : 'Pendiente'}
            </span>
            <h1 className="text-xl font-black text-white mt-1">
              {match.home_team?.name} vs {match.away_team?.name}
            </h1>
          </div>

          <div className="flex space-x-2">
            {match.status === 'scheduled' && (
              <button onClick={startMatch} className="px-4 py-2.5 bg-emerald-500 text-black text-xs font-bold rounded-2xl hover:bg-emerald-400">
                Iniciar Partido
              </button>
            )}
            {match.status === 'live' && match.current_quarter < 4 && (
              <button onClick={nextQuarter} className="px-4 py-2.5 bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold rounded-2xl hover:bg-blue-500/20">
                Siguiente Cuarto
              </button>
            )}
            {match.status === 'live' && (
              <button onClick={finishMatch} className="px-4 py-2.5 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold rounded-2xl hover:bg-red-500/20">
                Finalizar
              </button>
            )}
          </div>
        </div>

        {/* Scoreboard */}
        <div className="flex flex-col md:flex-row gap-4">
          <TeamPanel match={match} side="home" />
          <div className="flex flex-col items-center justify-center py-4 md:py-0">
            <div className="text-gray-600 font-black text-2xl">VS</div>
            {match.status === 'live' && (
              <div className="mt-2 text-xs text-gray-500">Q{match.current_quarter}</div>
            )}
          </div>
          <TeamPanel match={match} side="away" />
        </div>

        {/* Event log */}
        {match.events?.length > 0 && (
          <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-3xl p-5">
            <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3">Registro de Eventos</h3>
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {[...match.events].reverse().map(event => (
                <div key={event.id} className="flex items-center justify-between text-xs px-3 py-2 bg-[#121212] rounded-xl">
                  <span className="text-gray-500">Q{event.quarter}</span>
                  <span className="text-white font-bold capitalize">{event.type.replace('_', ' ')}</span>
                  {event.home_score_snapshot !== null && (
                    <span className="text-gray-400">{event.home_score_snapshot} – {event.away_score_snapshot}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
