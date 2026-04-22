'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'

export async function processConsignment(id: string, status: 'diterima' | 'dikembalikan') {
  const supabase = await createClient()

  // Pastikan user adalah staff dan valid
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData?.user) return { error: 'Not authenticated' }

  const { data: profile } = await supabase.from('profiles').select('role, branch_id').eq('id', userData.user.id).single()
  
  if (profile?.role !== 'staff' || !profile?.branch_id) {
    return { error: 'Akses Ditolak. Anda bukan staff aktif cabang.' }
  }

  // Update status titipan
  const { error } = await supabase
    .from('consignments')
    .update({ status })
    .eq('id', id)
    // Extra security: ensure it's targeted for this staff's branch
    .eq('branch_id', profile.branch_id)
    .eq('status', 'pending')

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/staff/consignments')
  return { success: true }
}

export type ManualConsignmentPayload = {
  supplier: {
    id?: string;
    name?: string;
  };
  items: Array<{
    product_id?: string;
    product_name?: string;
    type?: 'harian' | 'tahan_lama';
    supplier_price?: number;
    retail_price?: number;
    quantity: number;
  }>;
};

export async function createManualConsignment(payload: ManualConsignmentPayload) {
  const supabase = await createClient()

  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData?.user) return { error: 'Not authenticated' }

  const { data: profile } = await supabase.from('profiles').select('role, branch_id').eq('id', userData.user.id).single()
  
  if (profile?.role !== 'staff' || !profile?.branch_id) {
    return { error: 'Akses Ditolak. Anda bukan staff aktif cabang.' }
  }

  let targetSupplierId = payload.supplier.id;

  // Jika supplier belum ada (manual baru), buat dummy account
  if (!targetSupplierId && payload.supplier.name) {
    const supabaseAdmin = createAdminClient();
    const dummyEmail = `manual_${Date.now()}_${Math.floor(Math.random()*1000)}@sitopem.local`;
    
    const { data: newAuthData, error: authErr } = await supabaseAdmin.auth.admin.createUser({
      email: dummyEmail,
      password: 'password123',
      email_confirm: true,
    });

    if (authErr || !newAuthData.user) {
      return { error: `Gagal membuat akun supplier manual: ${authErr?.message}` };
    }

    targetSupplierId = newAuthData.user.id;

    // Gunakan upsert agar profile PASTI ada (tidak bergantung sepenuhnya pada trigger)
    const { error: profileErr } = await supabaseAdmin
      .from('profiles')
      .upsert({ 
        id: targetSupplierId,
        name: payload.supplier.name, 
        role: 'supplier' 
      }, { onConflict: 'id' });

    if (profileErr) {
      return { error: `Gagal menginisialisasi profil supplier manual.` };
    }
  }

  if (!targetSupplierId) {
    return { error: 'Data supplier tidak valid.' };
  }

  // Proses items
  const supabaseAdmin = createAdminClient();

  for (const item of payload.items) {
    let targetProductId = item.product_id;

    // Jika produk baru
    if (!targetProductId && item.product_name) {
      const { data: newProd, error: prodErr } = await supabaseAdmin
        .from('products')
        .insert({
          supplier_id: targetSupplierId,
          name: item.product_name,
          type: item.type || 'harian',
          supplier_price: item.supplier_price || 0,
          retail_price: item.retail_price || 0,
        })
        .select('id')
        .single();
      
      if (prodErr || !newProd) return { error: `Gagal membuat produk ${item.product_name}: ${prodErr?.message}` };
      targetProductId = newProd.id;
    }

    if (!targetProductId) continue;

    // Tambah consignment, status otomatis 'diterima' karena staff yang masukkan
    const { error: consErr } = await supabaseAdmin.from('consignments').insert({
      supplier_id: targetSupplierId,
      product_id: targetProductId,
      branch_id: profile.branch_id,
      quantity: item.quantity,
      status: 'diterima'
    });

    if (consErr) return { error: `Gagal menyimpan titipan: ${consErr.message}` };
  }

  revalidatePath('/staff/consignments')
  return { success: true }
}
