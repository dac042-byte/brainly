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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900 dark:text-gray-100">
            Braingauge v1
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Privacy-first cognitive self-tracking
          </p>
        </div>
        <LoginForm />
        <p className="text-center text-xs text-gray-500 dark:text-gray-400">
          For personal tracking only. Not a medical device.
        </p>
      </div>
    </div>
  )
}
