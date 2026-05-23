import { useForm, Link } from '@inertiajs/react'
import { Shield, Lock, Mail, Loader2, Sparkles } from 'lucide-react'

export default function Login() {
  const { data, setData, post, processing, errors } = useForm({
    email: '',
    password: '',
  })

  const submit = (e) => {
    e.preventDefault()
    post('/login')
  }

  return (
    <div className="min-h-screen bg-[#070707] text-gray-100 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#F57C00] opacity-10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#1976D2] opacity-10 blur-[120px] rounded-full" />

      <div className="w-full max-w-md bg-gradient-to-b from-[#121212] to-[#0a0a0a] border border-[#1e1e1e] p-8 rounded-3xl shadow-2xl relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-orange-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-[0_8px_20px_rgba(245,124,0,0.3)] border border-orange-400 mb-3">
            <span className="text-white font-black text-2xl tracking-tighter">GT</span>
          </div>
          <span className="inline-flex items-center bg-orange-500/10 border border-orange-500/20 text-[10px] font-black text-[#F57C00] px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-2">
            <Sparkles className="w-3 h-3 mr-1" /> Panel Administrativo
          </span>
          <h2 className="text-2xl font-black text-white tracking-tight">GameTime</h2>
          <p className="text-xs text-gray-400 mt-1">Torneo de Invierno Latacunga 2026</p>
        </div>

        {errors.email && (
          <div className="mb-6 p-4 bg-red-950/40 border border-red-500/30 rounded-2xl text-xs font-bold text-red-400 flex items-center space-x-2">
            <span className="text-sm">⚠️</span>
            <span>{errors.email}</span>
          </div>
        )}

        <form onSubmit={submit} className="space-y-5">
          <div>
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="email"
                value={data.email}
                onChange={e => setData('email', e.target.value)}
                placeholder="ejemplo@gametime.ec"
                className="w-full bg-[#121212] border border-[#222] focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-sm text-white px-11 py-3.5 rounded-2xl transition-all outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="password"
                value={data.password}
                onChange={e => setData('password', e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#121212] border border-[#222] focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-sm text-white px-11 py-3.5 rounded-2xl transition-all outline-none"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={processing}
            className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-black font-extrabold text-sm rounded-2xl transition-all transform active:scale-95 flex items-center justify-center space-x-2 shadow-[0_8px_25px_rgba(245,124,0,0.2)] disabled:opacity-50"
          >
            {processing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Shield className="w-4 h-4" />
                <span>Ingresar al Panel</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <Link href="/" className="text-xs text-gray-500 hover:text-white transition-colors underline">
            Volver a la vista pública
          </Link>
        </div>
      </div>
    </div>
  )
}
