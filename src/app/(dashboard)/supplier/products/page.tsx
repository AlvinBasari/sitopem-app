import { createClient } from '@/utils/supabase/server'
import { addProduct, deleteProduct } from './actions'
import { PackageOpen, Plus, Trash2, Tag, Percent } from 'lucide-react'

export default async function SupplierProductsPage() {
  const supabase = await createClient()
  
  const { data: authData } = await supabase.auth.getUser()

  // Ambil daftar produk supplier
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .eq('supplier_id', authData?.user?.id!)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <PackageOpen className="text-blue-600" /> Katalog Produk Anda
        </h1>
        <p className="text-sm text-gray-500">Daftarkan produk-produk yang ingin Anda titipkan ke toko cabang.</p>
      </div>

      <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col lg:flex-row gap-6 md:gap-8">
        
        {/* Form Insert Produk */}
        <div className="lg:w-1/3 w-full shrink-0">
          <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl relative overflow-hidden">
            <h2 className="text-lg font-bold text-indigo-900 mb-4 flex items-center gap-2 relative z-10">
              <Plus size={20} className="text-indigo-600" /> Daftarkan Produk Baru
            </h2>
            <form action={addProduct as any} className="space-y-4 relative z-10">
              
              <div>
                <label className="text-sm font-semibold text-indigo-900">Nama Produk</label>
                <input type="text" name="name" required placeholder="Contoh: Roti Bakar Coklat" className="mt-1 w-full px-4 py-2 border-none ring-1 ring-blue-200 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none transition" />
              </div>
              
              <div>
                <label className="text-sm font-semibold text-indigo-900">Jenis Penitipan</label>
                <select name="type" className="mt-1 w-full px-4 py-2 border-none ring-1 ring-blue-200 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none transition">
                  <option value="harian">Harian (Diambil 12 Siang)</option>
                  <option value="tahan_lama">Tahan Lama (2-3 Hari)</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold text-indigo-900">Harga Setoran (Hak Anda)</label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-2.5 text-gray-400 text-sm font-bold">Rp</span>
                  <input type="number" name="supplier_price" required min="100" placeholder="5000" className="w-full pl-9 pr-4 py-2 border-none ring-1 ring-blue-200 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none transition" />
                </div>
                <p className="text-xs text-indigo-600 mt-2 font-medium bg-white/70 inline-block px-2 py-1 rounded">
                  Sistem akan hitung markup Harga Jual otomatis.
                </p>
              </div>

              <button type="submit" className="w-full py-3 mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-lg shadow-lg shadow-blue-500/30 transform transition-all hover:scale-[1.02]">
                + Simpan Produk
              </button>
            </form>
          </div>
        </div>

        {/* Tabel Data */}
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Produk Aktif Saya</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {error && <p className="text-red-500 text-sm w-full">Gagal memuat produk. {error.message}</p>}
            {products?.length === 0 && <p className="text-gray-400 italic text-sm w-full">Belum ada produk yang didaftarkan. Anda belum bisa mengirim titipan.</p>}
            
            {products?.map((prod) => (
              <div key={prod.id} className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-blue-300 hover:shadow-md transition-all duration-300 relative group">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-gray-900 line-clamp-2 pr-6">{prod.name}</h3>
                  <form action={async () => {
                    'use server'
                    await deleteProduct(prod.id)
                  }} className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button type="submit" className="text-gray-400 hover:text-red-500 bg-white shadow bg-opacity-90 rounded p-1.5 hover:bg-red-50" title="Hapus Produk">
                      <Trash2 size={16} />
                    </button>
                  </form>
                </div>
                
                <span className={`inline-block px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded border mb-4
                  ${prod.type === 'harian' ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                  {prod.type.replace('_', ' ')}
                </span>
                
                <div className="space-y-1 mt-auto">
                  <div className="flex items-center text-sm gap-2">
                    <Tag size={16} className="text-green-500" />
                    <span className="text-gray-500 font-medium">Hak Anda:</span>
                    <span className="font-bold text-gray-900 ml-auto bg-gray-50 px-2 py-0.5 rounded">
                      Rp {prod.supplier_price.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center text-sm gap-2">
                    <Percent size={16} className="text-blue-500" />
                    <span className="text-gray-500 font-medium">Harga Konsumen:</span>
                    <span className="font-bold text-blue-700 ml-auto bg-blue-50 px-2 py-0.5 rounded">
                      Rp {prod.retail_price.toLocaleString()}
                    </span>
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
