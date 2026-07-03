import { useState, useEffect } from 'react'
import AdminLayout from '../../Components/AdminLayout'
import { Flame, Target, Disc, ShieldAlert, Check, Sparkles, Save, ArrowUpDown } from 'lucide-react'
import { toastSuccess, toastError } from '../../lib/swal'

const DEFAULT_SCORERS = [
  { name: 'Mateo Flores', team: 'Fenix BC', position: 'BASE', total: 126 },
  { name: 'Cristian Jimenez', team: 'DM Basketball', position: 'BASE', total: 105 },
  { name: 'Alex Zapata', team: 'Team Salcedo', position: 'BASE', total: 101 },
]
const DEFAULT_THREEPOINTERS = [
  { name: 'Joel Villagómez', team: 'Fenix BC', position: 'BASE', total: 7 },
  { name: 'Basantes Mateo', team: 'Golden Kings', position: 'BASE', total: 7 },
  { name: 'Ortega Francisco', team: 'Ambato City', position: 'BASE', total: 5 },
]
const DEFAULT_BASKETS = [
  { name: 'Fernandez Neomar', team: 'Team TNT', position: 'BASE', total: 21 },
  { name: 'Alex Zapata', team: 'Team Salcedo', position: 'BASE', total: 19 },
  { name: 'Diesel Suarez', team: 'Team TNT', position: 'BASE', total: 18 },
]
const DEFAULT_FOULERS = [
  { name: 'Echeverria Mateo', team: 'NPI', position: 'BASE', total: 21 },
  { name: 'Laverde Samuel', team: 'NPI', position: 'BASE', total: 20 },
  { name: 'Ricardo Ortiz', team: 'Cotopaxi Elite', position: 'BASE', total: 18 },
]

