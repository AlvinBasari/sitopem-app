import { createClient } from '@/utils/supabase/server'
import { Wallet, TrendingUp, BarChart3, Package, Calendar } from 'lucide-react'

export default async function SupplierReportsPage() {
  const supabase = await createClient()
  
  const { data: authData } = await supabase.auth.getUser()
  const userId = authData?.user?.id

  // Ambil transaksi yang terkait dengan produk milik supplier ini
  const { data: transactions, error } = await supabase
    .from('transactions')
    .select('*, products!inner(name, supplier_id), branches(name)')
    .eq('products.supplier_id', userId)
    .order('created_at', { ascending: false })

  const totalIncome = transactions?.reduce((sum, tx) => sum + (tx.supplier_income || 0), 0) || 0;
  const totalItemsSold = transactions?.reduce((sum, tx) => sum + (tx.quantity || 0), 0) || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <BarChart3 className="text-blue-600" /> Laporan & Pendapatan
        </h1>
        <p className="text-sm text-gray-500">Pantau performa penjualan produk titipan Anda secara realtime dari seluruh cabang.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 p-6 rounded-2xl shadow-lg border border-indigo-400 text-white relative overflow-hidden group hover:shadow-xl transition-all">
          <TrendingUp className="absolute -bottom-4 -right-4 w-32 h-32 text-indigo-400 opacity-20 transform group-hover:scale-110 transition duration-500" />
          <div className="relative z-10 flex flex-col h-full justify-between">
            <h3 className="text-indigo-100 font-medium mb-1 flex items-center gap-2">
              <Wallet size={16} /> Total Hak Pendapatan
            </h3>
            <p className="text-3xl font-black mt-2">Rp {totalIncome.toLocaleString()}</p>
            <p className="text-xs text-indigo-200 mt-4 bg-indigo-900/30 w-fit px-2 py-1 rounded">Belum dibayarkan oleh Admin</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-6 rounded-2xl shadow-lg border border-emerald-400 text-white relative overflow-hidden group hover:shadow-xl transition-all">
          <Package className="absolute -bottom-4 -right-4 w-32 h-32 text-emerald-400 opacity-20 transform group-hover:scale-110 transition duration-500" />
          <div className="relative z-10 flex flex-col h-full justify-between">
            <h3 className="text-emerald-100 font-medium mb-1">Total Produk Terjual</h3>
            <p className="text-3xl font-black mt-2">{totalItemsSold} <span className="text-lg font-medium opacity-80">pcs</span></p>
            <p className="text-xs text-emerald-100 mt-4 opacity-80 flex items-center gap-1"><TrendingUp size={12}/> Penjualan Laris</p>
          </div>
        </div>
        
      </div>

      {/* Rincian Transaksi */}
      <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2 border-b border-gray-100 pb-3">
          <Calendar size={18} className="text-gray-400" /> Histori Transaksi Terbaru
        </h2>

        {error && <p className="text-red-500 text-sm">{error.message}</p>}
        {(!transactions || transactions.length === 0) && (
          <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <BarChart3 className="mx-auto text-gray-300 w-12 h-12 mb-3" />
            <p className="text-gray-500 font-medium text-sm">Belum ada transaksi penjualan yang tercatat sejauh ini.</p>
          </div>
        )}

        <div className="overflow-x-auto">
          {transactions && transactions.length > 0 && (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="p-4 font-semibold rounded-tl-xl">Tanggal</th>
                  <th className="p-4 font-semibold">Produk</th>
                  <th className="p-4 font-semibold">Cabang</th>
                  <th className="p-4 font-semibold text-center">Terjual</th>
                  <th className="p-4 font-semibold text-right rounded-tr-xl">Pendapatan Anda</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-blue-50/30 transition">
                    <td className="p-4 text-sm text-gray-600 whitespace-nowrap">
                      {new Date(tx.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                    </td>
                    <td className="p-4 text-sm font-bold text-gray-900">
                      {tx.products?.name}
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      🏠 {tx.branches?.name}
                    </td>
                    <td className="p-4 text-sm font-semibold text-indigo-600 text-center">
                      {tx.quantity} pcs
                    </td>
                    <td className="p-4 text-sm font-black text-emerald-600 text-right">
                      Rp {tx.supplier_income.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
