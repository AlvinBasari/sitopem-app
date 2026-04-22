import { PackageOpen, TrendingUp, HandCoins } from 'lucide-react'

export default function SupplierDashboard() {
  const stats = [
    { name: 'Produk Aktif', stat: '8', icon: PackageOpen, color: 'text-blue-500' },
    { name: 'Terjual Hari Ini', stat: '34 items', icon: TrendingUp, color: 'text-emerald-500' },
    { name: 'Estimasi Pembayaran', stat: 'Rp 210,000', icon: HandCoins, color: 'text-amber-500' },
  ]

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Beranda Supplier</h1>
        <p className="text-sm text-gray-500">Pusat informasi barang titipan Anda.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((item) => {
          const Icon = item.icon
          return (
            <div key={item.name} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4 overflow-hidden relative group">
              <div className={`p-4 rounded-xl bg-gray-50 ${item.color} shadow-inner z-10`} >
                <Icon size={32} />
              </div>
              <div className="z-10">
                <p className="text-sm font-medium text-gray-500">{item.name}</p>
                <p className="text-2xl font-bold text-gray-900">{item.stat}</p>
              </div>
              <div className={`absolute -bottom-8 -right-8 opacity-5 transform group-hover:scale-110 transition-transform duration-500 ${item.color}`}>
                <Icon size={120} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
