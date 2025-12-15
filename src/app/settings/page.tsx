import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getUserProfile } from '@/lib/actions/dashboard'
import { SettingsContent } from './SettingsContent'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const profile = await getUserProfile()

  return <SettingsContent profile={profile} user={user} />
}
