// Datos de prueba para el Torneo de Invierno Quito 2026

export const initialTeams = [
  { id: 'avanzare', name: 'Avanzaré', pj: 5, pg: 4, pp: 1, pts: 9, dif: 38, logoColor: 'from-orange-500 to-amber-600', shortName: 'AVA' },
  { id: 'halcones', name: 'Los Halcones', pj: 5, pg: 4, pp: 1, pts: 9, dif: 24, logoColor: 'from-blue-600 to-indigo-700', shortName: 'HAL' },
  { id: 'huracanes', name: 'Huracanes de Quito', pj: 5, pg: 3, pp: 2, pts: 8, dif: 12, logoColor: 'from-teal-500 to-cyan-600', shortName: 'HUR' },
  { id: 'spartans', name: 'Spartans Quito', pj: 5, pg: 3, pp: 2, pts: 8, dif: 4, logoColor: 'from-red-500 to-rose-700', shortName: 'SPA' },
  { id: 'club24', name: 'Club 24 de Mayo', pj: 5, pg: 1, pp: 4, pts: 6, dif: -28, logoColor: 'from-emerald-500 to-teal-700', shortName: 'C24' },
  { id: 'Quito-bulls', name: 'Quito Bulls', pj: 5, pg: 0, pp: 5, pts: 5, dif: -50, logoColor: 'from-purple-600 to-pink-700', shortName: 'BUL' }
];

export const initialLeaders = {
  scorers: [
    { id: 1, name: 'Juan Pérez', team: 'Los Halcones', ppg: 24.5, matches: 5, avatar: 'JP', position: 'Alero' },
    { id: 2, name: 'Carlos Mendoza', team: 'Spartans Quito', ppg: 21.2, matches: 5, avatar: 'CM', position: 'Base' },
    { id: 3, name: 'M. Gómez', team: 'Avanzaré', ppg: 19.8, matches: 5, avatar: 'MG', position: 'Escolta' }
  ],
  threepointers: [
    { id: 1, name: 'M. Gómez', team: 'Avanzaré', tpg: 4.2, total: 21, avatar: 'MG', position: 'Escolta' },
    { id: 2, name: 'Roberto Díaz', team: 'Huracanes de Quito', tpg: 3.6, total: 18, avatar: 'RD', position: 'Base' },
    { id: 3, name: 'Juan Pérez', team: 'Los Halcones', tpg: 3.0, total: 15, avatar: 'JP', position: 'Alero' }
  ],
  rebounders: [
    { id: 1, name: 'Santiago Castro', team: 'Huracanes de Quito', rpg: 11.3, total: 56, avatar: 'SC', position: 'Pívot' },
    { id: 2, name: 'Esteban Ortiz', team: 'Quito Bulls', rpg: 9.8, total: 49, avatar: 'EO', position: 'Pívot' },
    { id: 3, name: 'D. Andrade', team: 'Club 24 de Mayo', rpg: 9.2, total: 46, avatar: 'DA', position: 'Ala-Pívot' }
  ]
};

