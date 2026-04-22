import { createClient } from '@/utils/supabase/server'
import { returnConsignment } from './actions'
import { RotateCcw, AlertCircle, PackageSearch, PackageMinus } from 'lucide-react'

export default async function StaffReturnsPage() {
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

  // Ambil data stok aktif
  const { data: activeStock, error } = await supabase
    .from('consignments')
    .select('*, products(name, type, supplier_price), profiles!supplier_id(name)')
    .eq('branch_id', profile.branch_id)
    .eq('status', 'diterima')
    .gt('quantity', 0)
    .order('created_at', { ascending: true })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <RotateCcw className="text-rose-500" /> Pantau & Retur Stok
        </h1>
        <p className="text-sm text-gray-500">
          Kembalikan produk yang tidak laku atau expired (sisa harian) kepada Supplier.
        </p>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative">
        <h2 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
          <PackageSearch size={20} className="text-blue-500" /> Daftar Stok Aktif di Cabang Ini
        </h2>

        {error && <p className="text-red-500 text-sm p-4 bg-red-50 rounded mb-4">Gagal memuat data stok: {error.message}</p>}
        
        {activeStock?.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
            <AlertCircle size={48} className="mx-auto text-emerald-300 mb-4" />
            <h3 className="text-emerald-700 font-bold text-lg">Stok Habis Terjual Semua!</h3>
            <p className="text-gray-400 text-sm mt-1">Luar Biasa, tidak ada sisa stok yang perlu diretur hari ini.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeStock?.map((cons) => (
              <div key={cons.id} className="border border-gray-200 rounded-2xl p-5 shadow-sm hover:border-rose-200 transition bg-white flex flex-col justify-between">
                
                <div className="flex justify-between items-start mb-4">
                  <div>
                     <span className="text-[10px] font-bold text-gray-400 block mb-1">KODE: {cons.id.substring(0,6)}</span>
                     <h3 className="font-bold text-gray-900 leading-tight pr-4">{cons.products?.name}</h3>
                  </div>
                  <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded border flex-shrink-0
                    ${cons.products?.type === 'harian' ? 'bg-orange-100 text-orange-700 border-orange-200' : 'bg-emerald-100 text-emerald-700 border-emerald-200'}`}>
                    {cons.products?.type.replace('_', ' ')}
                  </span>
                </div>

                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 mb-4">
                  <div className="flex justify-between items-center text-sm border-b border-gray-200 pb-2 mb-2">
                    <span className="text-gray-500 font-medium">Sisa Produk</span>
                    <span className="font-black text-rose-600 text-lg bg-rose-50 px-2 rounded">{cons.quantity} pcs</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">Supplier:</span>
                    <span className="font-bold text-gray-700 text-right">{cons.profiles?.name}</span>
                  </div>
                </div>

                <form action={async () => {
                   'use server'
                   await returnConsignment(cons.id)
                }} className="mt-auto">
                   <button type="submit" className="w-full py-3 bg-white border-2 border-rose-100 hover:border-rose-500 hover:bg-rose-500 hover:text-white text-rose-600 font-bold rounded-xl flex justify-center items-center gap-2 transition-all group shadow-sm hover:shadow-rose-500/30 transform hover:-translate-y-0.5" title="Kembalikan semua sisa stok ke Supplier">
                     <PackageMinus size={18} className="transition group-hover:rotate-180" /> Proses Retur Sisa
                   </button>
                </form>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
