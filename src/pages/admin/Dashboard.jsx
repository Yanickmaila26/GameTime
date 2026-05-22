import React, { useState, useEffect } from 'react';
import client from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { 
  Users, UserCheck, Trophy, Swords, Sparkles, Loader2, Calendar, ShieldCheck 
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    teams: 0,
    referees: 0,
    championships: 0,
    matches: 0,
    liveMatches: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [teamsRes, refsRes, champsRes, matchesRes] = await Promise.all([
          client.get('/teams'),
          client.get('/referees'),
          client.get('/championships'),
          client.get('/matches')
        ]);

        const matchesList = matchesRes.data;
        const liveCount = matchesList.filter(m => m.status === 'live').length;

        setStats({
          teams: teamsRes.data.length,
          referees: refsRes.data.length,
          championships: champsRes.data.length,
          matches: matchesList.length,
          liveMatches: liveCount
        });
      } catch (err) {
        console.error('Error fetching dashboard stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#F57C00]" />
      </div>
    );
  }

  const statCards = [
    { name: 'Equipos Registrados', value: stats.teams, icon: Users, color: 'from-blue-500 to-indigo-600' },
    { name: 'Árbitros Certificados', value: stats.referees, icon: UserCheck, color: 'from-emerald-500 to-teal-600' },
    { name: 'Campeonatos Activos', value: stats.championships, icon: Trophy, color: 'from-amber-500 to-orange-600' },
    { name: 'Partidos Totales', value: stats.matches, icon: Swords, color: 'from-rose-500 to-pink-600' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#121212] to-[#0a0a0a] border border-[#1e1e1e] p-6 md:p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#F57C00] opacity-5 blur-[80px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#1976D2] opacity-5 blur-[80px] rounded-full" />

        <div className="relative z-10 space-y-4">
          <span className="inline-flex items-center space-x-1 bg-orange-500/10 border border-orange-500/20 text-[10px] font-black text-[#F57C00] px-3 py-1 rounded-full uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 mr-1" /> Panel de Control Directivo
          </span>

          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            ¡Hola, {user?.name || 'Administrador'}!
          </h1>
          <p className="text-xs md:text-sm text-gray-400 max-w-2xl leading-relaxed">
            Bienvenido al panel de administración de <strong className="text-white">GameTime</strong>. Desde aquí puedes coordinar los equipos del torneo, definir los colegios arbitrales, sortear campeonatos y dirigir el acta digital del marcador en vivo en tiempo real.
          </p>

          <div className="flex flex-wrap gap-3">
            <div className="flex items-center space-x-2 bg-[#121212] border border-[#222] rounded-2xl px-4 py-2 text-xs font-bold text-gray-300">
              <ShieldCheck className="w-4 h-4 text-orange-500" />
              <span>Rol: {user?.role === 'admin' ? 'Administrador Principal' : 'Miembro Directiva'}</span>
            </div>
            {stats.liveMatches > 0 && (
              <div className="flex items-center space-x-2 bg-red-950/20 border border-red-500/30 rounded-2xl px-4 py-2 text-xs font-bold text-red-400">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
                </span>
                <span>{stats.liveMatches} Partidos en vivo actualmente</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Grid of stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-3xl p-6 flex items-center justify-between hover:border-orange-500/30 transition-all duration-300 group"
            >
              <div className="space-y-1">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{card.name}</p>
                <p className="text-3xl font-black text-white tracking-tight">{card.value}</p>
              </div>
              <div className={`w-12 h-12 bg-gradient-to-tr ${card.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="w-5 h-5 text-black" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick shortcuts */}
      <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-3xl p-6 space-y-4">
        <h2 className="text-sm font-black text-white uppercase tracking-widest text-gray-500 mb-2">
          Acciones Directas Rápidas
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <a
            href="/admin/teams"
            className="p-4 bg-[#121212] hover:bg-[#161616] border border-[#222] rounded-2xl flex flex-col items-center justify-center text-center space-y-2 group transition-all"
          >
            <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center group-hover:bg-orange-500/20 transition-colors">
              <Users className="w-5 h-5 text-[#F57C00]" />
            </div>
            <span className="text-xs font-bold text-white">Gestionar Equipos</span>
            <span className="text-[10px] text-gray-500">Crear y agregar jugadores</span>
          </a>
          <a
            href="/admin/championships"
            className="p-4 bg-[#121212] hover:bg-[#161616] border border-[#222] rounded-2xl flex flex-col items-center justify-center text-center space-y-2 group transition-all"
          >
            <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center group-hover:bg-orange-500/20 transition-colors">
              <Trophy className="w-5 h-5 text-[#F57C00]" />
            </div>
            <span className="text-xs font-bold text-white">Sorteo del Torneo</span>
            <span className="text-[10px] text-gray-500">Crear campeonatos y fixtures</span>
          </a>
          <a
            href="/admin/matches"
            className="p-4 bg-[#121212] hover:bg-[#161616] border border-[#222] rounded-2xl flex flex-col items-center justify-center text-center space-y-2 group transition-all"
          >
            <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center group-hover:bg-orange-500/20 transition-colors">
              <Swords className="w-5 h-5 text-[#F57C00]" />
            </div>
            <span className="text-xs font-bold text-white">Marcador en Vivo</span>
            <span className="text-[10px] text-gray-500">Iniciar partidos y estadísticas</span>
          </a>
        </div>
      </div>
    </div>
  );
}
