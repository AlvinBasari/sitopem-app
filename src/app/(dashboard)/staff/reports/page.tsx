import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { BarChart3 } from 'lucide-react'
import ReportClient from './ReportClient'

export default async function StaffReportsPage() {
  const supabase = await createClient()

  const { data: authData } = await supabase.auth.getUser()
  if (!authData?.user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, branch_id, name')
    .eq('id', authData.user.id)
    .single()

  if (profile?.role !== 'staff' || !profile?.branch_id) {
    redirect('/login?error=Akses ditolak')
  }

  // Batas waktu hari ini (UTC)
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const todayEnd = new Date()
  todayEnd.setHours(23, 59, 59, 999)

  // Ambil penjualan hari ini
  const { data: transactions } = await supabase
    .from('transactions')
    .select('id, quantity, total_price, supplier_income, created_at, products(name, type)')
    .eq('branch_id', profile.branch_id)
    .gte('created_at', todayStart.toISOString())
    .lte('created_at', todayEnd.toISOString())
    .order('created_at', { ascending: false })

  // Ambil titipan masuk hari ini (status diterima)
  const { data: consignments } = await supabase
    .from('consignments')
    .select('id, quantity, created_at, products(name, type), profiles(name)')
    .eq('branch_id', profile.branch_id)
    .eq('status', 'diterima')
    .gte('created_at', todayStart.toISOString())
    .lte('created_at', todayEnd.toISOString())
    .order('created_at', { ascending: false })

  // Ambil nama cabang
  const { data: branch } = await supabase
    .from('branches')
    .select('name')
    .eq('id', profile.branch_id)
    .single()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 rounded-xl">
          <BarChart3 className="text-blue-600" size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Laporan Harian</h1>
          <p className="text-sm text-gray-500">
            {branch?.name} — {new Date().toLocaleDateString('id-ID', { 
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
            })}
          </p>
        </div>
      </div>

      <ReportClient
        transactions={(transactions as any) || []}
        consignments={(consignments as any) || []}
        branchName={branch?.name || ''}
        staffName={profile.name || ''}
      />
    </div>
  )
}
