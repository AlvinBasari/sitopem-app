import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Pastikan untuk menggunakan key yang bisa bypass RLS profil ke service_role jika memungkinkan, 
// tapi Auth Register anon key cukup karena profil terbuat via trigger
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  const accounts = [
    { email: 'admin@sitopem.com', password: 'password123', role: 'admin', name: 'Alvin Admin' },
    { email: 'supplier@sitopem.com', password: 'password123', role: 'supplier', name: 'Suplier Donut' },
    { email: 'staff@sitopem.com', password: 'password123', role: 'staff', name: 'Staff Kasir 1' }
  ];

  const results = [];

  for (const acc of accounts) {
    // 1. Sign Up
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: acc.email,
      password: acc.password,
    });

    if (authError && !authError.message.includes('already registered')) {
       results.push({ email: acc.email, status: 'Failed Auth', error: authError.message });
       continue;
    }

    // 2. Paksa update profile via anon (mungkin butuh service role tapi trigger supabase auth udh bikin default profile)
    // Supabase JS tidak auth sbg admin tanpa service role, kita inject langsung dari route jika kita punya key.
    // Untungnya trigger RLS admin mungkin ngijinin user update namanya sndiri.
    if (authData.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ role: acc.role, name: acc.name })
        .eq('id', authData.user.id);

      results.push({ 
        email: acc.email, 
        status: 'Created/Exists', 
        profileUpdated: !profileError,
        profileError: profileError?.message 
      });
    }
  }

  // To fix role RLS, anon client can't just change their own role to admin if we secured it.
  // Wait, I will use MCP SQL later to force their roles to be correct.

  return NextResponse.json({ success: true, results });
}
