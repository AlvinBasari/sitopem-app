import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export default async function Home() {
  const supabase = await createClient()

  const { data: authData, error } = await supabase.auth.getUser()

  if (error || !authData?.user) {
    redirect('/login')
  }

  // User is logged in, find their role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', authData.user.id)
    .single()

  if (profile) {
    if (profile.role === 'admin') redirect('/admin')
    if (profile.role === 'staff') redirect('/staff')
    if (profile.role === 'supplier') redirect('/supplier')
  }

  // Fallback
  return (
    <div className="min-h-screen flex items-center justify-center">
      <h1 className="text-2xl font-bold">Role belum diatur. Harap hubungi Admin.</h1>
    </div>
  )
}
