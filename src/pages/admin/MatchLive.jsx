import React, { useState, useEffect, useRef } from 'react';
import client from '../../api/client';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Loader2, Trophy, Clock, Swords, UserCheck, Flame, Plus, ShieldAlert, CheckCircle, ArrowLeft, RefreshCw
} from 'lucide-react';

export default function MatchLive() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Real-time audio or sound effect simulated triggers (toast notification)
  const [toast, setToast] = useState(null);

  const fetchMatchDetails = async () => {
    try {
      const res = await client.get(`/matches/${id}`);
      setMatch(res.data);
    } catch (err) {
      console.error('Error fetching live match details', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatchDetails();
    // Poll every 10 seconds to sync scoreboard
    const interval = setInterval(fetchMatchDetails, 10000);
    return () => clearInterval(interval);
  }, [id]);

  const triggerToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const handleAddScore = async (playerId, teamId, points) => {
    try {
      const res = await client.post(`/matches/${id}/score`, {
        player_id: playerId,
        team_id: teamId,
        points: points
      });
      triggerToast(`🏀 ¡Puntos anotados! +${points} pts.`);
      fetchMatchDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Error al registrar puntos');
    }
  };

  const handleAddFoul = async (playerId, teamId) => {
    try {
      const res = await client.post(`/matches/${id}/foul`, {
        player_id: playerId,
        team_id: teamId
      });
      
      const { is_ejected, fouls, team_fouls, foul_bonus_alert } = res.data;

      if (is_ejected) {
        triggerToast('🚨 ¡EXPULSIÓN! El jugador acumuló 5 faltas.');
      } else if (foul_bonus_alert) {
        triggerToast('⚠️ ¡BONUS DE TIROS LIBRES! 4 faltas colectivas acumuladas.');
      } else {
        triggerToast(`Falta personal registrada (${fouls}/5)`);
      }
      fetchMatchDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Error al registrar falta');
    }
  };

  const handleNextQuarter = async () => {
    if (match.current_quarter >= 4) {
      alert('Para finalizar el partido usa el botón de Finalizar Partido');
      return;
    }
    if (window.confirm(`¿Estás seguro de avanzar al siguiente cuarto? Faltas colectivas se reiniciarán.`)) {
      try {
        await client.post(`/matches/${id}/next-quarter`);
        triggerToast(`🚀 Período ${match.current_quarter + 1} Iniciado`);
        fetchMatchDetails();
      } catch (err) {
        alert('Error al avanzar período');
      }
    }
  };

  const handleFinishMatch = async () => {
    if (window.confirm('¿Estás seguro de finalizar el partido definitivamente? Esta acción actualizará la tabla de clasificación.')) {
      try {
        await client.post(`/matches/${id}/finish`);
        triggerToast('🏁 ¡Partido Finalizado!');
        navigate('/admin/matches');
      } catch (err) {
        alert('Error al finalizar el partido');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#F57C00]" />
      </div>
    );
  }

  if (!match) {
    return (
      <div className="text-center py-16 bg-[#0d0d0d] border border-[#1a1a1a] rounded-3xl text-gray-500 font-bold">
        Partido no encontrado
      </div>
    );
  }

  const homePlayers = match.players.filter(p => p.team_id === match.home_team_id);
  const awayPlayers = match.players.filter(p => p.team_id === match.away_team_id);

  return (
    <div className="space-y-6 max-w-7xl mx-auto relative pb-20">
      
      {/* Toast Alert popup */}
      {toast && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-xs bg-gradient-to-r from-orange-600 to-amber-600 text-black font-extrabold text-xs px-4 py-3 rounded-2xl shadow-[0_10px_30px_rgba(245,124,0,0.35)] flex items-center space-x-2 border border-orange-400 animate-slide-down">
          <span className="text-sm">📣</span>
          <p className="flex-1 leading-tight">{toast}</p>
        </div>
      )}

      {/* Navigation & Match title banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/admin/matches')}
            className="p-3 bg-[#0d0d0d] hover:bg-[#121212] border border-[#1a1a1a] rounded-2xl text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-white flex items-center space-x-2">
              <span>Acta Digital en Vivo</span>
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
            </h1>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">
              {match.championship_name} • Mesa Técnica
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchMatchDetails}
            className="p-3 bg-[#0d0d0d] hover:bg-[#121212] border border-[#1a1a1a] rounded-2xl text-gray-400 hover:text-white transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {match.current_quarter < 4 ? (
            <button
              onClick={handleNextQuarter}
              className="px-4 py-2.5 bg-[#121212] hover:bg-[#1a1a1a] border border-[#222] text-xs font-bold rounded-xl text-white transition-all"
            >
              Iniciar Siguiente Cuarto
            </button>
          ) : (
            <button
              onClick={handleFinishMatch}
              className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-black rounded-xl transition-all"
            >
              Finalizar Partido
            </button>
          )}
        </div>
      </div>

      {/* Main Scoreboard Display (WOW Factor) */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#121212] to-[#0a0a0a] border border-[#1e1e1e] rounded-3xl p-6 md:p-8 flex flex-col items-center justify-between gap-6 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-red-600 opacity-5 blur-[100px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-orange-500 opacity-5 blur-[100px] rounded-full" />

        {/* Quarter Clock Banner */}
        <div className="flex items-center space-x-2 bg-[#0d0d0d] border border-[#1a1a1a] px-4 py-2 rounded-2xl">
          <Clock className="w-4 h-4 text-[#F57C00]" />
          <span className="text-xs font-black text-white uppercase tracking-widest">
            {match.current_quarter}° Cuarto
          </span>
        </div>

        {/* Score Board matchup row */}
        <div className="w-full grid grid-cols-7 items-center max-w-3xl">
          {/* Home team metadata */}
          <div className="col-span-2 flex flex-col items-center space-y-2.5 text-center">
            <span className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${match.home_color} flex items-center justify-center font-black text-black text-lg border-2 border-[#1e1e1e] shadow-xl`}>
              {match.home_short}
            </span>
            <div>
              <p className="text-sm font-black text-white truncate max-w-[130px]">{match.home_team_name}</p>
              <p className="text-[10px] text-gray-500 uppercase font-mono">LADO LOCAL</p>
            </div>
            {/* Collective fouls warning indicator */}
            <div className={`mt-2 px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${
              match.home_fouls_q >= 4 
                ? 'bg-red-950/20 border-red-500/30 text-red-500 animate-pulse' 
                : 'bg-[#0d0d0d] border-[#1a1a1a] text-gray-400'
            }`}>
              {match.home_fouls_q >= 4 && <ShieldAlert className="w-3.5 h-3.5" />}
              <span>Faltas colectivas: {match.home_fouls_q}/4</span>
            </div>
          </div>

          {/* Home score */}
          <div className="col-span-1 text-right text-4xl md:text-6xl font-black font-mono tracking-tighter text-white">
            {match.home_score}
          </div>

          {/* VS Divider */}
          <div className="col-span-1 text-center font-mono text-gray-600 font-extrabold text-sm uppercase">
            vs
          </div>

          {/* Away score */}
          <div className="col-span-1 text-left text-4xl md:text-6xl font-black font-mono tracking-tighter text-white">
            {match.away_score}
          </div>

          {/* Away team metadata */}
          <div className="col-span-2 flex flex-col items-center space-y-2.5 text-center">
            <span className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${match.away_color} flex items-center justify-center font-black text-black text-lg border-2 border-[#1e1e1e] shadow-xl`}>
              {match.away_short}
            </span>
            <div>
              <p className="text-sm font-black text-white truncate max-w-[130px]">{match.away_team_name}</p>
              <p className="text-[10px] text-gray-500 uppercase font-mono">LADO VISITANTE</p>
            </div>
            {/* Collective fouls warning indicator */}
            <div className={`mt-2 px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${
              match.away_fouls_q >= 4 
                ? 'bg-red-950/20 border-red-500/30 text-red-500 animate-pulse' 
                : 'bg-[#0d0d0d] border-[#1a1a1a] text-gray-400'
            }`}>
              {match.away_fouls_q >= 4 && <ShieldAlert className="w-3.5 h-3.5" />}
              <span>Faltas colectivas: {match.away_fouls_q}/4</span>
            </div>
          </div>
        </div>

        {/* Referee officiating list bar */}
        <div className="w-full pt-4 border-t border-[#1a1a1a] flex justify-center text-[10px] text-gray-500 font-bold uppercase tracking-wider">
          <div className="flex items-center space-x-1.5">
            <UserCheck className="w-4 h-4 text-orange-500" />
            <span>Colegio Arbitral: {match.referee_name || 'Sin asignar'} {match.ref1_name && ` / Asistentes: ${match.ref1_name}, ${match.ref2_name}`}</span>
          </div>
        </div>
      </div>

      {/* Roster actions grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* HOME TEAM ROSTER CONTROL */}
        <div className="bg-[#0d0d0d] border border-[#1a1a1a] p-6 rounded-3xl space-y-4">
          <div className="flex items-center space-x-2 border-b border-[#121212] pb-3">
            <span className={`w-3.5 h-3.5 rounded-full bg-gradient-to-tr ${match.home_color}`} />
            <h3 className="text-sm font-black text-white">{match.home_team_name}</h3>
          </div>

          <div className="space-y-4">
            {homePlayers.map(player => (
              <div
                key={player.player_id}
                className={`p-4 border rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                  player.is_ejected 
                    ? 'bg-red-950/10 border-red-500/20 opacity-50' 
                    : 'bg-[#121212] border-[#1e1e1e] hover:border-orange-500/20'
                }`}
              >
                <div className="flex items-center space-x-3.5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm font-mono ${
                    player.is_ejected ? 'bg-red-600 text-white' : 'bg-orange-500/10 text-[#F57C00] border border-orange-500/20'
                  }`}>
                    #{player.number}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-white">{player.name}</span>
                      {player.is_ejected && (
                        <span className="text-[8px] bg-red-600 text-white font-extrabold uppercase px-1.5 py-0.2 rounded">Expulsado</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-[9px] font-bold uppercase tracking-wider text-gray-500">
                      <span>Faltas: {player.fouls}/5</span>
                      <span>• Puntos: {player.points}</span>
                    </div>
                  </div>
                </div>

                {/* Scorer Buttons */}
                {!player.is_ejected && (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleAddScore(player.player_id, match.home_team_id, 1)}
                      className="px-2.5 py-1.5 bg-[#0d0d0d] hover:bg-[#1a1a1a] border border-[#222] rounded-lg text-[9px] font-black text-white"
                    >
                      +1 FT
                    </button>
                    <button
                      onClick={() => handleAddScore(player.player_id, match.home_team_id, 2)}
                      className="px-2.5 py-1.5 bg-[#0d0d0d] hover:bg-[#1a1a1a] border border-[#222] rounded-lg text-[9px] font-black text-white"
                    >
                      +2 Pts
                    </button>
                    <button
                      onClick={() => handleAddScore(player.player_id, match.home_team_id, 3)}
                      className="px-2.5 py-1.5 bg-orange-500/10 hover:bg-[#F57C00] border border-orange-500/20 text-[#F57C00] hover:text-black font-black text-[9px] rounded-lg"
                    >
                      +3 Pts
                    </button>
                    <button
                      onClick={() => handleAddFoul(player.player_id, match.home_team_id)}
                      className="px-2.5 py-1.5 bg-red-950/20 hover:bg-red-600 hover:text-white border border-red-500/20 rounded-lg text-[9px] font-black text-red-400 transition-all"
                    >
                      +Falta
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* AWAY TEAM ROSTER CONTROL */}
        <div className="bg-[#0d0d0d] border border-[#1a1a1a] p-6 rounded-3xl space-y-4">
          <div className="flex items-center space-x-2 border-b border-[#121212] pb-3">
            <span className={`w-3.5 h-3.5 rounded-full bg-gradient-to-tr ${match.away_color}`} />
            <h3 className="text-sm font-black text-white">{match.away_team_name}</h3>
          </div>

          <div className="space-y-4">
            {awayPlayers.map(player => (
              <div
                key={player.player_id}
                className={`p-4 border rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                  player.is_ejected 
                    ? 'bg-red-950/10 border-red-500/20 opacity-50' 
                    : 'bg-[#121212] border-[#1e1e1e] hover:border-orange-500/20'
                }`}
              >
                <div className="flex items-center space-x-3.5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm font-mono ${
                    player.is_ejected ? 'bg-red-600 text-white' : 'bg-orange-500/10 text-[#F57C00] border border-orange-500/20'
                  }`}>
                    #{player.number}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-white">{player.name}</span>
                      {player.is_ejected && (
                        <span className="text-[8px] bg-red-600 text-white font-extrabold uppercase px-1.5 py-0.2 rounded">Expulsado</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-[9px] font-bold uppercase tracking-wider text-gray-500">
                      <span>Faltas: {player.fouls}/5</span>
                      <span>• Puntos: {player.points}</span>
                    </div>
                  </div>
                </div>

                {/* Scorer Buttons */}
                {!player.is_ejected && (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleAddScore(player.player_id, match.away_team_id, 1)}
                      className="px-2.5 py-1.5 bg-[#0d0d0d] hover:bg-[#1a1a1a] border border-[#222] rounded-lg text-[9px] font-black text-white"
                    >
                      +1 FT
                    </button>
                    <button
                      onClick={() => handleAddScore(player.player_id, match.away_team_id, 2)}
                      className="px-2.5 py-1.5 bg-[#0d0d0d] hover:bg-[#1a1a1a] border border-[#222] rounded-lg text-[9px] font-black text-white"
                    >
                      +2 Pts
                    </button>
                    <button
                      onClick={() => handleAddScore(player.player_id, match.away_team_id, 3)}
                      className="px-2.5 py-1.5 bg-orange-500/10 hover:bg-[#F57C00] border border-orange-500/20 text-[#F57C00] hover:text-black font-black text-[9px] rounded-lg"
                    >
                      +3 Pts
                    </button>
                    <button
                      onClick={() => handleAddFoul(player.player_id, match.away_team_id)}
                      className="px-2.5 py-1.5 bg-red-950/20 hover:bg-red-600 hover:text-white border border-red-500/20 rounded-lg text-[9px] font-black text-red-400 transition-all"
                    >
                      +Falta
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Live Match Events list box */}
      <div className="bg-[#0d0d0d] border border-[#1a1a1a] p-6 rounded-3xl space-y-4">
        <span className="text-xs uppercase font-bold text-gray-500 tracking-wider block">Bitácora Oficial de Sucesos</span>

        {match.events.length === 0 ? (
          <div className="text-center py-6 text-xs text-gray-500 font-bold bg-[#121212] border border-[#1e1e1e] rounded-2xl">
            Esperando sucesos de partido...
          </div>
        ) : (
          <div className="space-y-2.5 max-h-60 overflow-y-auto pr-2 divide-y divide-[#121212]">
            {match.events.slice().reverse().map((ev) => (
              <div key={ev.id} className="pt-2 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-mono text-gray-500 bg-[#121212] px-1.5 py-0.5 rounded border border-[#222]">C{ev.quarter}</span>
                  <span className="text-gray-300 font-bold">{ev.description}</span>
                </div>
                {ev.home_score_snapshot !== null && ev.away_score_snapshot !== null && (
                  <span className="text-[10px] font-mono text-gray-500">({ev.home_score_snapshot} - {ev.away_score_snapshot})</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
