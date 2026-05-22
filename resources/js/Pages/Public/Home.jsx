import { useState } from 'react'
import { Trophy, Swords, BarChart2, Users } from 'lucide-react'

function TeamLogo({ team, className = "w-10 h-10", showText = true }) {
  if (!team) return null
  if (team.logo_url) {
    return <img src={team.logo_url} alt={team.name} className={`${className} rounded-xl object-cover flex-shrink-0`} />
  }
  const isHex = team.logo_color?.startsWith('#')
  return (
    <div 
      style={isHex ? { backgroundColor: team.logo_color } : {}}
      className={`${className} ${!isHex ? `bg-gradient-to-br ${team.logo_color}` : ''} rounded-xl flex items-center justify-center font-black text-black text-xs flex-shrink-0`}
    >
      {showText ? team.short_name : ''}
    </div>
  )
}

const TABS = [
  { id: 'standings', label: 'Tabla', icon: Trophy },
  { id: 'live', label: 'En Vivo', icon: Swords },
  { id: 'stats', label: 'Líderes', icon: BarChart2 },
]

function Header() {
  return (
    <header className="bg-[#0d0d0d]/80 backdrop-blur border-b border-[#1a1a1a] sticky top-0 z-40">
      <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-tr from-orange-500 to-amber-600 rounded-lg flex items-center justify-center font-black text-black text-sm">GT</div>
          <div>
            <p className="text-xs font-black text-white">GameTime</p>
            <p className="text-[9px] text-gray-500">Torneo de Invierno Pifo 2026</p>
          </div>
        </div>
        <a href="/login" className="text-[10px] font-bold text-orange-500 border border-orange-500/30 px-3 py-1.5 rounded-xl hover:bg-orange-500/10 transition-all">
          Admin
        </a>
      </div>
    </header>
  )
}

function LiveMatchCard({ match }) {
  return (
    <div className="bg-[#0d0d0d] border border-red-500/20 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="flex items-center space-x-1.5 text-[10px] font-black text-red-400">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
          </span>
          <span>EN VIVO · Q{match.current_quarter}</span>
        </span>
        <span className="text-[10px] text-gray-500">{match.championship?.name}</span>
      </div>
      <div className="flex items-center justify-between">
        <div className="text-center flex-1">
          <TeamLogo team={match.home_team} className="w-10 h-10 mx-auto mb-1" />
          <p className="text-[10px] text-white font-bold truncate">{match.home_team?.name}</p>
        </div>
        <div className="text-center px-4">
          <div className="flex items-center space-x-2">
            <span className="text-3xl font-black text-white">{match.home_score}</span>
            <span className="text-gray-600 font-black">–</span>
            <span className="text-3xl font-black text-white">{match.away_score}</span>
          </div>
        </div>
        <div className="text-center flex-1">
          <TeamLogo team={match.away_team} className="w-10 h-10 mx-auto mb-1" />
          <p className="text-[10px] text-white font-bold truncate">{match.away_team?.name}</p>
        </div>
      </div>
    </div>
  )
}

function StandingsTab({ championship }) {
  if (!championship) return (
    <div className="text-center py-12 text-gray-500 text-xs">No hay campeonato activo</div>
  )

  return (
    <div className="space-y-3">
      <h2 className="text-xs font-black text-gray-500 uppercase tracking-widest">{championship.name}</h2>
      <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-2xl overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-[#1a1a1a]">
              <th className="text-left px-4 py-3 text-gray-500 font-bold">#</th>
              <th className="text-left px-4 py-3 text-gray-500 font-bold">Equipo</th>
              <th className="text-center px-2 py-3 text-gray-500 font-bold">PJ</th>
              <th className="text-center px-2 py-3 text-gray-500 font-bold">PG</th>
              <th className="text-center px-2 py-3 text-gray-500 font-bold">PP</th>
              <th className="text-center px-2 py-3 text-gray-500 font-bold">Pts</th>
            </tr>
          </thead>
          <tbody>
            {championship.teams?.map((team, i) => (
              <tr key={team.id} className={`border-b border-[#1a1a1a] ${i === 0 ? 'bg-orange-500/5' : ''}`}>
                <td className="px-4 py-3 font-black text-white">{i + 1}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center space-x-2">
                    <TeamLogo team={team} className="w-6 h-6" showText={false} />
                    <span className="font-bold text-white">{team.name}</span>
                  </div>
                </td>
                <td className="text-center px-2 py-3 text-gray-400">{team.pivot?.pj ?? 0}</td>
                <td className="text-center px-2 py-3 text-emerald-400">{team.pivot?.pg ?? 0}</td>
                <td className="text-center px-2 py-3 text-red-400">{team.pivot?.pp ?? 0}</td>
                <td className="text-center px-2 py-3 font-black text-white">{team.pivot?.pts ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function Home({ championship, liveMatches, recentMatches }) {
  const [tab, setTab] = useState('standings')

  return (
    <div className="min-h-screen bg-[#070707] text-gray-100">
      <Header />

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Live matches banner */}
        {liveMatches?.length > 0 && (
          <div className="space-y-3">
            {liveMatches.map(match => <LiveMatchCard key={match.id} match={match} />)}
          </div>
        )}

        {/* Tabs */}
        <div className="flex space-x-1 bg-[#0d0d0d] border border-[#1a1a1a] p-1 rounded-2xl">
          {TABS.map(t => {
            const Icon = t.icon
            const active = tab === t.id
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex-1 flex items-center justify-center space-x-1.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  active ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-black' : 'text-gray-500 hover:text-white'
                }`}>
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            )
          })}
        </div>

        {/* Tab content */}
        {tab === 'standings' && <StandingsTab championship={championship} />}
        {tab === 'live' && (
          <div className="space-y-3">
            {liveMatches?.length === 0 ? (
              <div className="text-center py-12 text-gray-500 text-xs">No hay partidos en vivo</div>
            ) : (
              liveMatches.map(match => <LiveMatchCard key={match.id} match={match} />)
            )}
          </div>
        )}
        {tab === 'stats' && (
          <div className="text-center py-12 text-gray-500 text-xs">Estadísticas próximamente</div>
        )}

        {/* Recent matches */}
        {recentMatches?.length > 0 && tab === 'standings' && (
          <div className="space-y-3">
            <h2 className="text-xs font-black text-gray-500 uppercase tracking-widest">Resultados Recientes</h2>
            {recentMatches.map(match => (
              <div key={match.id} className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-blue-400">Finalizado</span>
                  {match.label && <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider">{match.label}</span>}
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-center flex-1 flex flex-col items-center">
                    <TeamLogo team={match.home_team} className="w-8 h-8 mb-1" showText={false} />
                    <p className="text-xs font-bold text-white">{match.home_team?.short_name}</p>
                  </div>
                  <div className="flex items-center space-x-2 px-4">
                    <span className={`text-2xl font-black ${match.home_score > match.away_score ? 'text-white' : 'text-gray-500'}`}>{match.home_score}</span>
                    <span className="text-gray-600">–</span>
                    <span className={`text-2xl font-black ${match.away_score > match.home_score ? 'text-white' : 'text-gray-500'}`}>{match.away_score}</span>
                  </div>
                  <div className="text-center flex-1 flex flex-col items-center">
                    <TeamLogo team={match.away_team} className="w-8 h-8 mb-1" showText={false} />
                    <p className="text-xs font-bold text-white">{match.away_team?.short_name}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <div className="h-20" />
    </div>
  )
}
