import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getUserProfile } from '@/lib/actions/dashboard'
import { SessionContent } from './SessionContent'

export default async function SessionPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const profile = await getUserProfile()

  return <SessionContent profile={profile} />
}
