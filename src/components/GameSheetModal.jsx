import React from 'react';
import { X, Play, Clock, ShieldAlert, Award } from 'lucide-react';

export default function GameSheetModal({ isOpen, onClose, match, homeTeamData, awayTeamData }) {
  if (!isOpen) return null;

  // Quarters score breakdown
  const quarters = [
    { name: '1C', home: 18, away: 16 },
    { name: '2C', home: 20, away: 18 },
    { name: '3C', home: match.homeScore - 38, away: match.awayScore - 34 },
    { name: '4C', home: '-', away: '-' }
  ];

  // Mock players stats for the game
  const homePlayers = [
    { name: 'M. Gómez', pts: 18, fouls: 2, number: 7 },
    { name: 'D. Valencia', pts: 12, fouls: 1, number: 10 },
    { name: 'L. Benavides', pts: 8, fouls: 3, number: 15 },
    { name: 'J. Carabalí', pts: 10, fouls: 4, number: 33 },
    { name: 'A. Ibarra', pts: 8, fouls: 2, number: 22 }
  ];

  const awayPlayers = [
    { name: 'Juan Pérez', pts: 24, fouls: 3, number: 9 },
    { name: 'Carlos Díaz', pts: 12, fouls: 2, number: 4 },
    { name: 'Andrés Rosero', pts: 6, fouls: 4, number: 12 },
    { name: 'Diego Mejía', pts: 8, fouls: 1, number: 11 },
    { name: 'Javier Luna', pts: 2, fouls: 5, number: 14 } // Expulsado
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black bg-opacity-75 backdrop-blur-sm p-0 sm:p-4">
      {/* Backdrop tap to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative w-full max-w-md bg-[#090909] border-t border-[#1a1a1a] sm:border sm:rounded-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.9)] overflow-hidden max-h-[88vh] flex flex-col animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-[#121212] bg-[#0c0c0c]">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-basketball animate-pulse" />
              <h3 className="font-extrabold text-sm uppercase tracking-wider text-white">
                Acta Digital Oficial
              </h3>
            </div>
            <p className="text-[10px] text-gray-500 font-bold tracking-wide">
              Quito WINTER CUP 2026 • ID: {match.id}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-[#161616] border border-[#222] text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content - Scrollable */}
        <div className="p-4 space-y-5 overflow-y-auto flex-1 pb-10">
          {/* Team vs Team Header */}
          <div className="grid grid-cols-3 items-center py-2 bg-[#0c0c0c] border border-[#161616] rounded-2xl p-3">
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full bg-gradient-to-tr ${homeTeamData.logoColor} flex items-center justify-center font-black text-sm text-white`}>
                {homeTeamData.shortName}
              </div>
              <span className="text-xs font-black text-white mt-1 text-center truncate w-full">
                {homeTeamData.name}
              </span>
              <span className="text-[10px] text-gray-500 font-bold">Local</span>
            </div>

            <div className="flex flex-col items-center justify-center">
              <span className="text-[9px] uppercase font-extrabold text-basketball tracking-widest bg-basketball bg-opacity-10 px-2 py-0.5 rounded border border-basketball border-opacity-20 animate-pulse mb-1">
                {match.quarter}
              </span>
              <div className="flex items-center space-x-1">
                <span className="text-2xl font-black text-white tracking-tighter">
                  {match.homeScore}
                </span>
                <span className="text-xs text-gray-600 font-bold">-</span>
                <span className="text-2xl font-black text-white tracking-tighter">
                  {match.awayScore}
                </span>
              </div>
              <span className="text-[10px] text-gray-400 font-mono mt-1 bg-[#161616] px-2 py-0.5 rounded flex items-center">
                <Clock className="w-3 h-3 mr-1 text-basketball" /> {match.timeLeft}
              </span>
            </div>

            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full bg-gradient-to-tr ${awayTeamData.logoColor} flex items-center justify-center font-black text-sm text-white`}>
                {awayTeamData.shortName}
              </div>
              <span className="text-xs font-black text-white mt-1 text-center truncate w-full">
                {awayTeamData.name}
              </span>
              <span className="text-[10px] text-gray-500 font-bold">Visita</span>
            </div>
          </div>

          {/* Quarters Grid */}
          <div className="space-y-2">
            <h4 className="text-[10px] uppercase font-bold text-gray-500 tracking-widest">
              Puntaje por Cuartos
            </h4>
            <div className="grid grid-cols-4 gap-2 text-center">
              {quarters.map((q, i) => (
                <div key={i} className="bg-[#0c0c0c] border border-[#161616] rounded-xl p-2">
                  <span className="block text-[10px] font-bold text-gray-500">{q.name}</span>
                  <div className="flex justify-center items-center space-x-1 mt-1">
                    <span className="text-xs font-bold text-white">{q.home}</span>
                    <span className="text-[10px] text-gray-600">:</span>
                    <span className="text-xs font-bold text-white">{q.away}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Live Chronology / Timeline */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] uppercase font-bold text-gray-500 tracking-widest">
                Cronología de Eventos
              </h4>
              <span className="text-[9px] text-green-500 font-bold uppercase flex items-center bg-green-500 bg-opacity-10 border border-green-500 border-opacity-35 px-1.5 py-0.5 rounded">
                <Play className="w-2.5 h-2.5 mr-1 fill-green-500" /> Transmisión
              </span>
            </div>
            
            <div className="bg-[#0c0c0c] border border-[#161616] rounded-2xl p-3 max-h-48 overflow-y-auto space-y-3">
              {match.events.length === 0 ? (
                <div className="text-center py-6 text-xs text-gray-500 font-bold">
                  Comenzando el partido. No hay eventos registrados aún.
                </div>
              ) : (
                match.events.slice().reverse().map((event, idx) => {
                  const isHome = event.team === match.homeTeam;
                  return (
                    <div key={event.id || idx} className="flex items-start space-x-2 text-xs border-b border-[#161616] pb-2 last:border-b-0 last:pb-0">
                      <span className="font-mono text-basketball bg-[#1c1c1c] px-1.5 py-0.5 rounded text-[10px]">
                        {event.time}
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white text-[11px]">{event.player}</span>
                          {event.score && (
                            <span className="text-[10px] bg-electric bg-opacity-10 border border-electric border-opacity-35 text-electric px-1.5 rounded font-bold font-mono">
                              {event.score}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-gray-400 mt-0.5">{event.description}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Players stats cards (Two Tabs side-by-side) */}
          <div className="space-y-3">
            <h4 className="text-[10px] uppercase font-bold text-gray-500 tracking-widest">
              Estadísticas Individuales
            </h4>
            
            <div className="grid grid-cols-2 gap-3">
              {/* Home stats */}
              <div className="bg-[#0c0c0c] border border-[#161616] rounded-2xl p-3">
                <div className="flex items-center space-x-2 border-b border-[#161616] pb-1.5 mb-2">
                  <span className={`w-3 h-3 rounded-full bg-gradient-to-tr ${homeTeamData.logoColor}`} />
                  <span className="text-[11px] font-black text-white truncate">{homeTeamData.name}</span>
                </div>
                <div className="space-y-2">
                  {homePlayers.map((p, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <span className="text-gray-400 font-bold truncate pr-1">
                        #{p.number} {p.name.split(' ')[1] || p.name}
                      </span>
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <span className="font-extrabold text-white text-[11px]">{p.pts} PTS</span>
                        <span className={`text-[10px] px-1 rounded font-bold ${p.fouls >= 5 ? 'bg-red-900 bg-opacity-30 border border-red-500 text-red-500' : 'bg-[#1c1c1c] text-gray-500'}`}>
                          {p.fouls}F
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Away stats */}
              <div className="bg-[#0c0c0c] border border-[#161616] rounded-2xl p-3">
                <div className="flex items-center space-x-2 border-b border-[#161616] pb-1.5 mb-2">
                  <span className={`w-3 h-3 rounded-full bg-gradient-to-tr ${awayTeamData.logoColor}`} />
                  <span className="text-[11px] font-black text-white truncate">{awayTeamData.name}</span>
                </div>
                <div className="space-y-2">
                  {awayPlayers.map((p, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <span className="text-gray-400 font-bold truncate pr-1">
                        #{p.number} {p.name.split(' ')[1] || p.name}
                      </span>
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <span className="font-extrabold text-white text-[11px]">{p.pts} PTS</span>
                        <span className={`text-[10px] px-1 rounded font-bold ${p.fouls >= 5 ? 'bg-red-500 bg-opacity-20 border border-red-500 text-red-500 font-extrabold' : 'bg-[#1c1c1c] text-gray-500'}`}>
                          {p.fouls}F
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Bottom */}
        <div className="border-t border-[#121212] bg-[#0c0c0c] p-3 flex items-center justify-between">
          <div className="flex items-center text-gray-500 text-[10px] font-bold">
            <Award className="w-3.5 h-3.5 text-basketball mr-1" /> Mesa de Control Activa
          </div>
          <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wide bg-[#161616] border border-[#222] px-2 py-1 rounded-lg">
            Árbitro: {match.referee}
          </span>
        </div>
      </div>
    </div>
  );
}
