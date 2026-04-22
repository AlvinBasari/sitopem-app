import React from 'react'
import { Banknote, Clock, Sparkles } from 'lucide-react'

export default function SupplierPaymentsPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8 bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-gray-100 relative overflow-hidden group">
        
        {/* Background Decorative Elements */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50 group-hover:bg-blue-100 transition-colors duration-500" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50 group-hover:bg-indigo-100 transition-colors duration-500" />

        <div className="relative z-10 space-y-6">
          <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl shadow-lg shadow-blue-500/30 flex items-center justify-center transform group-hover:rotate-6 transition-transform duration-500">
            <Banknote size={48} className="text-white" />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Halaman Pembayaran</h1>
            <div className="flex items-center justify-center gap-2 text-blue-600 font-bold bg-blue-50 w-fit mx-auto px-4 py-1 rounded-full text-xs uppercase tracking-widest">
              <Sparkles size={14} /> <span>Segera Hadir</span>
            </div>
          </div>

          <p className="text-gray-500 leading-relaxed">
            Sistem penarikan dana dan riwayat transfer bagi hasil sedang dalam tahap sinkronisasi akhir. Pantau terus dashboard Anda!
          </p>

          <div className="pt-6">
            <div className="flex items-center justify-center gap-3 text-gray-400 text-sm italic py-4 border-t border-dashed border-gray-100 font-medium">
              <Clock size={16} /> <span>Masuk dalam Agenda Update Tahap 2</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
