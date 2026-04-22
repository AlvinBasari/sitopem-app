import { ShoppingCart, LogIn, ArrowLeftRight } from 'lucide-react'

export default function StaffDashboard() {
  const stats = [
    { name: 'Transaksi Hari Ini', stat: '42', icon: ShoppingCart, color: 'text-blue-500' },
    { name: 'Pending Cabang', stat: '6 items', icon: LogIn, color: 'text-orange-500' },
    { name: 'Retur Harian', stat: '0', icon: ArrowLeftRight, color: 'text-pink-500' },
  ]

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Status Cabang Anda</h1>
        <p className="text-sm text-gray-500">Tinjauan cepat transaksi POS dan operasional cabang.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((item) => {
          const Icon = item.icon
          return (
            <div key={item.name} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
              <div>
                <p className="text-sm font-medium text-gray-500">{item.name}</p>
                <p className={`text-3xl font-bold mt-1 ${item.color}`}>{item.stat}</p>
              </div>
              <div className={`p-3 rounded-full bg-gray-50 ${item.color}`}>
                <Icon size={24} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
