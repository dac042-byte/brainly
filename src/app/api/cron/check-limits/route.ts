import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Resend } from 'resend'

// Initialize Resend only if API key is available (for build-time compatibility)
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

const ADMIN_EMAIL = process.env.ADMIN_EMAIL // Your email

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = await createClient()

    // Get database size (Supabase Pro plan required for this query)
    // For free tier, you'll need to check manually in Supabase dashboard

    // Count total users
    const { count: userCount } = await supabase
      .from('sessions')
      .select('user_id', { count: 'exact', head: true })

    // Count sessions this month
    const firstDayOfMonth = new Date()
    firstDayOfMonth.setDate(1)
    firstDayOfMonth.setHours(0, 0, 0, 0)

    const { count: sessionsThisMonth } = await supabase
      .from('sessions')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', firstDayOfMonth.toISOString())

    // Count audio files
    const { data: audioFiles } = await supabase
      .storage
      .from('audio-recordings')
      .list()

    const warnings = []

    // Check user count (50k limit on free tier)
    if (userCount && userCount > 40000) {
      warnings.push(`⚠️ Approaching user limit: ${userCount} / 50,000 users`)
    }

    // Check sessions (estimate bandwidth usage)
    if (sessionsThisMonth && sessionsThisMonth > 5000) {
      warnings.push(`⚠️ High session count this month: ${sessionsThisMonth} sessions`)
    }

    // Check audio storage (1GB = ~100-200 files depending on length)
    if (audioFiles && audioFiles.length > 150) {
      warnings.push(`⚠️ Audio storage filling up: ${audioFiles.length} files`)
    }

    // Send alert if there are warnings
    if (warnings.length > 0 && resend) {
      await resend.emails.send({
        from: 'Cogna Alerts <alerts@resend.dev>', // Change to alerts@cogna.app after domain setup
        to: [ADMIN_EMAIL!],
        subject: '🚨 Cogna: Service Limit Warnings',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc2626;">Service Limit Warnings</h2>
            <p>Your Cogna app is approaching service limits:</p>
            <ul style="background: #fef2f2; padding: 20px; border-left: 4px solid #dc2626;">
              ${warnings.map(w => `<li>${w}</li>`).join('')}
            </ul>
            <p><strong>Action Required:</strong></p>
            <ul>
              <li>Check Supabase dashboard for database size</li>
              <li>Check Vercel dashboard for bandwidth usage</li>
              <li>Check AssemblyAI dashboard for transcription hours</li>
              <li>Consider upgrading to Pro tier if needed</li>
            </ul>
            <p><a href="https://supabase.com/dashboard/project/_/settings/billing">Supabase Dashboard</a></p>
            <p><a href="https://vercel.com/dashboard/usage">Vercel Dashboard</a></p>
          </div>
        `
      })
    }

    return NextResponse.json({
      message: warnings.length > 0 ? 'Warnings sent' : 'All systems normal',
      userCount,
      sessionsThisMonth,
      audioFileCount: audioFiles?.length || 0,
      warnings
    })
  } catch (error) {
    console.error('Limit check error:', error)
    return NextResponse.json(
      { error: 'Failed to check limits' },
      { status: 500 }
    )
  }
}
