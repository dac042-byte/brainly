import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SignupForm } from './SignupForm'

export default async function SignupPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-850 py-12 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="max-w-2xl w-full space-y-8 animate-slide-up">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-white">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-slate-400">
            Start tracking your cognitive performance
          </p>
        </div>
        <SignupForm />
        <p className="text-center text-xs text-slate-500">
          For personal tracking only. Not a medical device.
        </p>
      </div>
    </div>
  )
}
