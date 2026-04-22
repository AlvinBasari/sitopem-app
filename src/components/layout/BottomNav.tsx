'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Store, 
  Package, 
  ClipboardList, 
  BarChart3, 
  Home,
  User
} from 'lucide-react'

type BottomNavProps = {
  role: string
}

export default function BottomNav({ role }: BottomNavProps) {
  const pathname = usePathname()

  const getNavItems = () => {
    switch (role) {
      case 'admin':
        return [
          { name: 'Home', href: '/admin', icon: Home },
          { name: 'Users', href: '/admin/users', icon: User },
          { name: 'Suppliers', href: '/admin/suppliers', icon: ClipboardList },
        ]
      case 'staff':
        return [
          { name: 'Home', href: '/staff', icon: Home },
          { name: 'Titipan', href: '/staff/consignments', icon: Package },
          { name: 'Kasir', href: '/staff/pos', icon: Store },
          { name: 'Laporan', href: '/staff/reports', icon: BarChart3 },
        ]
      case 'supplier':
        return [
          { name: 'Home', href: '/supplier', icon: Home },
          { name: 'Produk', href: '/supplier/products', icon: Package },
          { name: 'Laporan', href: '/supplier/reports', icon: BarChart3 },
        ]
      default:
        return []
    }
  }

  const navItems = getNavItems()

  if (navItems.length === 0) return null

  return (
    <nav className="md:hidden fixed bottom-1 mr-2 ml-2 left-0 right-0 bg-white/80 backdrop-blur-lg border border-gray-200 rounded-2xl shadow-2xl z-50 px-4 py-2 flex justify-around items-center h-16 safe-area-bottom">
      {navItems.map((item) => {
        const isActive = pathname === item.href
        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex flex-col items-center justify-center space-y-1 transition-all duration-300 ${
              isActive 
                ? 'text-blue-600 scale-110' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <item.icon size={isActive ? 24 : 20} strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-[10px] font-bold tracking-tight uppercase">
              {item.name}
            </span>
            {isActive && (
              <div className="absolute -bottom-1 w-1 h-1 bg-blue-600 rounded-full" />
            )}
          </Link>
        )
      })}
    </nav>
  )
}
