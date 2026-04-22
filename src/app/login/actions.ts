'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  let email = formData.get('email') as string
  const password = formData.get('password') as string

  // Support phone number login (if starts with 08 and no @, append domain)
  if (email && email.startsWith('08') && !email.includes('@')) {
    email = `${email}@sitopem.com`
  }

  const { error, data: authData } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    redirect('/login?error=Invalid email or password')
  }

  if (authData.user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', authData.user.id)
      .single()

    if (profile) {
      if (profile.role === 'admin') redirect('/admin')
      if (profile.role === 'staff') redirect('/staff')
      if (profile.role === 'supplier') redirect('/supplier')
    }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}
