import { createClient } from '@/lib/supabase/server'
import { Transaction } from '@/types'
import DashboardClient from '@/components/dashboard/DashboardClient'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString()

  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', user!.id)
    .gte('date', startOfMonth)
    .lte('date', endOfMonth)
    .order('date', { ascending: false })

  return <DashboardClient transactions={(transactions as Transaction[]) ?? []} />
}
