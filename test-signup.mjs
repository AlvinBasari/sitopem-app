import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://azvatlhntvxhkirpvbdp.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6dmF0bGhudHZ4aGtpcnB2YmRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwMzkyMDQsImV4cCI6MjA5MDYxNTIwNH0.bcaMrBoEYY5hvxvMDwdHxUNuKPUdM7yug_zhUFhckKI'
const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
  const accounts = ['admin1@sitopem.com', 'staff1@sitopem.com', 'supplier1@sitopem.com']
  
  for (const email of accounts) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password: 'password123',
    })
    
    if (error) {
      console.error(`Error for ${email}:`, error.message)
    } else {
      console.log(`Success for ${email}:`, data.user?.id)
    }
  }
}

test()