export const initialMatches = [
  {
    id: 'match-live-1',
    round: 6,
    homeTeam: 'avanzare',
    awayTeam: 'halcones',
    homeScore: 56,
    awayScore: 52,
    status: 'LIVE',
    quarter: '3er Cuarto',
    timeLeft: '04:20',
    homeFouls: 4,
    awayFouls: 3,
    referee: 'Galo Chiriboga',
    date: 'Hoy, 20:00',
    court: 'Coliseo Central de Quito',
    events: [
      { id: 'e1', time: '09:10', type: 'score', team: 'avanzare', player: 'M. Gómez', description: 'Triple anotado (3 PTS)', score: '43 - 42' },
      { id: 'e2', time: '08:15', type: 'foul', team: 'halcones', player: 'Juan Pérez', description: 'Falta defensiva' },
      { id: 'e3', time: '07:40', type: 'score', team: 'halcones', player: 'Juan Pérez', description: 'Bandeja en contraataque (2 PTS)', score: '43 - 44' },
      { id: 'e4', time: '05:30', type: 'score', team: 'avanzare', player: 'D. Valencia', description: 'Tiro libre anotado (1 PT)', score: '56 - 52' }
    ]
  },
  {
    id: 'match-live-2',
    round: 6,
    homeTeam: 'huracanes',
    awayTeam: 'spartans',
    homeScore: 42,
    awayScore: 45,
    status: 'LIVE',
    quarter: '2do Cuarto',
    timeLeft: '01:15',
    homeFouls: 5,
    awayFouls: 2,
    referee: 'Darwin Cabezas',
    date: 'Hoy, 19:00',
    court: 'Coliseo Central de Quito',
    events: [
      { id: 'e1_m2', time: '02:30', type: 'score', team: 'spartans', player: 'Carlos Mendoza', description: 'Tiro de media distancia (2 PTS)', score: '40 - 43' }
    ]
  },
  {
    id: 'match-live-3',
    round: 6,
    homeTeam: 'club24',
    awayTeam: 'Quito-bulls',
    homeScore: 18,
    awayScore: 16,
    status: 'LIVE',
    quarter: '1er Cuarto',
    timeLeft: '00:45',
    homeFouls: 1,
    awayFouls: 4,
    referee: 'Sandra Naranjo',
    date: 'Hoy, 18:00',
    court: 'Coliseo Central de Quito',
    events: []
  },
  // Jornada 5 (Finalizados)
  {
    id: 'match-f5-1',
    round: 5,
    homeTeam: 'avanzare',
    awayTeam: 'huracanes',
    homeScore: 78,
    awayScore: 72,
    status: 'FINISHED',
    referee: 'Galo Chiriboga',
    date: '17 de Mayo, 2026',
    court: 'Coliseo Central de Quito'
  },
  {
    id: 'match-f5-2',
    round: 5,
    homeTeam: 'halcones',
    awayTeam: 'Quito-bulls',
    homeScore: 92,
    awayScore: 64,
    status: 'FINISHED',
    referee: 'Darwin Cabezas',
    date: '17 de Mayo, 2026',
    court: 'Coliseo Central de Quito'
  },
  {
    id: 'match-f5-3',
    round: 5,
    homeTeam: 'spartans',
    awayTeam: 'club24',
    homeScore: 84,
    awayScore: 76,
    status: 'FINISHED',
    referee: 'Sandra Naranjo',
    date: '16 de Mayo, 2026',
    court: 'Coliseo Central de Quito'
  },
  // Jornada 7 (Programados)
  {
    id: 'match-p7-1',
    round: 7,
    homeTeam: 'halcones',
    awayTeam: 'huracanes',
    homeScore: 0,
    awayScore: 0,
    status: 'SCHEDULED',
    referee: 'Pendiente',
    date: '24 de Mayo, 17:00',
    court: 'Coliseo Central de Quito'
  },
  {
    id: 'match-p7-2',
    round: 7,
    homeTeam: 'avanzare',
    awayTeam: 'club24',
    homeScore: 0,
    awayScore: 0,
    status: 'SCHEDULED',
    referee: 'Pendiente',
    date: '24 de Mayo, 19:00',
    court: 'Coliseo Central de Quito'
  },
  {
    id: 'match-p7-3',
    round: 7,
    homeTeam: 'spartans',
    awayTeam: 'Quito-bulls',
    homeScore: 0,
    awayScore: 0,
    status: 'SCHEDULED',
    referee: 'Pendiente',
    date: '24 de Mayo, 21:00',
    court: 'Coliseo Central de Quito'
  }
];

export const initialReferees = [
  'Galo Chiriboga',
  'Darwin Cabezas',
  'Sandra Naranjo',
  'Milton Cárdenas',
  'Patricia Alvear'
];

export const initialPlayerDocuments = [
  { id: 'doc-1', name: 'Diego Valencia', team: 'Avanzaré', docType: 'Cédula de Identidad', file: 'valencia_cedula.pdf', status: 'Aprobado', date: '12/05/2026' },
  { id: 'doc-2', name: 'Jefferson Ortiz', team: 'Avanzaré', docType: 'Ficha Médica', file: 'ortiz_ficha.pdf', status: 'Pendiente', date: '18/05/2026' },
  { id: 'doc-3', name: 'Santiago Castro', team: 'Huracanes de Quito', docType: 'Cédula de Identidad', file: 'castro_cedula.pdf', status: 'Pendiente', date: '19/05/2026' },
  { id: 'doc-4', name: 'Christian Noboa', team: 'Los Halcones', docType: 'Ficha Médica', file: 'noboa_ficha.pdf', status: 'Rechazado', date: '14/05/2026', observation: 'Falta firma del médico especialista.' }
];

export const teamRoster = [
  { id: 'p1', name: 'D. Valencia', number: 10, pos: 'Base', ppg: 12.4, status: 'Activo' },
  { id: 'p2', name: 'M. Gómez', number: 7, pos: 'Escolta', ppg: 19.8, status: 'Activo' },
  { id: 'p3', name: 'L. Benavides', number: 15, pos: 'Alero', ppg: 8.2, status: 'Activo' },
  { id: 'p4', name: 'A. Ibarra', number: 22, pos: 'Ala-Pívot', ppg: 6.5, status: 'Activo' },
  { id: 'p5', name: 'J. Carabalí', number: 33, pos: 'Pívot', ppg: 10.1, status: 'Activo' },
  { id: 'p6', name: 'E. Cevallos', number: 5, pos: 'Base suplente', ppg: 4.3, status: 'Activo' },
  { id: 'p7', name: 'F. Caicedo', number: 11, pos: 'Escolta suplente', ppg: 2.1, status: 'Lesionado' }
];
