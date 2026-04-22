import { createClient } from '@/utils/supabase/server'
import { processConsignment } from './actions'
import { Package, Inbox, CheckCircle, XCircle, UserPlus, History } from 'lucide-react'
import Link from 'next/link'

export default async function StaffConsignmentsPage() {
  const supabase = await createClient()
  
  const { data: authData } = await supabase.auth.getUser()
  
  // Ambil branch_id staf
  const { data: profile } = await supabase.from('profiles').select('branch_id').eq('id', authData?.user?.id!).single()
  
  if (!profile?.branch_id) {
    return (
      <div className="p-8 text-center text-red-600 bg-red-50 rounded-xl">
        Akses ditolak. Anda belum ditugaskan ke cabang mana pun. Harap hubungi Admin Pusat.
      </div>
    )
  }

  // Ambil data titipan berstatus 'pending' yang menuju cabang ini
  const { data: pendingConsignments, error } = await supabase
    .from('consignments')
    .select('*, products(name, type, supplier_price, retail_price), profiles!supplier_id(name)')
    .eq('branch_id', profile.branch_id)
    .eq('status', 'pending')
    .order('created_at', { ascending: true })

  // Ambil riwayat barang masuk (status diterima, 30 hari terakhir)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: historyConsignments } = await supabase
    .from('consignments')
    .select('*, products(name, type, supplier_price, retail_price), profiles!supplier_id(name)')
    .eq('branch_id', profile.branch_id)
    .in('status', ['diterima', 'dikembalikan'])
    .gte('created_at', thirtyDaysAgo.toISOString())
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Inbox className="text-orange-500" /> Barang Masuk Harian
        </h1>
        <p className="text-sm text-gray-500">
          Konfirmasi daftar barang titipan yang dikirimkan Supplier ke Cabang Anda hari ini.
        </p>
      </div>

      <div className="flex justify-end relative z-10 transition-transform">
        <Link 
          href="/staff/consignments/manual" 
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-blue-500/30 flex items-center gap-2 transform transition hover:-translate-y-0.5"
        >
          <UserPlus size={18} />
          + Entry Barang Masuk (Manual)
        </Link>
      </div>

      {/* Menunggu Konfirmasi */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
          <Package size={20} className="text-blue-500" /> Menunggu Konfirmasi ({pendingConsignments?.length || 0})
        </h2>

        {error && <p className="text-red-500 text-sm p-4 bg-red-50 rounded mb-4">Gagal memuat data masuk: {error.message}</p>}
        
        {pendingConsignments?.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
            <Inbox size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-gray-500 font-semibold text-lg">Tidak ada kiriman baru</h3>
            <p className="text-gray-400 text-sm mt-1">Belum ada supplier yang mengirimkan barang ke cabang ini hari ini.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {pendingConsignments?.map((cons) => (
              <div key={cons.id} className="border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition bg-gradient-to-br from-white to-gray-50 relative overflow-hidden group">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">ID: {cons.id.substring(0,8)}</span>
                    <h3 className="font-bold text-gray-900 text-xl line-clamp-2">{cons.products?.name}</h3>
                  </div>
                  <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded border
                  ${cons.products?.type === 'harian' ? 'bg-orange-100 text-orange-700 border-orange-200' : 'bg-emerald-100 text-emerald-700 border-emerald-200'}`}>
                    {cons.products?.type.replace('_', ' ')}
                  </span>
                </div>

                <div className="space-y-3 mb-6 bg-white p-3 rounded-xl border border-gray-100">
                  <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-2">
                    <span className="text-gray-500 font-medium">Supplier</span>
                    <span className="font-bold text-gray-800">{cons.profiles?.name}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-2">
                    <span className="text-gray-500 font-medium">Harga Jual / pcs</span>
                    <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                      Rp {cons.products?.retail_price.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-lg mt-2">
                    <span className="text-gray-500 font-bold">Kuantitas</span>
                    <span className="font-black text-indigo-600 text-2xl">{cons.quantity} <span className="text-sm font-medium text-gray-400">pcs</span></span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <form action={processConsignment.bind(null, cons.id, 'dikembalikan') as any} className="flex-1">
                    <button type="submit" className="w-full flex items-center justify-center gap-2 py-2.5 bg-white border border-rose-200 text-rose-600 font-semibold rounded-xl hover:bg-rose-50 transition" title="Tolak / Kembalikan Barang">
                      <XCircle size={18} /> Tolak
                    </button>
                  </form>
                  
                  <form action={processConsignment.bind(null, cons.id, 'diterima') as any} className="flex-[2]">
                    <button type="submit" className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-md shadow-emerald-500/30 transition transform hover:-translate-y-0.5" title="Terima Barang ke Stok">
                      <CheckCircle size={18} /> Terima Barang Masuk
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Riwayat Barang Masuk */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-1 flex items-center gap-2">
          <History size={20} className="text-gray-500" /> Riwayat Barang Masuk
        </h2>
        <p className="text-xs text-gray-400 mb-6">30 hari terakhir — {historyConsignments?.length || 0} entri</p>

        {!historyConsignments?.length ? (
          <div className="text-center py-10 text-gray-400 text-sm">
            Belum ada riwayat barang masuk.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs font-bold uppercase text-gray-400 bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">Produk</th>
                  <th className="px-4 py-3 text-left">Supplier</th>
                  <th className="px-4 py-3 text-center">Qty</th>
                  <th className="px-4 py-3 text-right">Harga Jual</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-center">Tanggal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {historyConsignments.map((cons) => (
                  <tr key={cons.id} className="hover:bg-gray-50/50 transition">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-gray-800">{cons.products?.name}</div>
                      <div className="text-xs text-gray-400 capitalize">{cons.products?.type?.replace('_', ' ')}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{cons.profiles?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-center font-bold text-indigo-700">{cons.quantity}</td>
                    <td className="px-4 py-3 text-right text-blue-600 font-semibold">
                      Rp {cons.products?.retail_price?.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-full border ${
                        cons.status === 'diterima'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-rose-50 text-rose-600 border-rose-200'
                      }`}>
                        {cons.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-xs text-gray-400">
                      {new Date(cons.created_at).toLocaleDateString('id-ID', {
                        day: '2-digit', month: 'short', year: 'numeric'
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
