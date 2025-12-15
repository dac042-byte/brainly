import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { HistoryContent } from './HistoryContent'

export default async function HistoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: sessions } = await supabase
    .from('sessions')
    .select(`
      *,
      reaction_metrics(*),
      speech_metrics(*),
      session_deltas(*)
    `)
    .eq('user_id', user.id)
    .not('completed_at', 'is', null)
    .order('created_at', { ascending: false })

  const { data: baseline } = await supabase
    .from('baseline_tracking')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_current', true)
    .single()

  return <HistoryContent sessions={sessions || []} baseline={baseline} />
}
