import { createClient } from '@/utils/supabase/server'
import { UserCheck, Trash2, Phone, Calendar, Store } from 'lucide-react'

export default async function AdminSuppliersPage() {
  const supabase = await createClient()

  const { data: suppliers, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'supplier')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <UserCheck className="text-blue-600" /> Manajemen Supplier
          </h1>
          <p className="text-sm text-gray-500">Daftar seluruh supplier yang terdaftar di sistem SITOPEM.</p>
        </div>
        <div className="bg-blue-50 px-4 py-2 rounded-xl border border-blue-100">
          <span className="text-sm font-medium text-blue-700">Total Supplier: {suppliers?.length || 0}</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {error && <div className="p-4 text-red-500 bg-red-50">Gagal memuat data supplier.</div>}
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-sm text-gray-600">
                <th className="p-4 font-semibold uppercase tracking-wider">Informasi Supplier</th>
                <th className="p-4 font-semibold uppercase tracking-wider">Kontak / No. Telp</th>
                <th className="p-4 font-semibold uppercase tracking-wider">Tanggal Bergabung</th>
                <th className="p-4 font-semibold uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {suppliers?.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-400 italic">
                    Belum ada supplier yang terdaftar.
                  </td>
                </tr>
              ) : (
                suppliers?.map((supplier) => (
                  <tr key={supplier.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-600 font-bold border border-blue-200">
                          {supplier.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-gray-800">{supplier.name}</p>
                          <p className="text-xs text-gray-400 font-mono tracking-tighter">ID: {supplier.id.substring(0,8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <a 
                        href={`https://wa.me/${supplier.phone?.replace(/^0/, '62')}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-emerald-600 font-medium hover:underline"
                      >
                        <Phone size={14} /> {supplier.phone || '-'}
                      </a>
                    </td>
                    <td className="p-4 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-gray-400" />
                        {new Date(supplier.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      {/* Untuk saat ini hanya view, hapus bisa diintegrasikan dengan Auth Admin */}
                      <button className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors overflow-hidden">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-2xl text-white shadow-lg shadow-blue-500/20">
          <Store className="mb-4 opacity-50" size={32} />
          <h3 className="text-lg font-bold mb-1 tracking-tight">Cetak Laporan</h3>
          <p className="text-blue-100 text-sm">Download daftar supplier aktif dalam format PDF/Excel.</p>
          <button className="mt-4 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-bold transition-colors uppercase tracking-widest">Segera Hadir</button>
        </div>
      </div>
    </div>
  )
}
