'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

export async function returnConsignment(consignment_id: string) {
  const supabase = await createClient()

  // Pastikan user adalah staff dan valid
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData?.user) return { error: 'Not authenticated' }

  const { data: profile } = await supabase.from('profiles').select('role, branch_id').eq('id', userData.user.id).single()
  
  if (profile?.role !== 'staff' || !profile?.branch_id) {
    return { error: 'Akses Ditolak. Anda bukan staff aktif cabang.' }
  }

  // Update status titipan menjadi 'dikembalikan'
  // Kuantitas yang tersisa di field `quantity` merepresentasikan jumlah yang dikembalikan ke supplier.
  const { error } = await supabase
    .from('consignments')
    .update({ status: 'dikembalikan' })
    .eq('id', consignment_id)
    .eq('branch_id', profile.branch_id)
    .eq('status', 'diterima') // Hanya yang sedang aktif

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/staff/returns')
  return { success: true }
}
