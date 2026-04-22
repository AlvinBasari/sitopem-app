import { createClient } from '@/utils/supabase/server'
import { addPricingTier, deletePricingTier } from './actions'
import { PlusCircle, Trash2 } from 'lucide-react'

export default async function PricingPage() {
  const supabase = await createClient()
  const { data: tiers, error } = await supabase.from('pricing_tiers').select('*').order('min_price', { ascending: true })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Konfigurasi Markup Harga Dasar</h1>
        <p className="text-sm text-gray-500">Tentukan tarif/fee platform berdasarkan rentang harga setor dari supplier.</p>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-8">
        {/* Form Tambah Tier */}
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <PlusCircle size={20} className="text-blue-500" /> Tambah Rentang Baru
          </h2>
          <form action={addPricingTier as any} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Harga Minimal Setor (Rp)</label>
              <input type="number" name="min_price" required min="0" className="mt-1 w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Harga Maksimal Setor (Rp)</label>
              <input type="number" name="max_price" required min="1" className="mt-1 w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Fee Platform / Markup (Rp)</label>
              <input type="number" name="fee" required min="0" className="mt-1 w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" />
            </div>
            <button type="submit" className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition transform hover:-translate-y-0.5">
              Simpan Konfigurasi
            </button>
          </form>
        </div>

        {/* Tabel Rentang Harga */}
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Daftar Rentang Harga Aktif</h2>
          <div className="flex flex-col gap-3">
            {error && <p className="text-red-500 text-sm">Gagal memuat data.</p>}
            {tiers?.length === 0 && <p className="text-gray-400 italic text-sm">Belum ada tier yang diatur.</p>}
            
            {tiers?.map((tier) => (
              <div key={tier.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-blue-100 transition">
                <div>
                  <p className="text-sm font-semibold text-gray-800">Rp {tier.min_price.toLocaleString()} - Rp {tier.max_price.toLocaleString()}</p>
                  <p className="text-xs font-medium text-emerald-600 mt-0.5">Fee: Rp {tier.fee.toLocaleString()}</p>
                </div>
                <form action={async () => {
                  'use server'
                  await deletePricingTier(tier.id)
                }}>
                  <button type="submit" className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition" title="Hapus">
                    <Trash2 size={18} />
                  </button>
                </form>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
