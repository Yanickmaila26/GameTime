import { useState, useEffect } from 'react'
import AdminLayout from '../../Components/AdminLayout'
import { Flame, Target, Disc, ShieldAlert, Check, Sparkles, Save } from 'lucide-react'
import { toastSuccess, toastError } from '../../lib/swal'

export default function Stats() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Top 3 Manual Leaders State
  const [scorers, setScorers] = useState([
    { name: 'Mateo Flores', team: 'Fenix BC', position: 'BASE', total: 126 },
    { name: 'Cristian Jimenez', team: 'DM Basketball', position: 'BASE', total: 105 },
    { name: 'Alex Zapata', team: 'Team Salcedo', position: 'BASE', total: 101 },
  ])
  const [threepointers, setThreepointers] = useState([
    { name: 'Joel Villagómez', team: 'Fenix BC', position: 'BASE', total: 7 },
    { name: 'Basantes Mateo', team: 'Golden Kings', position: 'BASE', total: 7 },
    { name: 'Ortega Francisco', team: 'Ambato City', position: 'BASE', total: 5 },
  ])
  const [baskets, setBaskets] = useState([
    { name: 'Fernandez Neomar', team: 'Team TNT', position: 'BASE', total: 21 },
    { name: 'Alex Zapata', team: 'Team Salcedo', position: 'BASE', total: 19 },
    { name: 'Diesel Suarez', team: 'Team TNT', position: 'BASE', total: 18 },
  ])
  const [foulers, setFoulers] = useState([
    { name: 'Echeverria Mateo', team: 'NPI', position: 'BASE', total: 21 },
    { name: 'Laverde Samuel', team: 'NPI', position: 'BASE', total: 20 },
    { name: 'Ricardo Ortiz', team: 'Cotopaxi Elite', position: 'BASE', total: 18 },
  ])

  const csrf = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''

  const fetchLeaders = () => {
    setLoading(true)
    fetch('/admin/lideres', {
      headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
    })
      .then(res => res.json())
      .then(d => {
        const pad3 = (arr, defaults) => {
          if (!arr || arr.length === 0) return defaults
          return [0, 1, 2].map(i => ({
            name: arr[i]?.name || defaults[i]?.name || '',
            team: arr[i]?.team || defaults[i]?.team || '',
            position: arr[i]?.position || defaults[i]?.position || 'BASE',
            total: arr[i]?.total ?? defaults[i]?.total ?? 0,
          }))
        }

        setScorers(pad3(d.scorers, scorers))
        setThreepointers(pad3(d.threepointers, threepointers))
        setBaskets(pad3(d.baskets, baskets))
        setFoulers(pad3(d.foulers, foulers))
      })
      .catch(() => toastError && toastError('Error al cargar líderes'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchLeaders()
  }, [])

  const handleSaveAll = () => {
    setSaving(true)
    fetch('/admin/lideres', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-CSRF-TOKEN': csrf, 'X-Requested-With': 'XMLHttpRequest' },
      body: JSON.stringify({ scorers, threepointers, baskets, foulers }),
    })
      .then(res => { if (!res.ok) throw new Error(); return res.json() })
      .then(() => {
        toastSuccess && toastSuccess('¡Todos los Líderes han sido guardados correctamente!')
        fetchLeaders()
      })
      .catch(() => toastError && toastError('Error al guardar'))
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
        <span className="text-[10px] bg-[#141414] border border-[#222] text-gray-400 px-2 py-0.5 rounded-full font-bold">
          Top 3
        </span>
      </div>

      <div className="space-y-3">
        {[0, 1, 2].map((idx) => (
          <div key={idx} className="bg-[#121212] border border-[#222] p-3 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                idx === 0 ? 'bg-amber-500 text-black' : idx === 1 ? 'bg-slate-400 text-black' : 'bg-amber-800 text-white'
              }`}>
                Puesto #{idx + 1} {idx === 0 ? '(LÍDER)' : ''}
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
              <Sparkles className="w-3 h-3 mr-1" /> Edición Directa de Líderes
            </span>
            <h1 className="text-xl font-black text-white mt-1">Líderes de la Liga (Top 3)</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Escribe directamente el Nombre, Equipo, Posición y Puntos/Triples/Aros/Faltas para que aparezcan en el cliente.
            </p>
          </div>

          <button
            onClick={handleSaveAll}
            disabled={saving}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-600 text-black text-xs font-black rounded-2xl shadow-lg hover:opacity-90 disabled:opacity-50 flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Guardando Cambios...' : 'Guardar Todos los Líderes'}</span>
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
