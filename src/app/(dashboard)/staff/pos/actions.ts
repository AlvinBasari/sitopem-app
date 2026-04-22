'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'

export type CartItem = {
  consignment_id: string
  product_id: string
  name: string
  retail_price: number
  supplier_price: number
  quantity: number
}

export type TransactionOptions = {
  discount?: number       // nominal diskon dalam rupiah (sudah dihitung dari persentase jika perlu)
  cashReceived?: number   // uang yang diterima dari pembeli
}

export async function processTransaction(cart: CartItem[], options: TransactionOptions = {}) {
  // Validasi identitas staff menggunakan user client (tetap pakai RLS untuk auth)
  const supabase = await createClient()
  const adminClient = createAdminClient()

  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData?.user) return { error: 'Not authenticated' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, branch_id')
    .eq('id', userData.user.id)
    .single()
  
  if (profile?.role !== 'staff' || !profile?.branch_id) {
    return { error: 'Hanya staf kasir yang dapat melakukan transaksi.' }
  }

  const totalItems = cart.reduce((s, i) => s + (i.retail_price * i.quantity), 0)
  const discount = options.discount ?? 0
  // Proporsi diskon per item berdasarkan bobotnya terhadap total
  const discountRatio = totalItems > 0 ? discount / totalItems : 0

  // Proses semua item menggunakan admin client (bypass RLS, identitas sudah divalidasi di atas)
  for (const item of cart) {
    const itemSubtotal = item.retail_price * item.quantity
    const itemDiscount = Math.round(itemSubtotal * discountRatio)
    const total_price = itemSubtotal - itemDiscount
    const supplier_income = item.supplier_price * item.quantity

    // 1. Catat ke tabel transactions (pakai admin client — RLS staff tidak diizinkan INSERT)
    const { error: txError } = await adminClient.from('transactions').insert({
      branch_id: profile.branch_id,
      product_id: item.product_id,
      consignment_id: item.consignment_id,
      quantity: item.quantity,
      total_price,
      supplier_income,
      staff_id: userData.user.id
    })
    
    if (txError) return { error: `Gagal mencatat transaksi: ${txError.message}` }

    // 2. Kurangi stok consignment (pakai admin client)
    const { data: consData } = await adminClient
      .from('consignments')
      .select('quantity')
      .eq('id', item.consignment_id)
      .single()
    
    if (consData) {
      const newQty = consData.quantity - item.quantity
      if (newQty < 0) return { error: `Stok kurang untuk ${item.name}` }

      const { error: updError } = await adminClient
        .from('consignments')
        .update({ quantity: newQty })
        .eq('id', item.consignment_id)

      if (updError) return { error: `Gagal update stok: ${updError.message}` }
    }
  }

  revalidatePath('/staff/pos')
  revalidatePath('/staff/reports')
  return { success: true }
}
