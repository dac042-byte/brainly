'use server'

import { createClient } from '@/lib/supabase/server'
import type { DashboardData } from '@/lib/types'

export async function getDashboardData(): Promise<DashboardData> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  const { data: sessions, error: sessionsError } = await supabase
    .from('sessions')
    .select(`
      *,
      reaction_metrics(*),
      speech_metrics(*),
      memory_tests(*),
      session_deltas(*)
    `)
    .eq('user_id', user.id)
    .not('completed_at', 'is', null)
    .order('created_at', { ascending: false })
    .limit(20)

  if (sessionsError) throw sessionsError

  const { data: baseline, error: baselineError } = await supabase
    .from('baseline_tracking')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_current', true)
    .single()

  if (baselineError && baselineError.code !== 'PGRST116') {
    throw baselineError
  }

  const latestSession = sessions && sessions.length > 0 ? sessions[0] : null

  return {
    sessions: sessions || [],
    baseline: baseline || null,
    latestSession,
  }
}

export async function getUserProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  const { data: profile, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) throw error

  return profile
}
