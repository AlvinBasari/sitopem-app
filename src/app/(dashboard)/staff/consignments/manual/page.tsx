import { createClient } from '@/utils/supabase/server'
import ManualConsignmentForm from './ManualConsignmentForm'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Input Barang Masuk Manual - Staff SITOPEM',
}

export default async function ManualConsignmentPage() {
  const supabase = await createClient()

  // Ambil semua data supplier untuk fitur kombinasi pengetikan (datalist/autocomplete)
  const { data: suppliers } = await supabase
    .from('profiles')
    .select('id, name')
    .eq('role', 'supplier')
    .order('name')

  // Ambil data semua produk yang ada untuk dipasangkan dengan supplier jika sudah ada
  const { data: products } = await supabase
    .from('products')
    .select('id, name, type, supplier_price, retail_price, supplier_id')

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            Input Manual
          </h1>
          <p className="text-sm text-gray-500">
            Fasilitas untuk mencatat barang masuk jika supplier tidak memiliki akun.
          </p>
        </div>
        <Link 
          href="/staff/consignments" 
          className="text-sm font-bold text-gray-500 bg-white border border-gray-200 hover:bg-gray-50 px-4 py-2.5 rounded-xl transition flex items-center gap-2 w-max"
        >
          <ArrowLeft size={16} /> Kembali
        </Link>
      </div>

      <ManualConsignmentForm 
        suppliers={suppliers || []} 
        products={products || []} 
      />
    </div>
  )
}
