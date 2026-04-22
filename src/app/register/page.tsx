'use client'

import { useState } from 'react'
import { registerSupplier } from './actions'
import { User, Phone, Lock, ArrowRight, Store, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function RegisterPage() {
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')

    const formData = new FormData(e.currentTarget)
    const phone = formData.get('phone') as string

    if (!phone.startsWith('08')) {
      setErrorMsg('Nomor telepon harus diawali dengan 08')
      setLoading(false)
      return
    }

    const { error } = await registerSupplier(formData)
    if (error) {
      setErrorMsg(error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-blue-900 via-slate-900 to-black flex items-center justify-center p-4">
      {/* Decorative blobs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      <div className="w-full max-w-md relative">
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-xl p-4 rounded-2xl border border-white/20 shadow-2xl z-10">
          <Store className="w-10 h-10 text-blue-400" />
        </div>
        
        <div className="bg-white/5 backdrop-blur-2xl p-8 rounded-3xl border border-white/10 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)]">
          <div className="text-center mb-8 pt-4">
            <h1 className="text-3xl font-black text-white tracking-tight mb-2 uppercase">
              Gabung <span className="text-blue-400">Supplier</span>
            </h1>
            <p className="text-gray-400 text-sm font-medium">Buka akses pasar lebih luas untuk produk penitipan Anda.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Nama Lengkap / Toko</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                </div>
                <input
                  name="name"
                  type="text"
                  required
                  placeholder="Contoh: Donat Pak Umam"
                  className="block w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">No. Telepon (WhatsApp)</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                </div>
                <input
                  name="phone"
                  type="tel"
                  required
                  pattern="08.*"
                  placeholder="08xxxxxxxxxx"
                  className="block w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                </div>
                <input
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="block w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                />
              </div>
            </div>

            {errorMsg && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm animate-pulse">
                <AlertCircle size={18} />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full relative group overflow-hidden py-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl font-bold text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                  <>
                    Daftar Sekarang <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>
          </form>

          <p className="mt-8 text-center text-gray-400 text-sm">
            Sudah punya akun?{' '}
            <Link href="/login" className="text-blue-400 font-bold hover:text-blue-300 transition-colors">
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
