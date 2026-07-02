import { useState, useEffect } from 'react'
import AdminLayout from '../../Components/AdminLayout'
import { Flame, Target, Disc, ShieldAlert, Check, Sparkles } from 'lucide-react'
import { toastSuccess, toastError } from '../../lib/swal'

export default function Stats() {
  const [loading, setLoading] = useState(true)
  const [allPlayers, setAllPlayers] = useState([])
  const [savingCategory, setSavingCategory] = useState(null)

  // Top 3 States
  const [scorers, setScorers] = useState([
    { player_id: '', total: 0 },
    { player_id: '', total: 0 },
    { player_id: '', total: 0 },
  ])
  const [threepointers, setThreepointers] = useState([
    { player_id: '', total: 0 },
    { player_id: '', total: 0 },
    { player_id: '', total: 0 },
  ])
  const [baskets, setBaskets] = useState([
    { player_id: '', total: 0 },
    { player_id: '', total: 0 },
    { player_id: '', total: 0 },
  ])
  const [fouls, setFouls] = useState([
    { player_id: '', total: 0 },
    { player_id: '', total: 0 },
    { player_id: '', total: 0 },
  ])

  const csrf = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''

  const fetchLeaders = () => {
    setLoading(true)
    fetch('/admin/lideres', {
      headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
    })
      .then(res => res.json())
      .then(data => {
        setAllPlayers(data.all_players || [])
        
        const pad3 = (arr) => {
          const resArr = [
            { player_id: '', total: 0 },
            { player_id: '', total: 0 },
            { player_id: '', total: 0 },
          ]
          (arr || []).forEach((item, idx) => {
            if (idx < 3) {
              resArr[idx] = { player_id: item.player_id || '', total: item.total || 0 }
            }
          })
          return resArr
        }

        setScorers(pad3(data.scorers))
        setThreepointers(pad3(data.threepointers))
        setBaskets(pad3(data.baskets))
        setFouls(pad3(data.fouls))
      })
      .catch(() => toastError && toastError('Error al cargar líderes'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchLeaders()
  }, [])

  const handleSaveCategory = (title, categoryKey, items) => {
    const validItems = items.filter(i => i.player_id !== '')
    if (validItems.length === 0) {
      toastError && toastError('Selecciona al menos un jugador')
      return
    }

    setSavingCategory(categoryKey)
    fetch('/admin/lideres', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-CSRF-TOKEN': csrf, 'X-Requested-With': 'XMLHttpRequest' },
      body: JSON.stringify({ category: categoryKey, items: validItems }),
    })
      .then(res => { if (!res.ok) throw new Error(); return res.json() })
      .then(() => {
        toastSuccess && toastSuccess(`Líderes de ${title} guardados correctamente`)
        fetchLeaders()
      })
      .catch(() => toastError && toastError('Error al guardar'))
      .finally(() => setSavingCategory(null))
  }

  const updateItem = (setter, index, field, value) => {
    setter(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: field === 'total' ? Number(value) : value }
      return updated
    })
  }

  const renderCard = (title, icon, categoryKey, items, setter, labelName, colorTheme) => (
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
          <div key={idx} className="flex items-center space-x-3 bg-[#121212] border border-[#222] p-3 rounded-2xl">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
              idx === 0 ? 'bg-amber-500 text-black' : idx === 1 ? 'bg-slate-400 text-black' : 'bg-amber-800 text-white'
            }`}>
              #{idx + 1}
            </span>

            <div className="flex-1">
              <label className="block text-[9px] font-bold text-gray-500 uppercase mb-1">Jugador</label>
              <select
                value={items[idx]?.player_id || ''}
                onChange={e => updateItem(setter, idx, 'player_id', e.target.value)}
                className="w-full bg-[#090909] border border-[#222] text-white text-xs px-3 py-1.5 rounded-xl outline-none focus:border-orange-500 font-bold"
              >
                <option value="">-- Seleccionar jugador --</option>
                {allPlayers.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.team_name}) #{p.number}
                  </option>
                ))}
              </select>
            </div>

            <div className="w-24">
              <label className="block text-[9px] font-bold text-gray-500 uppercase mb-1">{labelName}</label>
              <input
                type="number"
                min={0}
                value={items[idx]?.total || 0}
                onChange={e => updateItem(setter, idx, 'total', e.target.value)}
                className="w-full bg-[#090909] border border-[#222] text-white text-xs text-center py-1.5 rounded-xl outline-none focus:border-orange-500 font-bold"
              />
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => handleSaveCategory(title, categoryKey, items)}
        disabled={savingCategory === categoryKey}
        className={`w-full py-2.5 rounded-2xl font-bold text-xs flex items-center justify-center space-x-2 transition-all ${colorTheme.btn}`}
      >
        <Check className="w-4 h-4" />
        <span>{savingCategory === categoryKey ? 'Guardando...' : `Guardar ${title}`}</span>
      </button>
    </div>
  )

  return (
    <AdminLayout title="Estadísticas de Líderes">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1a1a1a] pb-5">
          <div>
            <span className="inline-flex items-center bg-orange-500/10 border border-orange-500/20 text-[10px] font-black text-orange-500 px-3 py-1 rounded-full uppercase tracking-wider">
              <Sparkles className="w-3 h-3 mr-1" /> Edición Directa de Líderes
            </span>
            <h1 className="text-xl font-black text-white mt-1">Líderes de la Liga (Top 3)</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Edita los valores del Top 3 en Anotadores, Triples, Aros y Faltas para que el cliente vea los datos exactos.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-orange-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderCard(
              'Máximos Anotadores',
              <Flame className="w-4 h-4 text-orange-500" />,
              'scorers',
              scorers,
              setScorers,
              'Puntos',
              {
                text: 'text-orange-400',
                btn: 'bg-gradient-to-r from-orange-500 to-amber-600 text-black hover:opacity-90',
              }
            )}

            {renderCard(
              'Líderes en Triples',
              <Target className="w-4 h-4 text-blue-400" />,
              'threepointers',
              threepointers,
              setThreepointers,
              'Triples',
              {
                text: 'text-blue-400',
                btn: 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:opacity-90',
              }
            )}

            {renderCard(
              'Líderes en Aros de Campo',
              <Disc className="w-4 h-4 text-emerald-400" />,
              'baskets',
              baskets,
              setBaskets,
              'Aros',
              {
                text: 'text-emerald-400',
                btn: 'bg-gradient-to-r from-emerald-500 to-teal-600 text-black hover:opacity-90',
              }
            )}

            {renderCard(
              'Líderes en Faltas Personales',
              <ShieldAlert className="w-4 h-4 text-amber-400" />,
              'fouls',
              fouls,
              setFouls,
              'Faltas',
              {
                text: 'text-amber-400',
                btn: 'bg-gradient-to-r from-amber-500 to-yellow-600 text-black hover:opacity-90',
              }
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
