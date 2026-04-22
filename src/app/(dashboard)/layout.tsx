import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import Sidebar from '@/components/layout/Sidebar'
import Topbar from '@/components/layout/Topbar'
import BottomNav from '@/components/layout/BottomNav'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const { data: authData, error } = await supabase.auth.getUser()

  if (error || !authData?.user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, name')
    .eq('id', authData.user.id)
    .single()

  if (!profile) {
    redirect('/login?error=Belum mempunyai role')
  }

  return (
    <div className="flex bg-gray-50 text-gray-900 min-h-screen">
      <Sidebar role={profile.role} />
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <Topbar userName={profile.name} role={profile.role} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50/50 p-4 md:p-6 pb-24 md:pb-6">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
        <BottomNav role={profile.role} />
      </div>
    </div>
  )
}
