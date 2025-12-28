import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function GET(request: NextRequest) {
  // Verify cron secret to prevent unauthorized access
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = await createClient()

    // Find users who haven't tested in the last 7 days
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    // Get all users with their email
    const { data: users } = await supabase.auth.admin.listUsers()

    if (!users) {
      return NextResponse.json({ message: 'No users found' })
    }

    const remindersToSend = []

    for (const user of users.users) {
      // Check their last session
      const { data: sessions } = await supabase
        .from('sessions')
        .select('created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)

      const lastSession = sessions?.[0]
      const lastSessionDate = lastSession ? new Date(lastSession.created_at) : null

      // If no session or last session was more than 7 days ago
      if (!lastSessionDate || lastSessionDate < sevenDaysAgo) {
        remindersToSend.push({
          email: user.email,
          name: user.user_metadata?.full_name || 'there',
          lastSessionDate: lastSessionDate
        })
      }
    }

    // Send emails
    const emailResults = []
    for (const reminder of remindersToSend) {
      try {
        const { data, error } = await resend.emails.send({
          from: 'BrainGauge <notifications@resend.dev>', // Change to notifications@yourdomain.com after domain setup
          to: [reminder.email!],
          subject: 'Time for your weekly brain check-in 🧠',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #be123c;">Hey ${reminder.name}!</h2>
              <p>It's been a week since your last cognitive assessment. Taking regular tests helps you track changes over time.</p>
              <p>Your weekly check-in takes just 2 minutes.</p>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/session"
                 style="display: inline-block; background: linear-gradient(to right, #be123c, #e11d48); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 20px 0;">
                Start Your Test
              </a>
              <p style="color: #666; font-size: 14px;">Maintaining your weekly streak helps establish a reliable baseline for detecting changes.</p>
            </div>
          `
        })

        if (error) {
          console.error('Error sending to', reminder.email, error)
          emailResults.push({ email: reminder.email, status: 'failed', error: error.message })
        } else {
          emailResults.push({ email: reminder.email, status: 'sent', id: data?.id })
        }
      } catch (err) {
        console.error('Error sending to', reminder.email, err)
        emailResults.push({ email: reminder.email, status: 'failed' })
      }
    }

    return NextResponse.json({
      message: 'Reminders processed',
      totalUsers: users.users.length,
      remindersSent: emailResults.filter(r => r.status === 'sent').length,
      results: emailResults
    })
  } catch (error) {
    console.error('Cron job error:', error)
    return NextResponse.json(
      { error: 'Failed to send reminders' },
      { status: 500 }
    )
  }
}
