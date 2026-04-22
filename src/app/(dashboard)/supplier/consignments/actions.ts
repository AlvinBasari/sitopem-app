'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

export async function createConsignment(formData: FormData) {
  const supabase = await createClient()
  
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData?.user) return { error: 'Not authenticated' }

  const product_id = formData.get('product_id') as string
  const branch_id = formData.get('branch_id') as string
  const quantity = parseInt(formData.get('quantity') as string)

  if (quantity <= 0) return { error: 'Jumlah harus lebih besar dari 0' }

  const { error } = await supabase.from('consignments').insert({
    supplier_id: userData.user.id,
    product_id,
    branch_id,
    quantity,
    status: 'pending' // Default
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/supplier/consignments')
  return { success: true }
}

export async function cancelConsignment(id: string) {
  const supabase = await createClient()
  
  // Hanya bisa batalkan jika status pending
  const { data: cons } = await supabase.from('consignments').select('status').eq('id', id).single()
  
  if (cons?.status === 'pending') {
    await supabase.from('consignments').delete().eq('id', id)
    revalidatePath('/supplier/consignments')
  }
}
