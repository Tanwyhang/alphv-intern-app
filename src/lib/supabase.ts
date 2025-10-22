import { createBrowserClient } from '@supabase/ssr'

/**
 * Creates a Supabase client configured for client-side use in Next.js Client Components.
 * 
 * This client is intended for:
 * - Client Components ('use client')
 * - Real-time subscriptions
 * - Client-side data mutations
 * - Interactive features (hooks, event handlers)
 * 
 * Features:
 * - Automatic session management
 * - WebSocket connection for real-time updates
 * - Browser-side caching
 * - Automatic token refresh
 * 
 * @returns {SupabaseClient} Configured Supabase client for browser operations
 * 
 * @example
 * ```typescript
 * 'use client'
 * 
 * import { createClient } from '@/lib/supabase'
 * 
 * export function MyComponent() {
 *   const supabase = createClient()
 *   
 *   // Real-time subscription
 *   useEffect(() => {
 *     const channel = supabase
 *       .channel('entries-changes')
 *       .on('postgres_changes', { ... }, (payload) => {
 *         // Handle real-time update
 *       })
 *       .subscribe()
 *     
 *     return () => { channel.unsubscribe() }
 *   }, [])
 *   
 *   // Client-side mutation
 *   const handleCreate = async (data) => {
 *     await supabase.from('entries').insert(data)
 *   }
 * }
 * ```
 * 
 * @note
 * For Server Components, use `createServerSupabaseClient()` instead.
 * Server Components can access the database directly and don't need real-time.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
