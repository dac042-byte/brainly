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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900 dark:text-gray-100">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Start tracking your cognitive performance
          </p>
        </div>
        <SignupForm />
      </div>
    </div>
  )
}