export default function Stats() {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  // Top 3 Manual Leaders State
  const [scorers, setScorers] = useState(DEFAULT_SCORERS)
  const [threepointers, setThreepointers] = useState(DEFAULT_THREEPOINTERS)
  const [baskets, setBaskets] = useState(DEFAULT_BASKETS)
  const [foulers, setFoulers] = useState(DEFAULT_FOULERS)

  const csrf = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''

  const sortByTotalDesc = (arr) => {
    return [...(arr || [])].sort((a, b) => (Number(b?.total) || 0) - (Number(a?.total) || 0))
  }

  const fetchLeaders = () => {
    const local = localStorage.getItem('custom_leaders')
    if (local) {
      try {
        const parsed = JSON.parse(local)
        if (parsed.scorers) setScorers(sortByTotalDesc(parsed.scorers))
        if (parsed.threepointers) setThreepointers(sortByTotalDesc(parsed.threepointers))
        if (parsed.baskets) setBaskets(sortByTotalDesc(parsed.baskets))
        if (parsed.foulers) setFoulers(sortByTotalDesc(parsed.foulers))
      } catch (e) {}
    }

    fetch('/admin/lideres', {
      headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
    })
      .then(res => res.json())
      .then(d => {
        const pad3 = (arr, defaults) => {
          if (!arr || arr.length === 0) return defaults
          const items = [0, 1, 2].map(i => ({
            name: arr[i]?.name || defaults[i]?.name || '',
            team: arr[i]?.team || defaults[i]?.team || '',
            position: arr[i]?.position || defaults[i]?.position || 'BASE',
            total: arr[i]?.total ?? defaults[i]?.total ?? 0,
          }))
          return sortByTotalDesc(items)
        }

        if (d.scorers) setScorers(pad3(d.scorers, DEFAULT_SCORERS))
        if (d.threepointers) setThreepointers(pad3(d.threepointers, DEFAULT_THREEPOINTERS))
        if (d.baskets) setBaskets(pad3(d.baskets, DEFAULT_BASKETS))
        if (d.foulers) setFoulers(pad3(d.foulers, DEFAULT_FOULERS))
      })
      .catch(() => {})
  }

  useEffect(() => {
    fetchLeaders()
  }, [])

  const handleSaveAll = () => {
    setSaving(true)

    const sortedScorers = sortByTotalDesc(scorers)
    const sortedThreepointers = sortByTotalDesc(threepointers)
    const sortedBaskets = sortByTotalDesc(baskets)
    const sortedFoulers = sortByTotalDesc(foulers)

    setScorers(sortedScorers)
    setThreepointers(sortedThreepointers)
    setBaskets(sortedBaskets)
    setFoulers(sortedFoulers)

    const payload = {
      scorers: sortedScorers,
      threepointers: sortedThreepointers,
      baskets: sortedBaskets,
      foulers: sortedFoulers,
    }

    localStorage.setItem('custom_leaders', JSON.stringify(payload))
    window.dispatchEvent(new Event('storage'))

    fetch('/admin/lideres', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-CSRF-TOKEN': csrf, 'X-Requested-With': 'XMLHttpRequest' },
      body: JSON.stringify(payload),
    })
      .then(res => { if (!res.ok) throw new Error(); return res.json() })
      .then(() => {
        toastSuccess && toastSuccess('¡Líderes ordenados y guardados correctamente!')
      })
      .catch(() => {
        toastSuccess && toastSuccess('¡Líderes ordenados y guardados localmente!')
      })
      .finally(() => setSaving(false))
  }

  const updateRow = (setter, index, field, value) => {
    setter(prev => {
      const updated = [...prev]
      updated[index] = {
        ...updated[index],
        [field]: field === 'total' ? Number(value) : value,
      }
      return updated
    })
  }

  const renderSection = (title, icon, items, setter, statLabel, colorTheme) => (
    <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-3xl p-5 space-y-4 shadow-xl">
      <div className="flex items-center justify-between border-b border-[#1a1a1a] pb-3">
        <h3 className={`text-xs font-black uppercase tracking-wider flex items-center space-x-2 ${colorTheme.text}`}>
          {icon}
          <span>{title}</span>
        </h3>
        <button
          onClick={() => setter(sortByTotalDesc(items))}
          title="Ordenar automáticamente por mayor valor"
          className="text-[10px] bg-[#141414] hover:bg-[#1a1a1a] border border-[#222] text-gray-300 px-2 py-0.5 rounded-full font-bold flex items-center space-x-1"
        >
          <ArrowUpDown className="w-2.5 h-2.5 text-orange-400" />
          <span>Auto-Ordenar Top 3</span>
        </button>
      </div>

      <div className="space-y-3">
        {[0, 1, 2].map((idx) => (
          <div key={idx} className="bg-[#121212] border border-[#222] p-3 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                idx === 0 ? 'bg-amber-500 text-black' : idx === 1 ? 'bg-slate-400 text-black' : 'bg-amber-800 text-white'
              }`}>
                Puesto #{idx + 1} {idx === 0 ? '(👑 LÍDER MAXIMO)' : ''}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              <div>
                <label className="block text-[9px] font-bold text-gray-500 uppercase mb-0.5">Nombre Jugador</label>
                <input
                  type="text"
                  placeholder="Ej: Mateo Flores"
                  value={items[idx]?.name || ''}
                  onChange={e => updateRow(setter, idx, 'name', e.target.value)}
                  className="w-full bg-[#090909] border border-[#222] text-white text-xs px-3 py-1.5 rounded-xl outline-none focus:border-orange-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-gray-500 uppercase mb-0.5">Equipo</label>
                <input
                  type="text"
                  placeholder="Ej: Fenix BC"
                  value={items[idx]?.team || ''}
                  onChange={e => updateRow(setter, idx, 'team', e.target.value)}
                  className="w-full bg-[#090909] border border-[#222] text-white text-xs px-3 py-1.5 rounded-xl outline-none focus:border-orange-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-gray-500 uppercase mb-0.5">Posición</label>
                <input
                  type="text"
                  placeholder="BASE / ALERO / PÍVOT"
                  value={items[idx]?.position || ''}
                  onChange={e => updateRow(setter, idx, 'position', e.target.value)}
                  className="w-full bg-[#090909] border border-[#222] text-white text-xs px-3 py-1.5 rounded-xl outline-none focus:border-orange-500 font-bold uppercase"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-gray-500 uppercase mb-0.5">{statLabel}</label>
                <input
                  type="number"
                  min={0}
                  value={items[idx]?.total || 0}
                  onChange={e => updateRow(setter, idx, 'total', e.target.value)}
                  className="w-full bg-[#090909] border border-[#222] text-white text-xs text-center py-1.5 rounded-xl outline-none focus:border-orange-500 font-extrabold"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <AdminLayout title="Edición Directa de Líderes">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1a1a1a] pb-5">
          <div>
            <span className="inline-flex items-center bg-orange-500/10 border border-orange-500/20 text-[10px] font-black text-orange-500 px-3 py-1 rounded-full uppercase tracking-wider">
              <Sparkles className="w-3 h-3 mr-1" /> Reordenamiento Automático de Puestos
            </span>
            <h1 className="text-xl font-black text-white mt-1">Líderes de la Liga (Top 3)</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Si aumentas el valor de un puesto inferior y supera a los superiores, intercambiarán puestos automáticamente al guardar.
            </p>
          </div>

          <button
            onClick={handleSaveAll}
            disabled={saving}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-600 text-black text-xs font-black rounded-2xl shadow-lg hover:opacity-90 disabled:opacity-50 flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Guardando y Ordenando...' : 'Guardar Todos los Líderes'}</span>
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-orange-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderSection(
              'Máximos Anotadores',
              <Flame className="w-4 h-4 text-orange-500" />,
              scorers,
              setScorers,
              'Puntos',
              { text: 'text-orange-400' }
            )}

            {renderSection(
              'Líderes en Triples',
              <Target className="w-4 h-4 text-blue-400" />,
              threepointers,
              setThreepointers,
              'Triples',
              { text: 'text-blue-400' }
            )}

            {renderSection(
              'Líderes en Aros de Campo',
              <Disc className="w-4 h-4 text-emerald-400" />,
              baskets,
              setBaskets,
              'Aros',
              { text: 'text-emerald-400' }
            )}

            {renderSection(
              'Líderes en Faltas Personales',
              <ShieldAlert className="w-4 h-4 text-amber-400" />,
              foulers,
              setFoulers,
              'Faltas',
              { text: 'text-amber-400' }
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
