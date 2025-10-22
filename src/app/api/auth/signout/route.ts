import { createServerSupabaseClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient()
  await supabase.auth.signOut()
  
  // Use absolute URL for the redirect
  const requestUrl = new URL(request.url)
  const redirectUrl = new URL('/login', requestUrl.origin)
  
  return NextResponse.redirect(redirectUrl, {
    status: 303, // Use 303 See Other for POST-redirect-GET pattern
  })
}

export async function GET(request: Request) {
  const supabase = await createServerSupabaseClient()
  await supabase.auth.signOut()
  
  const requestUrl = new URL(request.url)
  const redirectUrl = new URL('/login', requestUrl.origin)
  
  return NextResponse.redirect(redirectUrl, {
    status: 303,
  })
}
