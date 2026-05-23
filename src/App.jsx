import React, { useState, useEffect, useRef } from 'react';
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
import ThreeBasketball from './components/ThreeBasketball';
import Lightning from './components/Lightning';

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
import { Sparkles, Calendar, MapPin, Globe, Lock, ArrowRight, Trophy, ShieldAlert, Award, Instagram, Facebook, Youtube } from 'lucide-react';

// Authentication Guard Component
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] text-gray-100 flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-orange-500/20 border-t-[#F57C00] animate-spin" />
      </div>
    );
  }
  return isAuthenticated ? children : <Navigate to="/login" />;
}

// Real team logo mappings
const realTeams = [
  { id: 'cbi', name: 'CBI Latacunga', logo: '/CBI.jpeg' },
  { id: 'om', name: 'OM Basketball', logo: '/OM_basketball.jpeg' },
  { id: 'ambato', name: 'Ambato City', logo: '/ambato_city.png' },
  { id: 'canutos', name: 'Canutos BC', logo: '/canutos.jpeg' },
  { id: 'cotopaxi', name: 'Cotopaxi Élite', logo: '/cotopaxi_elite.jpeg' },
  { id: 'drackar', name: 'Drackar Club', logo: '/drackar.jpeg' },
  { id: 'fenix', name: 'Fénix BC', logo: '/fenix_bc.jpeg' },
  { id: 'golden', name: 'Golden Kings', logo: '/golden_kings.jpeg' },
  { id: 'juanchos', name: 'Juanchos Club', logo: '/juanchos.png' },
  { id: 'npi', name: 'NPI Basketball', logo: '/npi.jpeg' },
  { id: 'ramoncinos', name: 'Ramoncinos', logo: '/team_ramoncinos.jpeg' },
  { id: 'salcedo', name: 'Team Salcedo', logo: '/team_salcedo.png' },
  { id: 'tnt', name: 'TNT Club', logo: '/tnt.png' }
];

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
  const [stopScroll, setStopScroll] = useState(false);

  const { isAuthenticated } = useAuth();

  // Scroll target refs for Navigation
  const inicioRef = useRef(null);
  const marcadoresRef = useRef(null);
  const equiposRef = useRef(null);
  const tablasRef = useRef(null);
  const miequipoRef = useRef(null);
  const adminRef = useRef(null);

  // Smooth scroll helper
  const scrollToSection = (id) => {
    const refs = {
      inicio: inicioRef,
      marcadores: marcadoresRef,
      equipos: equiposRef,
      tablas: tablasRef,
      miequipo: miequipoRef,
      admin: adminRef
    };
    const targetRef = refs[id];
    if (targetRef && targetRef.current) {
      targetRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveTab(id);
    }
  };

  // Intersection Observer to highlight active section on scroll
  useEffect(() => {
    const sections = [
      { id: 'inicio', ref: inicioRef },
      { id: 'marcadores', ref: marcadoresRef },
      { id: 'equipos', ref: equiposRef },
      { id: 'tablas', ref: tablasRef },
      { id: 'miequipo', ref: miequipoRef },
      { id: 'admin', ref: adminRef }
    ];

    const observerOptions = {
      root: null,
      rootMargin: '-30% 0px -40% 0px', // Trigger when section occupies the middle of the screen
      threshold: 0.1
    };

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveTab(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    sections.forEach((sec) => {
      if (sec.ref.current) observer.observe(sec.ref.current);
    });

    return () => {
      sections.forEach((sec) => {
        if (sec.ref.current) observer.unobserve(sec.ref.current);
      });
    };
  }, []);

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
                  description: `Falta colectiva de ${homeTeamData ? homeTeamData.name : 'Local'} (${updatedMatch.homeFouls}/5)`
                }];
                if (updatedMatch.homeFouls >= 5) {
                  showToast(`⚠️ ¡Bono de tiros libres para ${awayTeamData ? awayTeamData.name : 'Visitante'}! Faltas colectivas de ${homeTeamData ? homeTeamData.name : 'Local'} al límite.`);
                }
              } else if (!isHomeFoul && m.awayFouls < 5) {
                updatedMatch.awayFouls += 1;
                updatedMatch.events = [...m.events, {
                  id: `e-f-${Date.now()}`,
                  time: updatedMatch.timeLeft,
                  type: 'foul',
                  team: m.awayTeam,
                  player: 'Defensa Colectiva',
                  description: `Falta colectiva de ${awayTeamData ? awayTeamData.name : 'Visitante'} (${updatedMatch.awayFouls}/5)`
                }];
                if (updatedMatch.awayFouls >= 5) {
                  showToast(`⚠️ ¡Bono de tiros libres para ${homeTeamData ? homeTeamData.name : 'Local'}! Faltas colectivas de ${awayTeamData ? awayTeamData.name : 'Visitante'} al límite.`);
                }
              }
            } else {
              if (isHomeScoring) {
                updatedMatch.homeScore += points;
                const scoreDesc = points === 3 ? '¡Triple ESPECTACULAR!' : points === 2 ? 'Bandeja en la pintura' : 'Tiro libre cobrado';
                const scorers = leaders.scorers.filter(s => s.team === (homeTeamData ? homeTeamData.name : ''));
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
                showToast(`🏀 ¡Puntos para ${homeTeamData ? homeTeamData.name : 'Local'}! ${scorerName} anotó ${points} pts. (${updatedMatch.homeScore} - ${updatedMatch.awayScore})`);
              } else {
                updatedMatch.awayScore += points;
                const scoreDesc = points === 3 ? '¡Triple LETAL!' : points === 2 ? 'Volcada brutal' : 'Tiro libre cobrado';
                const scorers = leaders.scorers.filter(s => s.team === (awayTeamData ? awayTeamData.name : ''));
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
                showToast(`🏀 ¡Puntos para ${awayTeamData ? awayTeamData.name : 'Visitante'}! ${scorerName} anotó ${points} pts. (${updatedMatch.homeScore} - ${updatedMatch.awayScore})`);
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
    <div className="relative min-h-screen bg-darkbg text-gray-100 overflow-x-hidden">

      {/* 3D Canvas Background (Fijo de fondo) */}
      <ThreeBasketball />

      {/* Dynamic Electric Lightning WebGL Background (Solicitado por el usuario) */}
      <div className="fixed inset-0 w-full h-full z-0 pointer-events-none opacity-30">
        <Lightning
          hue={219}
          xOffset={0}
          speed={0.4}
          intensity={2.2}
          size={1}
        />
      </div>

      {/* Floating Sunset Glow Background elements */}
      <div className="absolute top-0 right-0 w-[40vw] h-[60vh] bg-gradient-to-br from-basketball-dark to-transparent opacity-15 blur-3xl pointer-events-none z-0" />
      <div className="absolute top-[80vh] left-0 w-[30vw] h-[50vh] bg-gradient-to-tr from-electric-dark to-transparent opacity-10 blur-3xl pointer-events-none z-0" />

      {/* Content wrapper with relative z-10 to render above the canvas */}
      <div className="relative z-10 w-full min-h-screen flex flex-col">

        {/* 1. Header Responsivo */}
        {/* Desktop Header */}
        <header className="hidden md:flex fixed top-0 left-0 right-0 z-50 bg-[#02040a]/80 backdrop-blur-xl border-b border-gray-900/60 px-8 py-4 justify-between items-center transition-all duration-300">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => scrollToSection('inicio')}>
            <img src="/logo_game_time.png" alt="GameTime Logo" className="w-10 h-10 object-contain drop-shadow-[0_0_8px_rgba(245,124,0,0.3)]" />
            <div>
              <span className="font-extrabold text-xl tracking-wider text-white">
                GAME<span className="text-basketball">TIME</span>
              </span>
              <span className="block text-[8px] text-[#FFB74D] font-bold uppercase tracking-widest leading-none">
                Latacunga / Pifo 2026
              </span>
            </div>
          </div>

          <nav className="flex space-x-1">
            {[
              { id: 'inicio', label: 'Inicio' },
              { id: 'marcadores', label: 'Torneo' },
              { id: 'equipos', label: 'Equipos' },
              { id: 'tablas', label: 'Tablas' },
              { id: 'miequipo', label: 'Mi Equipo' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === item.id
                    ? 'bg-basketball text-black font-extrabold shadow-[0_0_15px_rgba(245,124,0,0.3)]'
                    : 'text-gray-400 hover:text-white hover:bg-gray-900/40'
                  }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center space-x-4">
            {liveCount > 0 && (
              <div className="flex items-center space-x-1.5 bg-[#f57c00]/10 border border-[#f57c00]/30 px-3 py-1 rounded-full animate-pulse-slow">
                <span className="w-2.5 h-2.5 rounded-full bg-basketball shadow-[0_0_8px_#f57c00]" />
                <span className="text-[10px] font-bold text-basketball tracking-wider uppercase">
                  {liveCount} En Vivo
                </span>
              </div>
            )}

            <Link
              to={isAuthenticated ? "/admin" : "/login"}
              className="flex items-center space-x-1.5 px-4 py-2 border border-orange-500/20 hover:border-orange-500/50 bg-[#0d0d0d]/80 rounded-xl text-xs font-bold text-gray-300 hover:text-white transition-all"
            >
              <Lock className="w-3.5 h-3.5 text-basketball" />
              <span>{isAuthenticated ? "Panel Admin" : "Iniciar Sesión"}</span>
            </Link>
          </div>
        </header>

        {/* Mobile Header */}
        <div className="md:hidden">
          <Header liveCount={liveCount} />
        </div>

        {/* Dynamic Toast for scoring */}
        {toast && (
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 w-80 max-w-xs bg-gradient-to-r from-orange-600 to-amber-600 text-black font-extrabold text-xs px-4 py-3 rounded-2xl shadow-[0_10px_25px_rgba(245,124,0,0.4)] flex items-center space-x-2 border border-orange-400 animate-slide-down">
            <span className="text-sm">📣</span>
            <p className="flex-1 leading-tight">{toast}</p>
          </div>
        )}

        {/* Main Content Layout */}
        <main className="w-full min-h-screen flex flex-col md:pt-20">

          {/* SECTION 1: INICIO (HERO) */}
          <section
            id="inicio"
            ref={inicioRef}
            className="min-h-[calc(100vh-80px)] w-full flex flex-col justify-center items-center px-6 py-12 md:py-24 relative overflow-hidden"
          >
            {/* Backdrop Graphic elements: Volcan y Catedral stylizations */}
            <div className="absolute bottom-0 left-0 right-0 h-[45vh] pointer-events-none -z-10 select-none">
              {/* Silhouette illustration using SVG */}
              <svg viewBox="0 0 1440 320" className="absolute bottom-0 w-full h-full text-[#030612]/75 fill-currentColor" preserveAspectRatio="none">
                {/* Mountains */}
                <path d="M0,320 L150,220 L320,290 L500,160 L680,270 L850,140 L1050,260 L1200,210 L1440,320 Z" />
                {/* Church/Cathedral stylized silhouettes */}
                <path d="M220,320 L220,180 L235,180 L235,130 L242,130 L242,100 L245,100 L245,80 L248,100 L251,100 L251,130 L258,130 L258,180 L273,180 L273,320 Z" opacity="0.8" />
                <path d="M800,320 L800,150 L812,150 L812,110 L818,110 L818,80 L822,50 L826,80 L826,110 L832,110 L832,150 L844,150 L844,320 Z" opacity="0.5" />
              </svg>

              {/* Glowing basketball hoop background visual */}
              <svg viewBox="0 0 100 100" className="absolute right-4 md:right-32 bottom-20 w-44 h-44 text-orange-500/20 opacity-30 animate-pulse-slow">
                <circle cx="50" cy="30" r="18" fill="none" stroke="currentColor" strokeWidth="1.5" />
                <line x1="50" y1="48" x2="50" y2="90" stroke="currentColor" strokeWidth="2.5" />
                <rect x="32" y="10" width="36" height="24" fill="none" stroke="currentColor" strokeWidth="2" />
                <circle cx="50" cy="22" r="5" fill="none" stroke="currentColor" strokeWidth="1.5" />
                <path d="M42,30 Q50,45 58,30" fill="none" stroke="currentColor" strokeWidth="1" />
              </svg>

              {/* Glowing Sunset overlay effect behind the player silhouette */}
              <div className="absolute right-6 md:right-28 bottom-28 w-40 h-40 bg-orange-600/35 rounded-full blur-3xl" />
            </div>

            <div className="max-w-7xl w-full grid grid-cols-1 md:grid-cols-12 gap-8 items-center z-10">
              {/* Left side text column */}
              <div className="md:col-span-7 flex flex-col items-center md:items-start text-center md:text-left space-y-6">

                <div className="inline-flex items-center space-x-1 bg-orange-500/10 border border-orange-500/20 text-[10px] font-extrabold text-[#f57c00] px-3.5 py-1 rounded-full uppercase tracking-widest animate-float">
                  <Sparkles className="w-3.5 h-3.5 mr-1" /> Oficial PWA 2026
                </div>

                <div className="flex md:hidden items-center justify-center mb-2">
                  <img src="/logo_game_time.png" alt="Logo" className="w-32 h-32 object-contain filter drop-shadow-[0_0_12px_rgba(245,124,0,0.4)]" />
                </div>

                <div className="space-y-2">
                  <span className="block text-xs md:text-sm font-extrabold text-[#FFB74D] uppercase tracking-widest">
                    Campeonato de Basket
                  </span>
                  <h1 className="text-4xl md:text-7xl font-extrabold text-white tracking-tighter leading-none">
                    PASIÓN, EQUIPO <br />
                    Y <span className="text-transparent bg-clip-text bg-gradient-to-r from-basketball to-amber-500">VICTORIA</span>
                  </h1>
                </div>

                <p className="text-xs md:text-sm text-gray-400 max-w-lg leading-relaxed font-medium">
                  Sigue el Torneo de Invierno Pifo 2026 en tiempo real. Marcadores oficiales, actas en vivo de la mesa técnica y estadísticas individuales detalladas. El mejor baloncesto de la región se vive aquí.
                </p>

                <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
                  <button
                    onClick={() => scrollToSection('marcadores')}
                    className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-orange-500 to-amber-600 text-black font-extrabold text-xs rounded-2xl shadow-[0_5px_20px_rgba(245,124,0,0.35)] hover:shadow-[0_8px_25px_rgba(245,124,0,0.5)] transform hover:-translate-y-0.5 transition-all flex items-center justify-center space-x-2"
                  >
                    <Calendar className="w-4 h-4 stroke-[2.5]" />
                    <span>VER CALENDARIO</span>
                  </button>
                  <button
                    onClick={() => scrollToSection('equipos')}
                    className="w-full sm:w-auto px-8 py-3.5 border border-gray-800 hover:border-gray-600 bg-gray-950/50 hover:bg-gray-900/60 text-white font-extrabold text-xs rounded-2xl transition-all flex items-center justify-center space-x-2"
                  >
                    <span>CONOCE MÁS</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Informative Grid at the bottom of hero */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8 w-full border-t border-gray-900/40">
                  {[
                    { title: 'Competencia', desc: 'Niveles élite y amateur', val: '★ ÉLITE' },
                    { title: 'Equipos', desc: 'De toda la región', val: '13 CLUBES' },
                    { title: 'Fechas', desc: 'Mayo - Julio 2026', val: 'JORNADAS 1-12' },
                    { title: 'Sede', desc: 'Latacunga / Pifo, Ec', val: 'COLISEO PIFO' }
                  ].map((badge, idx) => (
                    <div key={idx} className="flex flex-col p-3 bg-gray-900/25 border border-gray-900/50 rounded-2xl text-left backdrop-blur-md">
                      <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">{badge.title}</span>
                      <span className="text-[10px] font-black text-white mt-0.5">{badge.val}</span>
                      <span className="text-[8px] text-gray-400 leading-none mt-0.5">{badge.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right side empty column on desktop (where the 3D ball rotates) */}
              <div className="hidden md:block md:col-span-5 h-[500px]" />
            </div>
          </section>

          {/* SECTION 2: MARCADORES (TORNEO) */}
          <section
            id="marcadores"
            ref={marcadoresRef}
            className="min-h-screen w-full flex flex-col justify-center py-16 px-6 relative"
          >
            <div className="max-w-3xl w-full mx-auto space-y-6 z-10">
              <div className="text-center">
                <span className="text-[10px] uppercase font-bold text-[#FFB74D] tracking-widest">
                  Live Game Center
                </span>
                <h2 className="text-2xl md:text-4xl font-extrabold text-white">
                  PARTIDOS EN VIVO Y CALENDARIO
                </h2>
                <div className="w-16 h-1 bg-basketball mx-auto mt-2 rounded-full" />
              </div>

              {/* Live Game Featured Card */}
              <div className="space-y-3">
                <span className="text-[9px] text-[#f57c00] font-black uppercase tracking-widest flex items-center px-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse mr-1.5" /> Partido Destacado
                </span>

                <LiveGameCard
                  match={featuredLiveMatch}
                  homeTeamData={getTeam(featuredLiveMatch.homeTeam)}
                  awayTeamData={getTeam(featuredLiveMatch.awayTeam)}
                  onOpenSheet={() => {
                    setSheetMatch(featuredLiveMatch);
                    setIsSheetOpen(true);
                  }}
                />
              </div>

              {/* Schedules and Filters */}
              <div className="space-y-4 pt-4">
                <div className="flex items-center justify-between border-b border-gray-900 pb-2">
                  <span className="text-[10px] uppercase font-bold text-gray-500 tracking-widest px-1">
                    Selecciona la Jornada
                  </span>

                  <div className="flex space-x-1.5 overflow-x-auto scrollbar-hide">
                    {[5, 6, 7].map((round) => (
                      <button
                        key={round}
                        onClick={() => setSelectedRound(round)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border ${selectedRound === round
                            ? 'bg-basketball text-black border-basketball shadow-[0_0_8px_rgba(245,124,0,0.3)]'
                            : 'bg-gray-950/60 text-gray-400 border-gray-900 hover:border-gray-800'
                          }`}
                      >
                        Jornada {round} {round === 6 && ' (En Curso)'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {filteredMatches.length === 0 ? (
                    <div className="text-center py-10 bg-gray-950/40 border border-gray-900 rounded-2xl text-xs text-gray-500 font-bold">
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
                          className={`bg-gray-950/50 border rounded-2xl p-4 flex flex-col justify-between transition-all duration-300 backdrop-blur-md ${m.status === 'LIVE'
                              ? 'border-basketball/30 hover:border-orange-500 cursor-pointer shadow-[0_0_12px_rgba(245,124,0,0.05)]'
                              : 'border-gray-900 hover:border-gray-800'
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
                              <span className={`w-7 h-7 rounded-full bg-gradient-to-tr ${home.logoColor} flex items-center justify-center font-black text-[10px] text-white`}>
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
                              <span className={`w-7 h-7 rounded-full bg-gradient-to-tr ${away.logoColor} flex items-center justify-center font-black text-[10px] text-white`}>
                                {away.shortName}
                              </span>
                            </div>
                          </div>

                          <div className="mt-2.5 pt-2 border-t border-gray-900/60 flex items-center justify-between text-[9px] text-gray-500 font-bold">
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
            </div>
          </section>

          {/* SECTION 3: EQUIPOS PARTICIPANTES */}
          <section
            id="equipos"
            ref={equiposRef}
            className="py-20 px-6 relative w-full overflow-hidden"
          >
            <div className="max-w-3xl w-full mx-auto text-center z-10 mb-12 space-y-4">
              <span className="text-[10px] uppercase font-bold text-[#FFB74D] tracking-widest">
                Clubes Registrados
              </span>
              <h2 className="text-2xl md:text-5xl font-extrabold text-white tracking-tight">
                EQUIPOS PARTICIPANTES
              </h2>
              <div className="w-16 h-1 bg-basketball mx-auto mt-2 rounded-full" />
              <p className="text-xs md:text-sm text-gray-400 mt-2 max-w-xl mx-auto leading-relaxed">
                Conoce a los 13 clubes deportivos oficiales que compiten en el Torneo de Invierno Pifo 2026 en el Coliseo Municipal.
              </p>
            </div>

            {/* Full Width Marquee Slider */}
            <div className="relative w-full z-10 mt-8">
              <style>{`
                .marquee-inner {
                    animation: marqueeScroll linear infinite;
                }

                @keyframes marqueeScroll {
                    0% {
                        transform: translateX(0%);
                    }

                    100% {
                        transform: translateX(-50%);
                    }
                }
            `}</style>

              <div className="overflow-hidden w-full relative max-w-7xl mx-auto" onMouseEnter={() => setStopScroll(true)} onMouseLeave={() => setStopScroll(false)}>
                {/* Fade-out gradients using deep navy blue matching the background */}
                <div className="absolute left-0 top-0 h-full w-28 z-10 pointer-events-none bg-gradient-to-r from-darkbg to-transparent" />
                <div className="marquee-inner flex w-fit" style={{ animationPlayState: stopScroll ? "paused" : "running", animationDuration: realTeams.length * 3500 + "ms" }}>
                  <div className="flex">
                    {[...realTeams, ...realTeams].map((team, index) => (
                      <div key={index} className="w-80 mx-5 h-80 bg-gray-950/40 border border-gray-900/80 rounded-[2.5rem] flex items-center justify-center relative group hover:scale-95 transition-all duration-300 overflow-hidden backdrop-blur-md">
                        <img
                          src={team.logo}
                          alt={team.name}
                          className="w-48 h-48 object-contain rounded-full border border-gray-800/60 p-3 bg-gray-900/80 group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                        <div className="flex flex-col items-center justify-center px-6 opacity-0 group-hover:opacity-100 transition-all duration-300 absolute inset-0 backdrop-blur-md bg-black/75">
                          <p className="text-white text-lg font-black text-center tracking-widest uppercase leading-snug">{team.name}</p>
                          <span className="text-[10px] text-[#FFB74D] font-bold uppercase tracking-widest mt-2">Club Oficial</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="absolute right-0 top-0 h-full w-28 z-10 pointer-events-none bg-gradient-to-l from-darkbg to-transparent" />
              </div>
            </div>
          </section>

          {/* SECTION 4: TABLAS Y ESTADÍSTICAS */}
          <section
            id="tablas"
            ref={tablasRef}
            className="min-h-screen w-full flex flex-col justify-center py-16 px-6 relative"
          >
            <div className="max-w-5xl w-full mx-auto space-y-6 z-10">
              <div className="text-center">
                <span className="text-[10px] uppercase font-bold text-[#FFB74D] tracking-widest">
                  Estadísticas del Torneo
                </span>
                <h2 className="text-2xl md:text-4xl font-extrabold text-white">
                  TABLA DE CLASIFICACIÓN Y LÍDERES
                </h2>
                <div className="w-16 h-1 bg-basketball mx-auto mt-2 rounded-full" />
              </div>

              {/* Tabs selector */}
              <div className="bg-gray-950/60 border border-gray-900 p-1.5 rounded-2xl flex max-w-sm mx-auto backdrop-blur-md">
                <button
                  onClick={() => setStatsTab('clasificacion')}
                  className={`flex-1 text-center py-2.5 rounded-xl text-xs font-extrabold transition-all ${statsTab === 'clasificacion'
                      ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-black shadow-md'
                      : 'text-gray-400 hover:text-white'
                    }`}
                >
                  Clasificación
                </button>
                <button
                  onClick={() => setStatsTab('lideres')}
                  className={`flex-1 text-center py-2.5 rounded-xl text-xs font-extrabold transition-all ${statsTab === 'lideres'
                      ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-black shadow-md'
                      : 'text-gray-400 hover:text-white'
                    }`}
                >
                  Líderes Individuales
                </button>
              </div>

              {/* Render Selected Stats Component */}
              <div className="bg-gray-950/30 rounded-3xl border border-gray-900/60 p-1 backdrop-blur-md">
                {statsTab === 'clasificacion' ? (
                  <StandingsTab teams={teams} />
                ) : (
                  <LeadersTab leaders={leaders} />
                )}
              </div>
            </div>
          </section>

          {/* SECTION 5: MI EQUIPO */}
          <section
            id="miequipo"
            ref={miequipoRef}
            className="min-h-screen w-full flex flex-col justify-center py-16 px-6 relative"
          >
            <div className="max-w-5xl w-full mx-auto space-y-6 z-10">
              <div className="text-center">
                <span className="text-[10px] uppercase font-bold text-[#FFB74D] tracking-widest">
                  Área del Jugador
                </span>
                <h2 className="text-2xl md:text-4xl font-extrabold text-white">
                  MI CLUB & PORTAL INTERNO
                </h2>
                <div className="w-16 h-1 bg-basketball mx-auto mt-2 rounded-full" />
                <p className="text-xs text-gray-400 mt-2 max-w-xl mx-auto leading-relaxed">
                  Panel informativo dedicado para los miembros inscritos de Avanzaré Club. Revisa entrenamientos, asiste a convocatorias y vota por el MVP.
                </p>
              </div>

              {/* MyTeam tab UI wrapper */}
              <div className="backdrop-blur-md rounded-3xl">
                <MyTeamTab />
              </div>
            </div>
          </section>

          {/* SECTION 6: PANEL ADMIN BANNER */}
          <section
            id="admin"
            ref={adminRef}
            className="py-20 px-6 relative"
          >
            <div className="max-w-3xl w-full mx-auto text-center z-10">
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-950/80 to-[#030614]/80 border border-gray-900/60 p-8 flex flex-col items-center space-y-4 backdrop-blur-xl">
                <div className="w-14 h-14 bg-orange-500/10 rounded-2xl flex items-center justify-center border border-orange-500/20 text-[#F57C00]">
                  <Lock className="w-7 h-7" />
                </div>
                <h3 className="text-lg md:text-2xl font-black text-white">Panel Administrativo Protegido</h3>
                <p className="text-xs text-gray-400 max-w-sm leading-relaxed">
                  Mesa técnica y árbitros registrados: Autentícate para administrar el ciclo de vida de los partidos en vivo, inscribir equipos y generar actas.
                </p>

                {isAuthenticated ? (
                  <Link
                    to="/admin"
                    className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-600 text-black font-extrabold text-xs rounded-xl shadow-md transition-all hover:scale-105"
                  >
                    <span>Ir al Panel de Control</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <Link
                    to="/login"
                    className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-600 text-black font-extrabold text-xs rounded-xl shadow-md transition-all hover:scale-105"
                  >
                    <span>Iniciar Sesión de Mesa</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-900/60 bg-[#02040a]/90 py-10 px-6 text-center space-y-4 z-10 backdrop-blur-md">
          <div className="flex justify-center space-x-6 text-gray-500 pb-2">
            <a href="#" className="hover:text-basketball transition-colors"><Instagram className="w-5 h-5" /></a>
            <a href="#" className="hover:text-basketball transition-colors"><Facebook className="w-5 h-5" /></a>
            <a href="#" className="hover:text-basketball transition-colors"><Youtube className="w-5 h-5" /></a>
          </div>
          <div className="space-y-1">
            <span className="block text-[10px] text-orange-500 font-bold uppercase tracking-widest">GameTime PWA v2.0 - 3D Experience</span>
            <span className="block text-[9px] text-gray-600 font-semibold max-w-md mx-auto leading-relaxed">
              Plataforma oficial desarrollada para la Directiva del Torneo de Invierno Pifo 2026. Todos los derechos reservados.
            </span>
          </div>
        </footer>

        {/* Mobile Navigation bar */}
        <div className="md:hidden">
          <BottomNav activeTab={activeTab} setActiveTab={scrollToSection} />
        </div>

        {/* Game Sheet Details Modal */}
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
