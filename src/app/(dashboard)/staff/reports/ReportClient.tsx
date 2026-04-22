'use client'

import { useState } from 'react'
import { 
  TrendingUp, 
  ShoppingBag, 
  Package, 
  Printer,
  ArrowUpRight,
  Download
} from 'lucide-react'

type Transaction = {
  id: string
  quantity: number
  total_price: number
  supplier_income: number
  created_at: string
  products: { name: string; type: string } | null
}

type Consignment = {
  id: string
  quantity: number
  created_at: string
  products: { name: string; type: string } | null
  profiles: { name: string } | null
}

type Props = {
  transactions: Transaction[]
  consignments: Consignment[]
  branchName: string
  staffName: string
}

function formatRp(amount: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount)
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

export default function ReportClient({ transactions, consignments, branchName, staffName }: Props) {
  const [activeTab, setActiveTab] = useState<'penjualan' | 'titipan'>('penjualan')

  // Hitung ringkasan
  const totalPenjualan = transactions.reduce((s, t) => s + t.total_price, 0)
  const totalSetoran = transactions.reduce((s, t) => s + t.supplier_income, 0)
  const totalMargin = totalPenjualan - totalSetoran
  const totalItemTerjual = transactions.reduce((s, t) => s + t.quantity, 0)
  const totalTitipanMasuk = consignments.reduce((s, c) => s + c.quantity, 0)

  const handlePrint = () => {
    window.print()
  }

  const today = new Date().toLocaleDateString('id-ID', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })

  return (
    <>
      {/* Print Styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #print-area, #print-area * { visibility: visible; }
          #print-area { position: fixed; top: 0; left: 0; width: 100%; padding: 20px; }
          .no-print { display: none !important; }
        }
      `}</style>

      {/* Tombol Export */}
      <div className="flex justify-end gap-2 no-print">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl font-semibold text-sm hover:bg-gray-700 transition shadow-sm"
        >
          <Printer size={16} />
          Export PDF
        </button>
      </div>

      <div id="print-area">
        {/* Header Print Only */}
        <div className="hidden print:block mb-6 text-center border-b pb-4">
          <h1 className="text-2xl font-bold">LAPORAN HARIAN SITOPEM</h1>
          <p className="text-gray-600">{branchName} — {today}</p>
          <p className="text-sm text-gray-500">Kasir: {staffName}</p>
        </div>

        {/* Kartu Ringkasan */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard
            label="Total Penjualan"
            value={formatRp(totalPenjualan)}
            icon={<TrendingUp size={20} />}
            color="blue"
            sub={`${transactions.length} transaksi`}
          />
          <SummaryCard
            label="Margin Keuntungan"
            value={formatRp(totalMargin)}
            icon={<ArrowUpRight size={20} />}
            color="emerald"
            sub={totalPenjualan > 0 ? `${Math.round((totalMargin / totalPenjualan) * 100)}% dari penjualan` : '—'}
          />
          <SummaryCard
            label="Item Terjual"
            value={`${totalItemTerjual} pcs`}
            icon={<ShoppingBag size={20} />}
            color="indigo"
            sub={`${transactions.length} jenis produk`}
          />
          <SummaryCard
            label="Titipan Masuk"
            value={`${totalTitipanMasuk} pcs`}
            icon={<Package size={20} />}
            color="orange"
            sub={`${consignments.length} item`}
          />
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Tab Header */}
          <div className="flex border-b border-gray-100 no-print">
            <button
              onClick={() => setActiveTab('penjualan')}
              className={`flex-1 py-3 text-sm font-semibold transition ${
                activeTab === 'penjualan'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Detail Penjualan ({transactions.length})
            </button>
            <button
              onClick={() => setActiveTab('titipan')}
              className={`flex-1 py-3 text-sm font-semibold transition ${
                activeTab === 'titipan'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Titipan Masuk ({consignments.length})
            </button>
          </div>

          {/* Tabel Penjualan */}
          <div className={activeTab === 'penjualan' ? 'block' : 'hidden print:block'}>
            <div className="print:hidden text-xs font-bold uppercase text-gray-400 px-4 pt-4 pb-1">
              Detail Penjualan
            </div>
            {transactions.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <ShoppingBag size={40} className="mx-auto mb-3 text-gray-200" />
                <p>Belum ada penjualan hari ini</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-xs text-gray-500 uppercase font-bold">
                    <tr>
                      <th className="px-4 py-3 text-left">Produk</th>
                      <th className="px-4 py-3 text-center">Qty</th>
                      <th className="px-4 py-3 text-right">Harga Jual</th>
                      <th className="px-4 py-3 text-right">Setoran</th>
                      <th className="px-4 py-3 text-right">Margin</th>
                      <th className="px-4 py-3 text-center no-print">Waktu</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {transactions.map((t) => {
                      const margin = t.total_price - t.supplier_income
                      return (
                        <tr key={t.id} className="hover:bg-gray-50/50 transition">
                          <td className="px-4 py-3">
                            <div className="font-semibold text-gray-800">{t.products?.name ?? '—'}</div>
                            <div className="text-xs text-gray-400 capitalize">{t.products?.type}</div>
                          </td>
                          <td className="px-4 py-3 text-center font-bold text-gray-700">{t.quantity}</td>
                          <td className="px-4 py-3 text-right font-semibold text-gray-800">{formatRp(t.total_price)}</td>
                          <td className="px-4 py-3 text-right text-gray-500">{formatRp(t.supplier_income)}</td>
                          <td className="px-4 py-3 text-right">
                            <span className={`font-bold ${margin >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                              {formatRp(margin)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center text-gray-400 text-xs no-print">
                            {formatTime(t.created_at)}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                  <tfoot className="bg-gray-50 font-bold border-t-2 border-gray-200">
                    <tr>
                      <td className="px-4 py-3 text-gray-700" colSpan={2}>TOTAL</td>
                      <td className="px-4 py-3 text-right text-blue-700">{formatRp(totalPenjualan)}</td>
                      <td className="px-4 py-3 text-right text-gray-500">{formatRp(totalSetoran)}</td>
                      <td className="px-4 py-3 text-right text-emerald-600">{formatRp(totalMargin)}</td>
                      <td className="no-print" />
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

          {/* Tabel Titipan */}
          <div className={activeTab === 'titipan' ? 'block' : 'hidden print:block'}>
            <div className="print:hidden text-xs font-bold uppercase text-gray-400 px-4 pt-4 pb-1">
              Titipan Masuk
            </div>
            {consignments.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <Package size={40} className="mx-auto mb-3 text-gray-200" />
                <p>Belum ada titipan masuk hari ini</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-xs text-gray-500 uppercase font-bold">
                    <tr>
                      <th className="px-4 py-3 text-left">Produk</th>
                      <th className="px-4 py-3 text-left">Supplier</th>
                      <th className="px-4 py-3 text-center">Qty</th>
                      <th className="px-4 py-3 text-center no-print">Waktu</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {consignments.map((c) => (
                      <tr key={c.id} className="hover:bg-gray-50/50 transition">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-gray-800">{c.products?.name ?? '—'}</div>
                          <div className="text-xs text-gray-400 capitalize">{c.products?.type}</div>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{c.profiles?.name ?? 'Manual'}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg text-sm">
                            {c.quantity}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center text-gray-400 text-xs no-print">
                          {formatTime(c.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 font-bold border-t-2 border-gray-200">
                    <tr>
                      <td className="px-4 py-3 text-gray-700" colSpan={2}>TOTAL</td>
                      <td className="px-4 py-3 text-center text-indigo-700">{totalTitipanMasuk} pcs</td>
                      <td className="no-print" />
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

          {/* Footer Laporan */}
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center text-xs text-gray-400">
            <span>Dicetak oleh: {staffName}</span>
            <span>SITOPEM — {branchName}</span>
          </div>
        </div>
      </div>
    </>
  )
}

function SummaryCard({
  label,
  value,
  icon,
  color,
  sub,
}: {
  label: string
  value: string
  icon: React.ReactNode
  color: 'blue' | 'emerald' | 'indigo' | 'orange'
  sub?: string
}) {
  const colors = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', icon: 'bg-blue-100', val: 'text-blue-700' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', icon: 'bg-emerald-100', val: 'text-emerald-700' },
    indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', icon: 'bg-indigo-100', val: 'text-indigo-700' },
    orange: { bg: 'bg-orange-50', text: 'text-orange-600', icon: 'bg-orange-100', val: 'text-orange-700' },
  }
  const c = colors[color]

  return (
    <div className={`${c.bg} rounded-2xl p-4 border border-white shadow-sm`}>
      <div className={`${c.icon} w-9 h-9 rounded-xl flex items-center justify-center ${c.text} mb-3`}>
        {icon}
      </div>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-xl font-black ${c.val} leading-tight`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}
