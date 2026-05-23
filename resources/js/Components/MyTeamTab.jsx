import React, { useState } from 'react';
import { Users, Award, Shield, Calendar, CheckCircle2, TrendingUp } from 'lucide-react';

const teamRoster = [
  { id: 'p1', name: 'D. Valencia', number: 10, pos: 'Base', ppg: 12.4, status: 'Activo' },
  { id: 'p2', name: 'M. Gómez', number: 7, pos: 'Escolta', ppg: 19.8, status: 'Activo' },
  { id: 'p3', name: 'L. Benavides', number: 15, pos: 'Alero', ppg: 8.2, status: 'Activo' },
  { id: 'p4', name: 'A. Ibarra', number: 22, pos: 'Ala-Pívot', ppg: 6.5, status: 'Activo' },
  { id: 'p5', name: 'J. Carabalí', number: 33, pos: 'Pívot', ppg: 10.1, status: 'Activo' },
  { id: 'p6', name: 'E. Cevallos', number: 5, pos: 'Base suplente', ppg: 4.3, status: 'Activo' },
  { id: 'p7', name: 'F. Caicedo', number: 11, pos: 'Escolta suplente', ppg: 2.1, status: 'Lesionado' }
];

export default function MyTeamTab() {
  const [hasVoted, setHasVoted] = useState(false);
  const [votedPlayer, setVotedPlayer] = useState(null);
  const [votes, setVotes] = useState({
    'M. Gómez': 45,
    'D. Valencia': 28,
    'J. Carabalí': 12
  });

  const handleVote = (playerName) => {
    setVotes(prev => ({
      ...prev,
      [playerName]: prev[playerName] + 1
    }));
    setVotedPlayer(playerName);
    setHasVoted(true);
  };

  const totalVotes = Object.values(votes).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-4">
      {/* Team Profile Header */}
      <div className="relative overflow-hidden rounded-3xl border border-[#1e1e1e] bg-gradient-to-br from-[#0e0c0a] to-[#0c0c0c] p-4 flex items-center space-x-4">
        <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-br from-orange-500 to-amber-700 opacity-5 blur-xl rounded-full" />
        
        <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-orange-500 to-amber-600 flex items-center justify-center font-black text-xl text-white shadow-md border border-[#222]">
          AVA
        </div>
        
        <div className="flex-1">
          <div className="flex items-center space-x-1.5">
            <h3 className="font-extrabold text-base text-white">Avanzaré Club</h3>
            <Shield className="w-4 h-4 text-orange-500 fill-orange-500" />
          </div>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
            Torneo de Invierno Quito 2026
          </p>
          <div className="flex space-x-3 mt-1.5">
            <span className="text-[10px] text-gray-300 font-bold flex items-center">
              <TrendingUp className="w-3.5 h-3.5 text-orange-500 mr-1" /> Posición: <strong className="text-white ml-0.5">#1</strong>
            </span>
            <span className="text-[10px] text-gray-300 font-bold">
              Récord: <strong className="text-white ml-0.5">4G - 1P</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Roster & Training Split */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Next Training Card */}
        <div className="bg-[#0c0c0c] border border-[#161616] rounded-2xl p-4 flex items-start space-x-3">
          <div className="p-2 bg-orange-500 bg-opacity-10 border border-orange-500 border-opacity-25 rounded-xl text-orange-500">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] uppercase font-bold text-gray-500 tracking-widest block">
              Próximo Entrenamiento
            </span>
            <h4 className="font-extrabold text-xs text-white mt-0.5">
              Jueves 21 de Mayo, 19:30
            </h4>
            <p className="text-[10px] text-gray-400 mt-0.5">
              Cancha Municipal Quito (Táctica & Tiro Libre)
            </p>
            <div className="mt-2 inline-flex items-center space-x-1 bg-[#f57c00] bg-opacity-10 px-2 py-0.5 rounded-full border border-[#f57c00] border-opacity-20 text-[9px] font-extrabold text-orange-500">
              <CheckCircle2 className="w-3 h-3" /> <span>Asistencia Confirmada (12)</span>
            </div>
          </div>
        </div>

        {/* MVP Vote Simulator */}
        <div className="bg-[#0c0c0c] border border-[#161616] rounded-2xl p-4">
          <div className="flex items-center space-x-1.5 border-b border-[#161616] pb-2 mb-3">
            <Award className="w-4 h-4 text-orange-500" />
            <h4 className="font-extrabold text-xs text-white uppercase tracking-wider">
              Vota MVP del Partido
            </h4>
          </div>

          {!hasVoted ? (
            <div className="space-y-2">
              <p className="text-[10px] text-gray-400 leading-tight">
                Elige al mejor jugador de Avanzaré en la victoria vs Huracanes (78 - 72).
              </p>
              {Object.keys(votes).map((player) => (
                <button
                  key={player}
                  onClick={() => handleVote(player)}
                  className="w-full flex items-center justify-between bg-[#121212] hover:bg-[#181818] border border-[#1a1a1a] p-2.5 rounded-xl text-xs font-bold text-gray-300 transition-all active:scale-98"
                >
                  <span>{player}</span>
                  <span className="text-[10px] text-orange-500 font-extrabold uppercase bg-orange-500 bg-opacity-10 border border-orange-500 border-opacity-20 px-2.5 py-0.5 rounded-lg">
                    Votar
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-[10px] text-green-400 font-bold flex items-center">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> ¡Tu voto para {votedPlayer} ha sido registrado!
              </p>
              <div className="space-y-2.5">
                {Object.entries(votes).map(([player, count]) => {
                  const percent = Math.round((count / totalVotes) * 100);
                  const isUserSelection = votedPlayer === player;
                  return (
                    <div key={player} className="space-y-1">
                      <div className="flex justify-between text-[11px] font-bold">
                        <span className={isUserSelection ? 'text-orange-500 font-black' : 'text-gray-400'}>
                          {player} {isUserSelection && '(Tu voto)'}
                        </span>
                        <span className="text-white">{percent}% ({count})</span>
                      </div>
                      <div className="h-2 w-full bg-[#161616] rounded-full overflow-hidden border border-[#222]">
                        <div
                          className={`h-full rounded-full transition-all duration-1000 ${
                            isUserSelection
                              ? 'bg-gradient-to-r from-orange-500 to-amber-600 shadow-[0_0_8px_#f57c00]'
                              : 'bg-gray-600'
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Roster List */}
      <div className="bg-[#0c0c0c] border border-[#161616] rounded-3xl p-4">
        <div className="flex items-center justify-between border-b border-[#161616] pb-2.5 mb-3">
          <div className="flex items-center space-x-1.5">
            <Users className="w-4 h-4 text-orange-500" />
            <h4 className="font-extrabold text-xs text-white uppercase tracking-wider">
              Plantilla de Jugadores
            </h4>
          </div>
          <span className="text-[10px] text-gray-500 font-bold">
            Roster: {teamRoster.length} Jugadores
          </span>
        </div>

        <div className="space-y-2.5">
          {teamRoster.map((player) => (
            <div
              key={player.id}
              className="flex items-center justify-between bg-[#121212] bg-opacity-50 p-2.5 rounded-xl border border-[#181818]"
            >
              <div className="flex items-center space-x-3">
                <span className="w-8 h-8 rounded-full bg-[#161616] border border-[#222] text-[11px] font-black text-orange-500 flex items-center justify-center">
                  #{player.number}
                </span>
                <div>
                  <h5 className="text-xs font-black text-white">{player.name}</h5>
                  <span className="text-[10px] text-gray-500 font-bold">{player.pos}</span>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <span className="block text-xs font-black text-white">{player.ppg} PPG</span>
                  <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Promedio</span>
                </div>

                <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-lg border ${
                  player.status === 'Activo'
                    ? 'bg-green-500 bg-opacity-10 border-green-500 border-opacity-20 text-green-500'
                    : 'bg-red-500 bg-opacity-10 border-red-500 border-opacity-20 text-red-500'
                }`}>
                  {player.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
