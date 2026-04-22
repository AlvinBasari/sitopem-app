'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { clsx } from 'clsx'
import {
  LayoutDashboard,
  Store,
  Users,
  Package,
  ShoppingCart,
  Receipt,
  LogOut,
  MapPin,
  Banknote
} from 'lucide-react'

type SidebarProps = {
  role: 'admin' | 'staff' | 'supplier'
}

const adminMenu = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Cabang', href: '/admin/cabang', icon: MapPin },
  { name: 'Staf & User', href: '/admin/users', icon: Users },
  { name: 'Daftar Supplier', href: '/admin/suppliers', icon: Store },
  { name: 'Pricing Tiers', href: '/admin/pricing', icon: Banknote },
  { name: 'Laporan Global', href: '/admin/reports', icon: Receipt },
]

const staffMenu = [
  { name: 'Home Cabang', href: '/staff', icon: Store },
  { name: 'Barang Masuk', href: '/staff/consignments', icon: Package },
  { name: 'Kasir (POS)', href: '/staff/pos', icon: ShoppingCart },
  { name: 'Laporan Harian', href: '/staff/reports', icon: Receipt },
]

const supplierMenu = [
  { name: 'Dashboard', href: '/supplier', icon: LayoutDashboard },
  { name: 'Produk Saya', href: '/supplier/products', icon: Package },
  { name: 'Kirim Titipan', href: '/supplier/consignments', icon: Store },
  { name: 'Laporan', href: '/supplier/reports', icon: Receipt },
  { name: 'Pembayaran', href: '/supplier/payments', icon: Banknote },
]

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname()
  
  const menus =
    role === 'admin'
      ? adminMenu
      : role === 'staff'
      ? staffMenu
      : supplierMenu

  return (
    <aside className="hidden md:flex w-64 bg-white border-r border-gray-100 flex flex-col shadow-sm">
      <div className="h-16 flex items-center justify-center border-b border-gray-100 px-6">
        <h1 className="text-xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          SITOPEM
        </h1>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {menus.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                'group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition duration-200',
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <Icon
                className={clsx(
                  'mr-3 h-5 w-5 flex-shrink-0 transition duration-200',
                  isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'
                )}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
