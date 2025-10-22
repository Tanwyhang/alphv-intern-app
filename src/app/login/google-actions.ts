'use server'

import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'

export async function signInWithGoogle(role: string) {
  const supabase = await createServerSupabaseClient()
  
  const { data } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `http://localhost:3000/auth/callback?role=${role}`,
    },
  })

  if (data.url) {
    redirect(data.url)
  }
}
