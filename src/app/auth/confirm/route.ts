import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const token_hash = requestUrl.searchParams.get('token_hash')
  const type = requestUrl.searchParams.get('type')
  const next = requestUrl.searchParams.get('next') || '/dashboard'

  if (token_hash && type) {
    const supabase = await createClient()

    const { error } = await supabase.auth.verifyOtp({
      type: type as any,
      token_hash,
    })

    if (!error) {
      // Redirect to dashboard or specified page
      return NextResponse.redirect(new URL(next, request.url))
    }
  }

  // If verification failed, redirect to error page
  return NextResponse.redirect(new URL('/auth/error?message=verification_failed', request.url))
}
