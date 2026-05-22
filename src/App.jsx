import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Public Components & Layouts
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import Sponsors from './components/Sponsors';
import LiveGameCard from './components/LiveGameCard';
import GameSheetModal from './components/GameSheetModal';
import StandingsTab from './components/StandingsTab';
import LeadersTab from './components/LeadersTab';
import MyTeamTab from './components/MyTeamTab';

// Admin Components & Pages
import Login from './pages/Login';
import AdminLayout from './components/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import Teams from './pages/admin/Teams';
import Referees from './pages/admin/Referees';
import Championships from './pages/admin/Championships';
import Matches from './pages/admin/Matches';
import MatchLive from './pages/admin/MatchLive';

// Mock data & icons
import { initialMatches, initialTeams, initialLeaders } from './data/mockData';
import { Sparkles, Calendar, MapPin, ShieldAlert, Globe, Lock, ArrowRight, UserCheck } from 'lucide-react';

// Authentication Guard Component
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-[#070707] text-gray-100 flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-orange-500/20 border-t-[#F57C00] animate-spin" />
      </div>
    );
  }
  return isAuthenticated ? children : <Navigate to="/login" />;
}

// ----------------------------------------------------
// Public SPA Component
// ----------------------------------------------------
function PublicSPA() {
  const [activeTab, setActiveTab] = useState('inicio');
  const [statsTab, setStatsTab] = useState('clasificacion');
  const [selectedRound, setSelectedRound] = useState(6);
  
  // Data states
  const [matches, setMatches] = useState(initialMatches);
  const [teams, setTeams] = useState(initialTeams);
  const [leaders, setLeaders] = useState(initialLeaders);

  // Modal states
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [sheetMatch, setSheetMatch] = useState(null);
  const [toast, setToast] = useState(null);

  const { isAuthenticated } = useAuth();

  // Simulated live score changes (WOW Factor)
  useEffect(() => {
    const interval = setInterval(() => {
      const liveMatches = matches.filter(m => m.status === 'LIVE');
      if (liveMatches.length === 0) return;

      const randomIdx = Math.floor(Math.random() * liveMatches.length);
      const matchToUpdate = liveMatches[randomIdx];

      const points = Math.floor(Math.random() * 3) + 1;
      const isHomeScoring = Math.random() > 0.45;
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

            sec -= 15;
            if (sec < 0) {
              sec = 59;
              min -= 1;
            }
            if (min < 0) {
              min = 10;
              updatedMatch.quarter = updatedMatch.quarter === '1er Cuarto' ? '2do Cuarto' 
                : updatedMatch.quarter === '2do Cuarto' ? '3er Cuarto'
                : updatedMatch.quarter === '3er Cuarto' ? '4to Cuarto' : 'Finalizado';
              if (updatedMatch.quarter === 'Finalizado') {
                updatedMatch.status = 'FINISHED';
              }
            }

            updatedMatch.timeLeft = `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;

            if (updatedMatch.status === 'FINISHED') return updatedMatch;

            if (isFoul) {
              if (isHomeFoul && m.homeFouls < 5) {
                updatedMatch.homeFouls += 1;
                updatedMatch.events = [...m.events, {
                  id: `e-f-${Date.now()}`,
                  time: updatedMatch.timeLeft,
                  type: 'foul',
                  team: m.homeTeam,
                  player: 'Defensa Colectiva',
                  description: `Falta colectiva de ${homeTeamData.name} (${updatedMatch.homeFouls}/5)`
                }];
                if (updatedMatch.homeFouls >= 5) {
                  showToast(`⚠️ ¡Bono de tiros libres para ${awayTeamData.name}! Faltas colectivas de ${homeTeamData.name} al límite.`);
                }
              } else if (!isHomeFoul && m.awayFouls < 5) {
                updatedMatch.awayFouls += 1;
                updatedMatch.events = [...m.events, {
                  id: `e-f-${Date.now()}`,
                  time: updatedMatch.timeLeft,
                  type: 'foul',
                  team: m.awayTeam,
                  player: 'Defensa Colectiva',
                  description: `Falta colectiva de ${awayTeamData.name} (${updatedMatch.awayFouls}/5)`
                }];
                if (updatedMatch.awayFouls >= 5) {
                  showToast(`⚠️ ¡Bono de tiros libres para ${homeTeamData.name}! Faltas colectivas de ${awayTeamData.name} al límite.`);
                }
              }
            } else {
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

            if (sheetMatch && sheetMatch.id === m.id) {
              setSheetMatch(updatedMatch);
            }
            return updatedMatch;
          }
          return m;
        })
      );
    }, 8500);

    return () => clearInterval(interval);
  }, [matches, teams, leaders, sheetMatch]);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3500);
  };

  const getTeam = (teamId) => teams.find(t => t.id === teamId) || {};
  const filteredMatches = matches.filter(m => m.round === selectedRound);
  const liveCount = matches.filter(m => m.status === 'LIVE').length;
  const featuredLiveMatch = matches.find(m => m.id === 'match-live-1') || matches[0];

  return (
    <div className="relative min-h-screen bg-[#050505] text-gray-100 flex flex-col items-center">
      <div className="w-full max-w-md bg-[#050505] min-h-screen flex flex-col pb-24 shadow-2xl relative">
        
        {toast && (
          <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50 w-80 max-w-xs bg-gradient-to-r from-orange-600 to-amber-600 text-black font-extrabold text-xs px-4 py-3 rounded-2xl shadow-[0_10px_25px_rgba(245,124,0,0.4)] flex items-center space-x-2 border border-orange-400 animate-slide-down">
            <span className="text-sm">📣</span>
            <p className="flex-1 leading-tight">{toast}</p>
          </div>
        )}

        <Header liveCount={liveCount} />

        <main className="flex-1 px-4 py-4 space-y-4">
          {activeTab === 'inicio' && (
            <div className="space-y-4 animate-fade-in">
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#121212] to-[#080808] border border-[#161616] p-5">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500 opacity-5 blur-2xl rounded-full" />
                <span className="inline-flex items-center space-x-1 bg-orange-500/10 border border-orange-500/20 text-[9px] font-extrabold text-[#f57c00] px-2 py-0.5 rounded-full uppercase tracking-wider mb-2">
                  <Sparkles className="w-3 h-3 mr-1" /> Oficial PWA 2026
                </span>
                
                <h1 className="text-xl font-extrabold text-white tracking-tight leading-tight">
                  GameTime: Marcadores & Gestión Total
                </h1>
                
                <p className="text-xs text-gray-400 mt-1 leading-normal">
                  Sigue el Torneo de Invierno Pifo 2026 en tiempo real. Marcadores oficiales, actas en vivo, tablas y la gestión integral de la mesa técnica.
                </p>

                <div className="mt-3.5 flex items-center space-x-2 bg-[#121212] border border-[#222] rounded-2xl px-3 py-2 w-fit">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
                  </span>
                  <span className="text-[10px] font-bold text-gray-300">
                    {liveCount} partidos activos en el Coliseo Pifo
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] uppercase font-bold text-gray-500 tracking-widest text-left">
                  Live Game Center
                </span>
                <span className="text-[9px] text-[#f57c00] font-bold uppercase tracking-widest flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse mr-1" /> Destacado
                </span>
              </div>

              <LiveGameCard
                match={featuredLiveMatch}
                homeTeamData={getTeam(featuredLiveMatch.homeTeam)}
                awayTeamData={getTeam(featuredLiveMatch.awayTeam)}
                onOpenSheet={() => {
                  setSheetMatch(featuredLiveMatch);
                  setIsSheetOpen(true);
                }}
              />

              <Sponsors />
            </div>
          )}

          {activeTab === 'marcadores' && (
            <div className="space-y-4 animate-fade-in">
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold text-gray-500 tracking-widest px-1 block text-left">
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

              <div className="space-y-3">
                {filteredMatches.length === 0 ? (
                  <div className="text-center py-10 bg-[#0d0d0d] border border-[#161616] rounded-2xl text-xs text-gray-500 font-bold">
                    No hay partidos programados.
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
                              <span className="text-[9px] font-bold text-[#1976D2] uppercase tracking-widest bg-blue-500/10 px-1.5 py-0.2 rounded border border-blue-500/25">
                                PROGRAMADO
                              </span>
                            )}
                          </div>
                          <span className="text-[9px] text-gray-500 font-mono">{m.date}</span>
                        </div>

                        <div className="grid grid-cols-5 items-center py-1">
                          <div className="col-span-2 flex items-center space-x-2">
                            <span className={`w-6 h-6 rounded-full bg-gradient-to-tr ${home.logoColor} flex items-center justify-center font-black text-[9px] text-white`}>
                              {home.shortName}
                            </span>
                            <span className="text-xs font-black text-white truncate">{home.name}</span>
                          </div>

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

                          <div className="col-span-2 flex items-center justify-end space-x-2">
                            <span className="text-xs font-black text-white truncate text-right">{away.name}</span>
                            <span className={`w-6 h-6 rounded-full bg-gradient-to-tr ${away.logoColor} flex items-center justify-center font-black text-[9px] text-white`}>
                              {away.shortName}
                            </span>
                          </div>
                        </div>

                        <div className="mt-2.5 pt-2 border-t border-[#121212] flex items-center justify-between text-[9px] text-gray-500 font-bold">
                          <span className="flex items-center">
                            <MapPin className="w-3 h-3 mr-1" /> {m.court}
                          </span>
                          <span>Ref: {m.referee}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {activeTab === 'tablas' && (
            <div className="space-y-4 animate-fade-in">
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

              {statsTab === 'clasificacion' ? (
                <StandingsTab teams={teams} />
              ) : (
                <LeadersTab leaders={leaders} />
              )}
            </div>
          )}

          {activeTab === 'miequipo' && (
            <div className="animate-fade-in">
              <MyTeamTab />
            </div>
          )}

          {activeTab === 'admin' && (
            <div className="animate-fade-in space-y-6 text-center py-8">
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#121212] to-[#0a0a0a] border border-[#1e1e1e] p-6 flex flex-col items-center space-y-4">
                <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center border border-orange-500/20 text-[#F57C00]">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="text-base font-black text-white">Panel Administrativo Protegido</h3>
                <p className="text-xs text-gray-400 max-w-xs leading-relaxed">
                  Para ingresar a la gestión del campeonato de equipos, sorteos de fixture y actas digitales, debes autenticarte.
                </p>
                
                {isAuthenticated ? (
                  <Link
                    to="/admin"
                    className="inline-flex items-center space-x-2 px-5 py-3 bg-gradient-to-r from-orange-500 to-amber-600 text-black font-extrabold text-xs rounded-xl shadow-md transition-all"
                  >
                    <span>Ir al Panel</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <Link
                    to="/login"
                    className="inline-flex items-center space-x-2 px-5 py-3 bg-gradient-to-r from-orange-500 to-amber-600 text-black font-extrabold text-xs rounded-xl shadow-md transition-all animate-pulse"
                  >
                    <span>Iniciar Sesión</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </div>
          )}
        </main>

        <footer className="border-t border-[#121212] bg-[#070707] py-6 px-4 text-center space-y-3">
          <div className="flex justify-center space-x-4 text-gray-500">
            <a href="#" className="hover:text-basketball transition-colors"><Globe className="w-4 h-4" /></a>
          </div>
          <div className="space-y-1">
            <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider">GameTime PWA v2.0</span>
            <span className="block text-[9px] text-gray-600 font-semibold leading-relaxed">
              Desarrollado para la Directiva del Torneo de Invierno Pifo 2026. Todos los derechos reservados.
            </span>
          </div>
        </footer>

        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

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

// ----------------------------------------------------
// Main App Component Routing
// ----------------------------------------------------
export default function App() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<PublicSPA />} />
      <Route path="/login" element={<Login />} />

      {/* Admin Panel Pages Protected by Guard */}
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="teams" element={<Teams />} />
        <Route path="referees" element={<Referees />} />
        <Route path="championships" element={<Championships />} />
        <Route path="matches" element={<Matches />} />
        <Route path="matches/:id/live" element={<MatchLive />} />
      </Route>

      {/* Fallback redirect */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
