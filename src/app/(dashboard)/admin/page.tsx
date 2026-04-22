import { BarChart3, Store, Users, ShoppingCart } from 'lucide-react'

export default function AdminDashboard() {
  const stats = [
    { name: 'Total Pendapatan', stat: 'Rp 45,200', icon: BarChart3, color: 'text-emerald-500' },
    { name: 'Total Cabang', stat: '4', icon: Store, color: 'text-blue-500' },
    { name: 'Titipan Aktif', stat: '104', icon: ShoppingCart, color: 'text-indigo-500' },
    { name: 'Total User', stat: '12', icon: Users, color: 'text-rose-500' },
  ]

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Dashboard Admin</h1>
        <p className="text-sm text-gray-500">Pantau seluruh aktivitas cabang dari satu tempat.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((item) => {
          const Icon = item.icon
          return (
            <div key={item.name} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4 transform transition-all hover:scale-105 duration-200">
              <div className={`p-4 rounded-xl bg-gray-50 ${item.color} shadow-inner`}>
                <Icon size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{item.name}</p>
                <p className="text-2xl font-bold text-gray-900">{item.stat}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
