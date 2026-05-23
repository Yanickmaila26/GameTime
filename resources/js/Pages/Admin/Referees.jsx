import { useState } from 'react'
import { useForm } from '@inertiajs/react'
import AdminLayout from '../../Components/AdminLayout'
import { UserCheck, Plus, Trash2, Edit2, X, Sparkles, Phone, Mail, Award } from 'lucide-react'

function RefereeModal({ referee, onClose }) {
  const { data, setData, post, put, processing, errors } = useForm({
    name: referee?.name ?? '',
    certification: referee?.certification ?? 'FIBA',
    phone: referee?.phone ?? '',
    email: referee?.email ?? '',
    status: referee?.status ?? 'activo',
  })

  const submit = (e) => {
    e.preventDefault()
    if (referee) {
      put(`/admin/arbitros/${referee.id}`, { onSuccess: onClose })
    } else {
      post('/admin/arbitros', { onSuccess: onClose })
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-[#0d0d0d] border border-[#222] rounded-3xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-black text-white">{referee ? 'Editar Árbitro' : 'Nuevo Árbitro'}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">🦺 Nombre completo del árbitro</label>
            <input value={data.name} onChange={e => setData('name', e.target.value)} placeholder="Ej: Juan Pérez López" required
              className="w-full bg-[#121212] border border-[#222] text-white text-sm px-4 py-3 rounded-2xl outline-none focus:border-orange-500" />
            {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
          </div>
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">🏅 Certificación / Licencia <span className="normal-case text-gray-600 font-normal">(ej: FIBA, FBF)</span></label>
            <input value={data.certification} onChange={e => setData('certification', e.target.value)} placeholder="Ej: FIBA Internacional"
              className="w-full bg-[#121212] border border-[#222] text-white text-sm px-4 py-3 rounded-2xl outline-none focus:border-orange-500" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">📞 Teléfono</label>
              <input value={data.phone} onChange={e => setData('phone', e.target.value)} placeholder="Ej: 0987654321"
                className="w-full bg-[#121212] border border-[#222] text-white text-sm px-4 py-3 rounded-2xl outline-none focus:border-orange-500" />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">✉ Correo electrónico</label>
              <input value={data.email} onChange={e => setData('email', e.target.value)} placeholder="Ej: arbitro@mail.com" type="email"
                className="w-full bg-[#121212] border border-[#222] text-white text-sm px-4 py-3 rounded-2xl outline-none focus:border-orange-500" />
            </div>
          </div>
          {referee && (
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">📋 Estado del árbitro</label>
              <select value={data.status} onChange={e => setData('status', e.target.value)}
                className="w-full bg-[#121212] border border-[#222] text-white text-sm px-4 py-3 rounded-2xl outline-none focus:border-orange-500">
                <option value="activo">✅ Activo — disponible para partidos</option>
                <option value="inactivo">⛔ Inactivo — no disponible</option>
              </select>
            </div>
          )}
          <button type="submit" disabled={processing}
            className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-600 text-black font-bold text-sm rounded-2xl disabled:opacity-50">
            {processing ? 'Guardando...' : referee ? 'Actualizar' : 'Crear Árbitro'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function Referees({ referees }) {
  const [modal, setModal] = useState(null)
  const { delete: destroy } = useForm()

  const deleteReferee = (id) => {
    if (!confirm('¿Eliminar árbitro?')) return
    destroy(`/admin/arbitros/${id}`)
  }

  return (
    <AdminLayout title="Árbitros">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="inline-flex items-center bg-orange-500/10 border border-orange-500/20 text-[10px] font-black text-orange-500 px-3 py-1 rounded-full uppercase tracking-wider">
              <Sparkles className="w-3 h-3 mr-1" /> Colegio Arbitral
            </span>
            <h1 className="text-xl font-black text-white mt-1">Árbitros</h1>
          </div>
          <button onClick={() => setModal({})}
            className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-600 text-black text-xs font-bold rounded-2xl">
            <Plus className="w-4 h-4" />
            <span>Nuevo Árbitro</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {referees.map(ref => (
            <div key={ref.id} className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-2xl p-5 hover:border-[#333] transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                  <UserCheck className="w-5 h-5 text-blue-400" />
                </div>
                <div className="flex space-x-1">
                  <button onClick={() => setModal({ referee: ref })}
                    className="p-1.5 text-gray-500 hover:text-white rounded-lg hover:bg-[#222]">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => deleteReferee(ref.id)}
                    className="p-1.5 text-gray-500 hover:text-red-400 rounded-lg hover:bg-red-950/20">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <h3 className="text-sm font-bold text-white mb-2">{ref.name}</h3>
              <div className="space-y-1">
                <div className="flex items-center space-x-2 text-[10px] text-gray-500">
                  <Award className="w-3 h-3" />
                  <span>{ref.certification}</span>
                </div>
                {ref.phone && (
                  <div className="flex items-center space-x-2 text-[10px] text-gray-500">
                    <Phone className="w-3 h-3" />
                    <span>{ref.phone}</span>
                  </div>
                )}
                {ref.email && (
                  <div className="flex items-center space-x-2 text-[10px] text-gray-500">
                    <Mail className="w-3 h-3" />
                    <span>{ref.email}</span>
                  </div>
                )}
              </div>
              <div className="mt-3">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ref.status === 'activo' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                  {ref.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {modal !== null && (
        <RefereeModal referee={modal.referee} onClose={() => setModal(null)} />
      )}
    </AdminLayout>
  )
}
