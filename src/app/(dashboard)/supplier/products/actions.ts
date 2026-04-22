'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

export async function addProduct(formData: FormData) {
  const supabase = await createClient()
  
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData?.user) return { error: 'Not authenticated' }

  const name = formData.get('name') as string
  const type = formData.get('type') as 'harian' | 'tahan_lama'
  const supplier_price = parseFloat(formData.get('supplier_price') as string)

  // Hitung Retail Price berdasarkan Pricing Tiers
  const { data: tiers } = await supabase
    .from('pricing_tiers')
    .select('*')
    .lte('min_price', supplier_price)
    .gte('max_price', supplier_price)

  let calculated_retail_price = supplier_price

  if (tiers && tiers.length > 0) {
    // Gunakan fee dari range yang cocok
    calculated_retail_price = supplier_price + tiers[0].fee
  } else {
    // Jika tidak ada tier yang cocok, kita gunakan fallback atau tolak.
    return { error: 'Range Harga Setor tidak dikonfigurasi oleh Admin. Harap hubungi Admin.' }
  }

  const { error } = await supabase.from('products').insert({
    supplier_id: userData.user.id,
    name,
    type,
    supplier_price,
    retail_price: calculated_retail_price
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/supplier/products')
  return { success: true }
}

export async function deleteProduct(id: string) {
  const supabase = await createClient()
  // RLS will ensure they only delete their own product
  await supabase.from('products').delete().eq('id', id)
  revalidatePath('/supplier/products')
}
