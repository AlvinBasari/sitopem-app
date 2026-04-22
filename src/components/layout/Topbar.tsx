'use client'

import { LogOut, User } from 'lucide-react'
import { logout } from '@/app/actions'

type TopbarProps = {
  userName: string
  role: string
}

export default function Topbar({ userName, role }: TopbarProps) {
  return (
    <header className="h-16 flex-shrink-0 bg-white border-b border-gray-100 flex items-center justify-between px-6 shadow-sm">
      <div className="flex-1">
        {/* Breadcrumb or title context can go here */}
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex flex-col text-right">
          <span className="text-sm font-semibold text-gray-800">{userName}</span>
          <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 rounded-full w-max ml-auto uppercase tracking-wide">
            {role}
          </span>
        </div>
        
        <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white shadow-md">
          <User size={16} />
        </div>

        <div className="h-6 w-px bg-gray-200 mx-2" />

        <form action={logout}>
          <button 
            type="submit"
            className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50"
            title="Keluar / Logout"
          >
            <LogOut size={20} />
          </button>
        </form>
      </div>
    </header>
  )
}
