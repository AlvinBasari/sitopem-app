import { createClient } from '@/utils/supabase/server'
import { createConsignment, cancelConsignment } from './actions'
import { Store, Send, Clock, CheckCircle2, XCircle } from 'lucide-react'

export default async function SupplierConsignmentsPage() {
  const supabase = await createClient()
  
  const { data: authData } = await supabase.auth.getUser()

  // Ambil history titipan supplier ini
  const { data: consignments, error } = await supabase
    .from('consignments')
    .select('*, products(name, type), branches(name)')
    .eq('supplier_id', authData?.user?.id!)
    .order('created_at', { ascending: false })

  // Ambil list produk milik supplier
  const { data: products } = await supabase.from('products').select('id, name, type').eq('supplier_id', authData?.user?.id!)

  // Ambil cabang 
  const { data: branches } = await supabase.from('branches').select('id, name')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Store className="text-blue-600" /> Ekspedisi Titipan
        </h1>
        <p className="text-sm text-gray-500">Ajukan pengiriman produk ke toko-toko pilihan Anda secara realtime.</p>
      </div>

      <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col lg:flex-row gap-8">
        
        {/* Form Titip */}
        <div className="lg:w-1/3 w-full shrink-0">
          <div className="p-6 bg-gradient-to-br from-indigo-50 to-blue-50 border border-blue-100 rounded-2xl shadow-inner relative">
            <h2 className="text-lg font-bold text-indigo-900 mb-6 flex items-center gap-2 border-b border-indigo-100 pb-3">
              <Send size={20} className="text-indigo-500" /> Form Kirim Barang Kosong
            </h2>
            
            {products?.length === 0 ? (
              <p className="text-orange-500 font-medium text-sm p-4 bg-orange-50 rounded-lg border border-orange-100">
                Silahkan daftarkan "Produk Saya" terlebih dahulu sebelum bisa mengirim titipan!
              </p>
            ) : (
              <form action={createConsignment as any} className="space-y-5">
                <div>
                  <label className="text-sm font-semibold text-indigo-900">Pilih Produk</label>
                  <select name="product_id" required className="mt-1.5 w-full px-4 py-2.5 bg-white border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition font-medium text-gray-700">
                    {products?.map((p) => (
                      <option key={p.id} value={p.id}>{p.name} ({p.type})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-semibold text-indigo-900">Tujuan Cabang</label>
                  <select name="branch_id" required className="mt-1.5 w-full px-4 py-2.5 bg-white border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition font-medium text-gray-700">
                    {branches?.map((b) => (
                      <option key={b.id} value={b.id}>🏠 {b.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-semibold text-indigo-900">Kuantitas (Pcs)</label>
                  <input type="number" name="quantity" required min="1" placeholder="Misal: 50" className="mt-1.5 w-full px-4 py-2.5 bg-white border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition font-bold text-indigo-900" />
                </div>

                <div className="pt-2">
                  <button type="submit" className="w-full flex justify-center items-center gap-2 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg transition transform hover:-translate-y-0.5">
                    <Send size={18} /> Ajukan Pengiriman
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Tabel Riwayat */}
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 px-2">Riwayat Titipan Saya</h2>
          <div className="flex flex-col gap-3">
            {error && <p className="text-red-500 text-sm">Gagal memuat histori. {error.message}</p>}
            {consignments?.length === 0 && <p className="text-gray-400 italic text-sm px-2">Belum ada aktivitas pengiriman ke cabang manapun.</p>}
            
            {consignments?.map((cons) => (
              <div key={cons.id} className="bg-white border hover:border-blue-200 shadow-sm p-4 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-500 mb-1">ID: {cons.id.substring(0,8).toUpperCase()}</span>
                  <h3 className="font-bold text-gray-800 text-lg">{cons.products?.name}</h3>
                  <p className="text-sm text-gray-600 mt-1 flex items-center gap-1.5">
                     <Store size={14} className="text-blue-500" /> Cabang: <span className="font-semibold text-gray-700">{cons.branches?.name}</span>
                  </p>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-center bg-gray-50 px-4 py-2 rounded-lg">
                    <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">Kuantitas</span>
                    <span className="font-bold text-xl text-indigo-600">{cons.quantity}</span>
                  </div>
                  
                  <div className="flex flex-col items-center min-w-[100px]">
                    {cons.status === 'pending' && (
                      <span className="flex items-center gap-1.5 text-xs font-bold text-orange-600 bg-orange-50 px-3 py-1.5 rounded-full border border-orange-100">
                        <Clock size={14}/> PENDING
                      </span>
                    )}
                    {cons.status === 'diterima' && (
                      <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                        <CheckCircle2 size={14}/> DITERIMA
                      </span>
                    )}
                    {cons.status === 'dikembalikan' && (
                      <span className="flex items-center gap-1.5 text-xs font-bold text-rose-600 bg-rose-50 px-3 py-1.5 rounded-full border border-rose-100">
                        <XCircle size={14}/> DIKEMBALIKAN
                      </span>
                    )}

                    {cons.status === 'pending' && (
                      <form action={async () => {
                        'use server'
                        await cancelConsignment(cons.id)
                      }} className="mt-2 text-xs">
                        <button type="submit" className="text-red-500 font-medium hover:underline flex items-center gap-1">
                          Batalkan Titipan
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
