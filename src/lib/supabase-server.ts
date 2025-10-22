import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Creates a Supabase client configured for server-side use in Next.js Server Components.
 * 
 * This client:
 * - Uses HTTP-only cookies for secure session management
 * - Automatically handles session refresh
 * - Works with Next.js Server Components, Server Actions, and API Routes
 * - Prevents XSS attacks by keeping tokens in secure cookies
 * 
 * Usage:
 * - Server Components: Direct database queries, auth checks
 * - API Routes: Backend operations
 * - Server Actions: Form submissions, mutations
 * 
 * @returns {Promise<SupabaseClient>} Configured Supabase client for server-side operations
 * 
 * @example
 * ```typescript
 * // In a Server Component
 * export default async function Page() {
 *   const supabase = await createServerSupabaseClient()
 *   const { data } = await supabase.from('entries').select('*')
 *   return <div>{data.length} entries</div>
 * }
 * 
 * // In a Server Action
 * 'use server'
 * export async function createEntry(formData: FormData) {
 *   const supabase = await createServerSupabaseClient()
 *   await supabase.from('entries').insert({ ... })
 * }
 * ```
 * 
 * @security
 * - Session tokens stored in HTTP-only cookies
 * - Automatic CSRF protection via SameSite cookies
 * - No token exposure to client-side JavaScript
 */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}
