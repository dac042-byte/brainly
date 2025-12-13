import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getDashboardData, getUserProfile } from '@/lib/actions/dashboard'
import { DashboardContent } from './DashboardContent'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const [dashboardData, profile] = await Promise.all([
    getDashboardData(),
    getUserProfile(),
  ])

  return <DashboardContent data={dashboardData} profile={profile} />
}
