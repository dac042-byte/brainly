import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getDashboardData, getUserProfile } from '@/lib/actions/dashboard'
import { NewDashboardContent } from './NewDashboardContent'

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

  return <NewDashboardContent data={dashboardData} profile={profile} />
}
