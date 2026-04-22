import { createClient } from '@/utils/supabase/server'
import { addBranch, deleteBranch } from './actions'
import { MapPin, PlusCircle, Trash2 } from 'lucide-react'

export default async function BranchesPage() {
  const supabase = await createClient()
  const { data: branches, error } = await supabase.from('branches').select('*').order('created_at', { ascending: true })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <MapPin className="text-blue-600" /> Kelola Cabang
        </h1>
        <p className="text-sm text-gray-500">Daftarkan dan kelola seluruh lokasi toko/cabang yang aktif.</p>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-8">
        {/* Form Tambah Cabang */}
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <PlusCircle size={20} className="text-blue-500" /> Registrasi Cabang Baru
          </h2>
          <form action={addBranch as any} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Nama Cabang</label>
              <input type="text" name="name" required placeholder="Contoh: Cabang Sudirman" className="mt-1 w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Alamat Lengkap</label>
              <textarea name="address" required rows={3} placeholder="Jalan Sudirman No 123..." className="mt-1 w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"></textarea>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Kontak (Opsional)</label>
              <input type="text" name="contact_info" placeholder="08123456789" className="mt-1 w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" />
            </div>
            <button type="submit" className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition transform hover:-translate-y-0.5">
              Simpan Cabang
            </button>
          </form>
        </div>

        {/* Tabel Cabang */}
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Daftar Cabang Aktif</h2>
          <div className="flex flex-col gap-3">
            {error && <p className="text-red-500 text-sm">Gagal memuat data cabang.</p>}
            {branches?.length === 0 && <p className="text-gray-400 italic text-sm">Belum ada cabang terdaftar.</p>}
            
            {branches?.map((branch) => (
              <div key={branch.id} className="flex flex-col p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-blue-100 transition relative group">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-800 text-lg">{branch.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{branch.address}</p>
                    {branch.contact_info && (
                      <p className="text-xs font-medium text-gray-400 mt-2">📞 {branch.contact_info}</p>
                    )}
                  </div>
                  <form action={async () => {
                    'use server'
                    await deleteBranch(branch.id)
                  }}>
                    <button type="submit" className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition" title="Hapus">
                      <Trash2 size={18} />
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
