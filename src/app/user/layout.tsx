import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

export default async function UserLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="container mx-auto p-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">User Dashboard</h1>
          <form action="/api/auth/signout" method="post">
            <Button variant="outline" size="sm">
              <LogOut />
              Logout
            </Button>
          </form>
        </div>
      </header>
      {children}
    </div>
  )
}
