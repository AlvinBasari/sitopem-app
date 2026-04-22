'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

export async function addBranch(formData: FormData) {
  const supabase = await createClient()
  
  const name = formData.get('name') as string
  const address = formData.get('address') as string
  const contact_info = formData.get('contact_info') as string

  const { error } = await supabase.from('branches').insert({
    name,
    address,
    contact_info
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/cabang')
  return { success: true }
}

export async function deleteBranch(id: string) {
  const supabase = await createClient()
  await supabase.from('branches').delete().eq('id', id)
  revalidatePath('/admin/cabang')
}
