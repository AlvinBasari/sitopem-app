'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

export async function updateUserRoleAndBranch(formData: FormData) {
  const supabase = await createClient()
  
  const id = formData.get('id') as string
  const role = formData.get('role') as 'admin' | 'staff' | 'supplier'
  const branch_id = formData.get('branch_id') as string

  // Validasi: hanya staff yang butuh branch_id
  const updateData: any = { role }
  if (role === 'staff') {
    if (!branch_id) return { error: 'Harap pilih cabang untuk Staff.' }
    updateData.branch_id = branch_id
  } else {
    updateData.branch_id = null
  }

  const { error } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/users')
  return { success: true }
}
