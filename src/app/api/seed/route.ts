import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use Service Role Key to bypass RLS and create/update confirmed users
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  const accounts = [
    { email: 'admin@sitopem.com', password: 'password123', role: 'admin', name: 'Alvin Admin' },
    { email: 'supplier@sitopem.com', password: 'password123', role: 'supplier', name: 'Suplier Donut' },
    { email: 'staff@sitopem.com', password: 'password123', role: 'staff', name: 'Staff Kasir 1' }
  ];

  const results = [];

  for (const acc of accounts) {
    let userId = null;

    // 1. Check if user exists
    const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = users?.users.find(u => u.email === acc.email);

    if (existingUser) {
      userId = existingUser.id;
      // Update password to ensure it matches
      await supabaseAdmin.auth.admin.updateUserById(userId, { 
        password: acc.password,
        email_confirm: true 
      });
    } else {
      // Create new confirmed user
      const { data: newData, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: acc.email,
        password: acc.password,
        email_confirm: true,
      });
      
      if (createError) {
        results.push({ email: acc.email, status: 'Failed Creation', error: createError.message });
        continue;
      }
      userId = newData.user?.id;
    }

    if (userId) {
      // 2. Ensure profile exists and has correct role (using upsert via admin client)
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .upsert({ 
          id: userId, 
          role: acc.role, 
          name: acc.name
        });

      results.push({ 
        email: acc.email, 
        status: existingUser ? 'Updated' : 'Created', 
        profileUpdated: !profileError,
        profileError: profileError?.message 
      });
    }
  }

  return NextResponse.json({ success: true, results });
}
