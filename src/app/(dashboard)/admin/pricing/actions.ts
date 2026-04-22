'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

export async function addPricingTier(formData: FormData) {
  const supabase = await createClient()
  
  const min_price = parseFloat(formData.get('min_price') as string)
  const max_price = parseFloat(formData.get('max_price') as string)
  const fee = parseFloat(formData.get('fee') as string)

  if (min_price >= max_price) {
    return { error: 'Minimum price harus kurang dari Maximum price' }
  }

  const { error } = await supabase.from('pricing_tiers').insert({
    min_price,
    max_price,
    fee
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/pricing')
  return { success: true }
}

export async function deletePricingTier(id: string) {
  const supabase = await createClient()
  await supabase.from('pricing_tiers').delete().eq('id', id)
  revalidatePath('/admin/pricing')
}
