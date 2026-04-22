'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function registerSupplier(formData: FormData) {
  const supabase = await createClient()
  const adminClient = createAdminClient()

  const name = formData.get('name') as string
  const phone = formData.get('phone') as string
  const password = formData.get('password') as string

  // Validation
  if (!name || !phone || !password) {
    return { error: 'Semua field wajib diisi.' }
  }

  if (!phone.startsWith('08')) {
    return { error: 'Nomor telepon harus diawali dengan 08.' }
  }

  if (phone.length < 10) {
    return { error: 'Nomor telepon terlalu pendek.' }
  }

  // Create pseudo-email
  const email = `${phone}@sitopem.com`

  // 1. Create User via Admin (Bypass Rate Limits & Confirmation)
  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name, phone }
  })

  if (authError) {
    return { error: `Registrasi Gagal: ${authError.message}` }
  }

  if (authData.user) {
    // 2. Create profile entry using adminClient to bypass RLS
    const { error: profileError } = await adminClient
      .from('profiles')
      .insert({
        id: authData.user.id,
        name: name,
        phone: phone,
        role: 'supplier'
      })

    if (profileError && profileError.code !== '23505') {
      return { error: `Gagal membuat profil: ${profileError.message}` }
    }

    // 3. Log the user in normally so they don't have to re-auth
    await supabase.auth.signInWithPassword({
      email,
      password
    })
  }

  revalidatePath('/', 'layout')
  redirect('/supplier')
}
