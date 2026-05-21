import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import Sponsors from './components/Sponsors';
import LiveGameCard from './components/LiveGameCard';
import GameSheetModal from './components/GameSheetModal';
import StandingsTab from './components/StandingsTab';
import LeadersTab from './components/LeadersTab';
import MyTeamTab from './components/MyTeamTab';
import AdminTab from './components/AdminTab';

// Import initial data
import { initialMatches, initialTeams, initialLeaders } from './data/mockData';
import { Sparkles, Calendar, MapPin, Award, ShieldAlert, Phone, Mail, Globe } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('inicio');
  const [statsTab, setStatsTab] = useState('clasificacion'); // 'clasificacion' or 'lideres'
  const [selectedRound, setSelectedRound] = useState(6); // current round
  
  // Data States
  const [matches, setMatches] = useState(initialMatches);
  const [teams, setTeams] = useState(initialTeams);
  const [leaders, setLeaders] = useState(initialLeaders);

  // Modal State
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [sheetMatch, setSheetMatch] = useState(null);

  // Toast Notification State
  const [toast, setToast] = useState(null);

  // 1. Live Match Simulation effect (WOW Factor)
  useEffect(() => {
    const interval = setInterval(() => {
      // Find a live match to update
      const liveMatches = matches.filter(m => m.status === 'LIVE');
      if (liveMatches.length === 0) return;

      const randomMatchIndex = Math.floor(Math.random() * liveMatches.length);
      const matchToUpdate = liveMatches[randomMatchIndex];

      // Random points (1, 2, or 3)
      const points = Math.floor(Math.random() * 3) + 1;
      const isHomeScoring = Math.random() > 0.45; // 55% chance for home, 45% for away

      // Random foul (30% chance)
      const isFoul = Math.random() < 0.3;
      const isHomeFoul = Math.random() > 0.5;

      setMatches(prevMatches =>
        prevMatches.map(m => {
          if (m.id === matchToUpdate.id) {
            let updatedMatch = { ...m };
            const homeTeamData = teams.find(t => t.id === m.homeTeam);
            const awayTeamData = teams.find(t => t.id === m.awayTeam);
            
            let timeParts = m.timeLeft.split(':');
            let min = parseInt(timeParts[0]);
            let sec = parseInt(timeParts[1]);

            // Count down time
            sec -= 15;
            if (sec < 0) {
              sec = 59;
              min -= 1;
            }
            if (min < 0) {
              min = 10; // Reset quarter time
              updatedMatch.quarter = updatedMatch.quarter === '1er Cuarto' ? '2do Cuarto' 
                : updatedMatch.quarter === '2do Cuarto' ? '3er Cuarto'
                : updatedMatch.quarter === '3er Cuarto' ? '4to Cuarto' : 'Finalizado';
              if (updatedMatch.quarter === 'Finalizado') {
                updatedMatch.status = 'FINISHED';
              }
            }

            updatedMatch.timeLeft = `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;

            if (updatedMatch.status === 'FINISHED') return updatedMatch;

            // Trigger score or foul
            if (isFoul) {
              if (isHomeFoul && m.homeFouls < 5) {
                updatedMatch.homeFouls += 1;
                const desc = `Falta colectiva de ${homeTeamData.name} (${updatedMatch.homeFouls}/5)`;
                updatedMatch.events = [...m.events, {
                  id: `e-f-${Date.now()}`,
                  time: updatedMatch.timeLeft,
                  type: 'foul',
                  team: m.homeTeam,
                  player: 'Defensa Colectiva',
                  description: desc
                }];
                // Reset foul warning toast
                if (updatedMatch.homeFouls >= 5) {
                  showToast(`⚠️ ¡Bono de tiros libres para ${awayTeamData.name}! Faltas colectivas de ${homeTeamData.name} al límite.`);
                }
              } else if (!isHomeFoul && m.awayFouls < 5) {
                updatedMatch.awayFouls += 1;
                const desc = `Falta colectiva de ${awayTeamData.name} (${updatedMatch.awayFouls}/5)`;
                updatedMatch.events = [...m.events, {
                  id: `e-f-${Date.now()}`,
                  time: updatedMatch.timeLeft,
                  type: 'foul',
                  team: m.awayTeam,
                  player: 'Defensa Colectiva',
                  description: desc
                }];
                if (updatedMatch.awayFouls >= 5) {
                  showToast(`⚠️ ¡Bono de tiros libres para ${homeTeamData.name}! Faltas colectivas de ${awayTeamData.name} al límite.`);
                }
              }
            } else {
              // Score event
              if (isHomeScoring) {
                updatedMatch.homeScore += points;
                const scoreDesc = points === 3 ? '¡Triple ESPECTACULAR!' : points === 2 ? 'Bandeja en la pintura' : 'Tiro libre cobrado';
                const scorers = leaders.scorers.filter(s => s.team === homeTeamData.name);
                const scorerName = scorers.length > 0 ? scorers[Math.floor(Math.random() * scorers.length)].name : 'Jugador';
                
                updatedMatch.events = [...m.events, {
                  id: `e-s-${Date.now()}`,
                  time: updatedMatch.timeLeft,
                  type: 'score',
                  team: m.homeTeam,
                  player: scorerName,
                  description: `${scoreDesc} (+${points} PTS)`,
                  score: `${updatedMatch.homeScore} - ${updatedMatch.awayScore}`
                }];

                showToast(`🏀 ¡Puntos para ${homeTeamData.name}! ${scorerName} anotó ${points} pts. (${updatedMatch.homeScore} - ${updatedMatch.awayScore})`);
              } else {
                updatedMatch.awayScore += points;
                const scoreDesc = points === 3 ? '¡Triple LETAL!' : points === 2 ? 'Volcada brutal' : 'Tiro libre cobrado';
                const scorers = leaders.scorers.filter(s => s.team === awayTeamData.name);
                const scorerName = scorers.length > 0 ? scorers[Math.floor(Math.random() * scorers.length)].name : 'Jugador';
                
                updatedMatch.events = [...m.events, {
                  id: `e-s-${Date.now()}`,
                  time: updatedMatch.timeLeft,
                  type: 'score',
                  team: m.awayTeam,
                  player: scorerName,
                  description: `${scoreDesc} (+${points} PTS)`,
                  score: `${updatedMatch.homeScore} - ${updatedMatch.awayScore}`
                }];

                showToast(`🏀 ¡Puntos para ${awayTeamData.name}! ${scorerName} anotó ${points} pts. (${updatedMatch.homeScore} - ${updatedMatch.awayScore})`);
              }
            }

            // Sync with current open GameSheetModal if visible
            if (sheetMatch && sheetMatch.id === m.id) {
              setSheetMatch(updatedMatch);
            }

            return updatedMatch;
          }
          return m;
        })
      );
    }, 7000);

    return () => clearInterval(interval);
  }, [matches, teams, leaders, sheetMatch]);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3500);
  };

  // 2. Admin Assign Referee Handler
  const handleScheduleMatch = (matchId, refereeName) => {
    setMatches(prevMatches =>
      prevMatches.map(m => m.id === matchId ? { ...m, referee: refereeName } : m)
    );
  };

  // Find teams by ID helper
  const getTeam = (teamId) => teams.find(t => t.id === teamId) || {};

  // Matches filtered by selected jornada
  const filteredMatches = matches.filter(m => m.round === selectedRound);

  // Count Live matches
  const liveCount = matches.filter(m => m.status === 'LIVE').length;

  // Selected live match for hero card
  const featuredLiveMatch = matches.find(m => m.id === 'match-live-1') || matches[0];

  return (
    <div className="relative min-h-screen bg-[#050505] text-gray-100 flex flex-col items-center">
      {/* Central mobile wrapper */}
      <div className="w-full max-w-md bg-[#050505] min-h-screen flex flex-col pb-24 shadow-2xl relative">
        
        {/* Dynamic score alert Toast */}
        {toast && (
          <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50 w-80 max-w-xs bg-gradient-to-r from-orange-600 to-amber-600 text-black font-extrabold text-xs px-4 py-3 rounded-2xl shadow-[0_10px_25px_rgba(245,124,0,0.4)] flex items-center space-x-2 border border-orange-400 animate-slide-down">
            <span className="text-sm">📣</span>
            <p className="flex-1 leading-tight">{toast}</p>
          </div>
        )}

        {/* Global Header */}
        <Header liveCount={liveCount} />

        {/* Dynamic SPA Content Pages */}
        <main className="flex-1 px-4 py-4 space-y-4">
          
          {/* TAB 1: INICIO (DASHBOARD) */}
          {activeTab === 'inicio' && (
            <div className="space-y-4 animate-fade-in">
              
              {/* Hero Section */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#121212] to-[#080808] border border-[#161616] p-5">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500 opacity-5 blur-2xl rounded-full" />
                <span className="inline-flex items-center space-x-1 bg-basketball bg-opacity-10 border border-basketball border-opacity-20 text-[9px] font-extrabold text-[#f57c00] px-2 py-0.5 rounded-full uppercase tracking-wider mb-2">
                  <Sparkles className="w-3 h-3 mr-1" /> Oficial PWA 2026
                </span>
                
                <h1 className="text-xl font-extrabold text-white tracking-tight leading-tight">
                  HoopCenter: Gestión Total de Tu Torneo
                </h1>
                
                <p className="text-xs text-gray-400 mt-1 leading-normal">
                  Sigue el Torneo de Invierno Quito 2026 en tiempo real. Marcadores, estadísticas, actas oficiales y mucho más.
                </p>

                <div className="mt-3.5 flex items-center space-x-2 bg-[#121212] border border-[#222] rounded-2xl px-3 py-2 w-fit">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
                  </span>
                  <span className="text-[10px] font-bold text-gray-300">
                    {liveCount} partidos en juego en el Coliseo de Quito
                  </span>
                </div>
              </div>

              {/* Live Game Center Header */}
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] uppercase font-bold text-gray-500 tracking-widest">
                  Live Game Center
                </span>
                <span className="text-[9px] text-[#f57c00] font-bold uppercase tracking-widest flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse mr-1" /> Destacado
                </span>
              </div>

              {/* Main Live Card */}
              <LiveGameCard
                match={featuredLiveMatch}
                homeTeamData={getTeam(featuredLiveMatch.homeTeam)}
                awayTeamData={getTeam(featuredLiveMatch.awayTeam)}
                onOpenSheet={() => {
                  setSheetMatch(featuredLiveMatch);
                  setIsSheetOpen(true);
                }}
              />

              {/* Sponsors space */}
              <Sponsors />
            </div>
          )}

          {/* TAB 2: MARCADORES (CALENDARIO & JORNADAS) */}
          {activeTab === 'marcadores' && (
            <div className="space-y-4 animate-fade-in">
              {/* Jornada Selector Carousel */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold text-gray-500 tracking-widest px-1">
                  Selecciona la Jornada
                </span>
                
                <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-hide">
                  {[5, 6, 7].map((round) => (
                    <button
                      key={round}
                      onClick={() => setSelectedRound(round)}
                      className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                        selectedRound === round
                          ? 'bg-basketball text-black border-basketball shadow-[0_0_10px_rgba(245,124,0,0.3)]'
                          : 'bg-[#0d0d0d] text-gray-400 border-[#1a1a1a] hover:border-[#333]'
                      }`}
                    >
                      Jornada {round} {round === 6 && ' (En Curso)'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Matches List */}
              <div className="space-y-3">
                {filteredMatches.length === 0 ? (
                  <div className="text-center py-10 bg-[#0d0d0d] border border-[#161616] rounded-2xl text-xs text-gray-500 font-bold">
                    No hay partidos programados para esta jornada.
                  </div>
                ) : (
                  filteredMatches.map((m) => {
                    const home = getTeam(m.homeTeam);
                    const away = getTeam(m.awayTeam);
                    
                    return (
                      <div
                        key={m.id}
                        onClick={() => {
                          if (m.status === 'LIVE') {
                            setSheetMatch(m);
                            setIsSheetOpen(true);
                          }
                        }}
                        className={`bg-[#0d0d0d] border rounded-2xl p-4 flex flex-col justify-between transition-all duration-300 ${
                          m.status === 'LIVE'
                            ? 'border-basketball border-opacity-30 hover:border-orange-500 cursor-pointer shadow-[0_0_12px_rgba(245,124,0,0.04)]'
                            : 'border-[#161616]'
                        }`}
                      >
                        {/* Match Status header */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-1.5">
                            {m.status === 'LIVE' ? (
                              <>
                                <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                                <span className="text-[9px] font-black text-red-500 uppercase tracking-widest">
                                  EN VIVO - {m.quarter}
                                </span>
                              </>
                            ) : m.status === 'FINISHED' ? (
                              <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                                FINALIZADO
                              </span>
                            ) : (
                              <span className="text-[9px] font-bold text-electric uppercase tracking-widest bg-electric bg-opacity-10 px-1.5 py-0.2 rounded border border-electric border-opacity-15">
                                PROGRAMADO
                              </span>
                            )}
                          </div>
                          
                          <span className="text-[9px] text-gray-500 font-mono">
                            {m.date}
                          </span>
                        </div>

                        {/* Teams Matchup row */}
                        <div className="grid grid-cols-5 items-center py-1">
                          {/* Home Name */}
                          <div className="col-span-2 flex items-center space-x-2">
                            <span className={`w-6 h-6 rounded-full bg-gradient-to-tr ${home.logoColor} flex items-center justify-center font-black text-[9px] text-white`}>
                              {home.shortName}
                            </span>
                            <span className="text-xs font-black text-white truncate">{home.name}</span>
                          </div>

                          {/* Scores / Time */}
                          <div className="col-span-1 flex items-center justify-center text-center">
                            {m.status === 'SCHEDULED' ? (
                              <span className="text-[10px] font-extrabold text-gray-500 uppercase">VS</span>
                            ) : (
                              <div className="flex items-center space-x-1">
                                <span className={`text-sm font-black ${m.homeScore >= m.awayScore ? 'text-white' : 'text-gray-500'}`}>
                                  {m.homeScore}
                                </span>
                                <span className="text-xs text-gray-600 font-bold">-</span>
                                <span className={`text-sm font-black ${m.awayScore >= m.homeScore ? 'text-white' : 'text-gray-500'}`}>
                                  {m.awayScore}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Away Name */}
                          <div className="col-span-2 flex items-center justify-end space-x-2">
                            <span className="text-xs font-black text-white truncate text-right">{away.name}</span>
                            <span className={`w-6 h-6 rounded-full bg-gradient-to-tr ${away.logoColor} flex items-center justify-center font-black text-[9px] text-white`}>
                              {away.shortName}
                            </span>
                          </div>
                        </div>

                        {/* Match footer */}
                        <div className="mt-2.5 pt-2 border-t border-[#121212] flex items-center justify-between text-[9px] text-gray-500 font-bold">
                          <span className="flex items-center">
                            <MapPin className="w-3 h-3 mr-1" /> {m.court}
                          </span>
                          <span>
                            Ref: {m.referee}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 3: TABLAS (GESTIÓN DE CAMPEONATO - CLASIFICACIÓN / LÍDERES) */}
          {activeTab === 'tablas' && (
            <div className="space-y-4 animate-fade-in">
              {/* Tab Selector buttons */}
              <div className="bg-[#0c0c0c] border border-[#161616] p-1 rounded-2xl flex">
                <button
                  onClick={() => setStatsTab('clasificacion')}
                  className={`flex-1 text-center py-2.5 rounded-xl text-xs font-extrabold transition-all ${
                    statsTab === 'clasificacion'
                      ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-black shadow-md'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Clasificación
                </button>
                <button
                  onClick={() => setStatsTab('lideres')}
                  className={`flex-1 text-center py-2.5 rounded-xl text-xs font-extrabold transition-all ${
                    statsTab === 'lideres'
                      ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-black shadow-md'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Líderes Individuales
                </button>
              </div>

              {/* Render dynamic sub-tab content */}
              {statsTab === 'clasificacion' ? (
                <StandingsTab teams={teams} />
              ) : (
                <LeadersTab leaders={leaders} />
              )}
            </div>
          )}

          {/* TAB 4: MI EQUIPO (JUGADOR PORTAL) */}
          {activeTab === 'miequipo' && (
            <div className="animate-fade-in">
              <MyTeamTab />
            </div>
          )}

          {/* TAB 5: PANEL DE ADMINISTRACIÓN */}
          {activeTab === 'admin' && (
            <div className="animate-fade-in">
              <AdminTab
                scheduledMatches={matches.filter(m => m.status === 'SCHEDULED')}
                onScheduleMatch={handleScheduleMatch}
              />
            </div>
          )}

        </main>

        {/* Global Footer */}
        <footer className="border-t border-[#121212] bg-[#070707] py-6 px-4 text-center space-y-3">
          <div className="flex justify-center space-x-4 text-gray-500">
            <a href="#" className="hover:text-basketball transition-colors">
              <Globe className="w-4 h-4" />
            </a>
            <a href="#" className="hover:text-basketball transition-colors">
              <Phone className="w-4 h-4" />
            </a>
            <a href="#" className="hover:text-basketball transition-colors">
              <Mail className="w-4 h-4" />
            </a>
          </div>
          
          <div className="space-y-1">
            <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider">
              HoopCenter MVP v1.0
            </span>
            <span className="block text-[9px] text-gray-600 font-semibold leading-relaxed">
              Desarrollado para el Comité Organizador del Torneo de Invierno Quito 2026. Todos los derechos reservados.
            </span>
          </div>
        </footer>

        {/* Sticky Bottom Navigation */}
        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Acta Digital Modal */}
        {sheetMatch && (
          <GameSheetModal
            isOpen={isSheetOpen}
            onClose={() => setIsSheetOpen(false)}
            match={sheetMatch}
            homeTeamData={getTeam(sheetMatch.homeTeam)}
            awayTeamData={getTeam(sheetMatch.awayTeam)}
          />
        )}

      </div>
    </div>
  );
}
