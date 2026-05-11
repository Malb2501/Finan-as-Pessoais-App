import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/layout/Sidebar'
import FloatingActionButton from '@/components/layout/FloatingActionButton'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div className="flex h-screen bg-background">
      <Sidebar userEmail={user.email ?? ''} />
      <main className="flex-1 overflow-y-auto p-6">
        {children}
      </main>
      <FloatingActionButton userId={user.id} />
    </div>
  )
}
