import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LoginForm } from './LoginForm'

export default async function LoginPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-850 py-12 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="max-w-md w-full space-y-8 animate-slide-up">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-white">
            Cogna
          </h2>
          <p className="mt-2 text-center text-sm text-slate-400">
            Privacy-first cognitive self-tracking
          </p>
        </div>
        <LoginForm />
        <p className="text-center text-xs text-slate-500">
          For personal tracking only. Not a medical device.
        </p>
      </div>
    </div>
  )
}
