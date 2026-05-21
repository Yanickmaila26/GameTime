import React, { useState } from 'react';
import { initialReferees, initialPlayerDocuments } from '../data/mockData';
import { Settings, UserCheck, Calendar, FileText, Check, X, RefreshCw, UploadCloud, AlertCircle } from 'lucide-react';

export default function AdminTab({ onScheduleMatch, scheduledMatches }) {
  const [referees, setReferees] = useState(initialReferees);
  const [documents, setDocuments] = useState(initialPlayerDocuments);
  const [selectedMatch, setSelectedMatch] = useState('');
  const [selectedRef, setSelectedRef] = useState('');
  const [scheduleSuccess, setScheduleSuccess] = useState(false);

  // Auto fixture state
  const [isGeneratingFixture, setIsGeneratingFixture] = useState(false);
  const [fixtureGenerated, setFixtureGenerated] = useState(false);
  const [generatedMatches, setGeneratedMatches] = useState([]);

  // Drag & drop file upload simulation
  const [isDragging, setIsDragging] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Match scheduling form
  const handleAssignReferee = (e) => {
    e.preventDefault();
    if (!selectedMatch || !selectedRef) return;

    onScheduleMatch(selectedMatch, selectedRef);
    setScheduleSuccess(true);
    setTimeout(() => setScheduleSuccess(false), 3000);
    setSelectedMatch('');
    setSelectedRef('');
  };

  // Document actions
  const handleApproveDoc = (docId) => {
    setDocuments(prev =>
      prev.map(doc => doc.id === docId ? { ...doc, status: 'Aprobado' } : doc)
    );
  };

  const handleRejectDoc = (docId) => {
    setDocuments(prev =>
      prev.map(doc => doc.id === docId ? { ...doc, status: 'Rechazado' } : doc)
    );
  };

  // Generate Auto Fixture
  const handleGenerateFixture = () => {
    setIsGeneratingFixture(true);
    setFixtureGenerated(false);
    
    // Simulate complex round-robin scheduling algorithm
    setTimeout(() => {
      setIsGeneratingFixture(false);
      setFixtureGenerated(true);
      setGeneratedMatches([
        { id: 'gen-1', round: 7, home: 'Los Halcones', away: 'Huracanes de Quito', referee: 'Galo Chiriboga', time: '17:00' },
        { id: 'gen-2', round: 7, home: 'Avanzaré', away: 'Club 24 de Mayo', referee: 'Sandra Naranjo', time: '19:00' },
        { id: 'gen-3', round: 7, home: 'Spartans Quito', away: 'Quito Bulls', referee: 'Darwin Cabezas', time: '21:00' }
      ]);
    }, 2000);
  };

  // Drag and drop simulator
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    setUploadSuccess(true);

    setTimeout(() => {
      const newDoc = {
        id: `doc-${Date.now()}`,
        name: 'Mateo Carrera',
        team: 'Avanzaré',
        docType: 'Cédula de Identidad',
        file: 'carrera_cedula.jpg',
        status: 'Pendiente',
        date: 'Hoy (Subido)'
      };
      setDocuments(prev => [newDoc, ...prev]);
      setUploadSuccess(false);
    }, 1500);
  };

  return (
    <div className="space-y-5 pb-10">
      {/* Tab Title Section */}
      <div className="flex items-center space-x-2 border-b border-[#161616] pb-3">
        <div className="p-1.5 bg-[#f57c00] bg-opacity-10 border border-[#f57c00] border-opacity-25 rounded-xl text-orange-500">
          <Settings className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-extrabold text-base text-white">Panel de Administración</h3>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
            Comité Organizador Quito 2026
          </p>
        </div>
      </div>

      {/* 1. Referee Assigner & Auto Fixture grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Referee Assigner */}
        <div className="bg-[#0c0c0c] border border-[#161616] rounded-3xl p-4">
          <div className="flex items-center space-x-1.5 border-b border-[#161616] pb-2.5 mb-3.5">
            <UserCheck className="w-4 h-4 text-orange-500" />
            <h4 className="font-extrabold text-xs text-white uppercase tracking-wider">
              Asignar Árbitros
            </h4>
          </div>

          <form onSubmit={handleAssignReferee} className="space-y-3">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                Seleccionar Partido
              </label>
              <select
                value={selectedMatch}
                onChange={(e) => setSelectedMatch(e.target.value)}
                className="w-full bg-[#121212] border border-[#222] rounded-xl px-3 py-2.5 text-xs text-white font-bold outline-none focus:border-orange-500"
                required
              >
                <option value="">-- Elige un partido programado --</option>
                {scheduledMatches.map((m) => (
                  <option key={m.id} value={m.id}>
                    AVA vs HAL (R{m.round} - {m.date})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                Árbitro Central
              </label>
              <select
                value={selectedRef}
                onChange={(e) => setSelectedRef(e.target.value)}
                className="w-full bg-[#121212] border border-[#222] rounded-xl px-3 py-2.5 text-xs text-white font-bold outline-none focus:border-orange-500"
                required
              >
                <option value="">-- Asignar oficial certificado --</option>
                {referees.map((ref) => (
                  <option key={ref} value={ref}>
                    {ref} (FIBA)
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-700 text-black font-extrabold text-xs tracking-wider uppercase py-2.5 rounded-xl transition-all duration-300 transform active:scale-98"
            >
              Programar Árbitro
            </button>

            {scheduleSuccess && (
              <div className="flex items-center space-x-2 bg-green-500 bg-opacity-10 border border-green-500 border-opacity-35 text-green-500 text-[11px] p-2.5 rounded-xl font-bold">
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>¡Asignación programada con éxito!</span>
              </div>
            )}
          </form>
        </div>

        {/* Auto Fixture Generator */}
        <div className="bg-[#0c0c0c] border border-[#161616] rounded-3xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-1.5 border-b border-[#161616] pb-2.5 mb-3.5">
              <Calendar className="w-4 h-4 text-orange-500" />
              <h4 className="font-extrabold text-xs text-white uppercase tracking-wider">
                Generador de Calendario
              </h4>
            </div>

            <p className="text-[10px] text-gray-400 leading-tight">
              Genera automáticamente el fixture de las próximas jornadas usando el algoritmo de emparejamientos FIBA (Round-Robin equilibrado local/visita).
            </p>

            {isGeneratingFixture ? (
              <div className="flex flex-col items-center justify-center py-6 space-y-2">
                <RefreshCw className="w-6 h-6 text-orange-500 animate-spin" />
                <span className="text-[10px] text-orange-500 font-bold uppercase tracking-wider">
                  Computando Combinaciones...
                </span>
              </div>
            ) : fixtureGenerated ? (
              <div className="mt-3 bg-[#121212] border border-[#1a1a1a] rounded-2xl p-3 space-y-2 max-h-36 overflow-y-auto">
                <span className="block text-[9px] text-green-400 font-black uppercase tracking-wider">
                  ✓ Jornada 7 Generada con Éxito
                </span>
                {generatedMatches.map((m) => (
                  <div key={m.id} className="flex justify-between items-center text-[10px] border-b border-[#222] pb-1 last:border-0 last:pb-0">
                    <span className="text-gray-300 font-bold">
                      {m.home} vs {m.away}
                    </span>
                    <span className="text-gray-500 font-mono">
                      {m.time} | Ref: {m.referee.split(' ')[1]}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-gray-600 mr-2" />
                <span className="text-xs text-gray-500 font-bold">Sin fixtures generados.</span>
              </div>
            )}
          </div>

          <button
            onClick={handleGenerateFixture}
            disabled={isGeneratingFixture}
            className="w-full bg-[#121212] hover:bg-[#1a1a1a] border border-[#222] hover:border-orange-500 text-white font-extrabold text-xs tracking-wider uppercase py-2.5 rounded-xl transition-all duration-300 transform active:scale-98 mt-3"
          >
            Generar Calendario Automático
          </button>
        </div>
      </div>

      {/* 2. Drag & Drop Player Document Upload */}
      <div className="bg-[#0c0c0c] border border-[#161616] rounded-3xl p-4">
        <div className="flex items-center space-x-1.5 border-b border-[#161616] pb-2.5 mb-3.5">
          <UploadCloud className="w-4 h-4 text-orange-500" />
          <h4 className="font-extrabold text-xs text-white uppercase tracking-wider">
            Inscripción y Carga de Fichas
          </h4>
        </div>

        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all flex flex-col items-center justify-center space-y-2 ${
            isDragging
              ? 'border-orange-500 bg-orange-500 bg-opacity-5'
              : 'border-[#222] hover:border-[#333] bg-[#080808]'
          }`}
        >
          <UploadCloud className={`w-8 h-8 ${isDragging ? 'text-orange-500' : 'text-gray-500'}`} />
          <div>
            <span className="text-xs font-bold text-white block">
              Arrastra la ficha técnica o cédula del jugador
            </span>
            <span className="text-[10px] text-gray-500">
              Formatos soportados: PDF, JPG, PNG (máx. 5MB)
            </span>
          </div>

          {uploadSuccess && (
            <div className="flex items-center space-x-1 text-[10px] text-green-400 font-bold bg-green-500 bg-opacity-15 px-3 py-1 rounded-full animate-bounce">
              <Check className="w-3.5 h-3.5" /> <span>¡Archivo Cargado! Procesando...</span>
            </div>
          )}
        </div>
      </div>

      {/* 3. Document Approval Validation List */}
      <div className="bg-[#0c0c0c] border border-[#161616] rounded-3xl p-4">
        <div className="flex items-center space-x-1.5 border-b border-[#161616] pb-2.5 mb-3.5">
          <FileText className="w-4 h-4 text-orange-500" />
          <h4 className="font-extrabold text-xs text-white uppercase tracking-wider">
            Validación de Documentos
          </h4>
        </div>

        <div className="space-y-3">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="bg-[#121212] bg-opacity-50 p-3 rounded-2xl border border-[#181818] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div>
                <div className="flex items-center space-x-2">
                  <h5 className="text-xs font-black text-white">{doc.name}</h5>
                  <span className="text-[9px] bg-orange-500 bg-opacity-10 border border-orange-500 border-opacity-20 px-1.5 py-0.2 rounded font-bold text-orange-500">
                    {doc.team}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-[10px] text-gray-400 font-bold flex items-center">
                    <FileText className="w-3.5 h-3.5 text-gray-500 mr-1" /> {doc.docType}:
                  </span>
                  <span className="text-[10px] font-mono text-gray-500">{doc.file}</span>
                </div>

                {doc.observation && (
                  <p className="text-[9px] text-red-400 font-semibold bg-red-950 bg-opacity-15 border border-red-900 border-opacity-35 p-1 rounded-md mt-1.5">
                    Observación: {doc.observation}
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-2 self-end sm:self-center">
                {doc.status === 'Pendiente' ? (
                  <>
                    <button
                      onClick={() => handleRejectDoc(doc.id)}
                      className="p-1.5 bg-red-500 bg-opacity-10 border border-red-500 border-opacity-35 text-red-500 rounded-lg hover:bg-red-500 hover:text-black transition-colors"
                      title="Rechazar"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleApproveDoc(doc.id)}
                      className="p-1.5 bg-green-500 bg-opacity-10 border border-green-500 border-opacity-35 text-green-500 rounded-lg hover:bg-green-500 hover:text-black transition-colors flex items-center space-x-1"
                      title="Aprobar"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border uppercase tracking-wider ${
                    doc.status === 'Aprobado'
                      ? 'bg-green-500 bg-opacity-10 border-green-500 border-opacity-20 text-green-500'
                      : 'bg-red-500 bg-opacity-10 border-red-500 border-opacity-20 text-red-500'
                  }`}>
                    {doc.status}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
