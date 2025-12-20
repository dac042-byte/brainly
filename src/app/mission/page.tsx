import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardLayout } from '@/components/DashboardLayout'

export default async function MissionPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Mission
            </h1>
            <p className="text-slate-400">
              Why Cerebro exists
            </p>
          </div>

          <div className="bg-slate-850/80 backdrop-blur-xl rounded-2xl border border-slate-750/50 p-8">
            <div className="space-y-4 text-slate-300 leading-relaxed text-[15px]">
              <p>
                Cerebro was built by a college student and former MMA fighter who understood the reality of brain health in contact sports. After years of training and competing, the awareness of cumulative impact became impossible to ignore. The question wasn't whether contact sports affect the brain—it was how to track those changes over time in a way that's private, accessible, and actually useful for athletes who love what they do but want to be smart about it.
              </p>

              <p>
                This tool is designed for contact sport athletes—MMA fighters, boxers, rugby players, football athletes—anyone who knows the risks but wants to stay in the game responsibly. This isn't about fear or stopping what you love. It's about having the data to make informed decisions. Track your cognitive performance over time. Notice patterns. Know when you need rest. Be proactive, not reactive.
              </p>

              <p>
                Athletes shouldn't have to choose between tracking their brain health and keeping their career private. Cerebro keeps all your data secure and personal. No data sharing with coaches, teams, or organizations. No third-party analytics or tracking. You own your data completely. Self-tracking, self-awareness, self-determination.
              </p>

              <p>
                Cerebro measures three key areas of cognitive performance: reaction time, speech processing, and memory recall. Together, these give you a snapshot of how your brain is functioning. Track your performance over time. Compare yourself to your baseline, not someone else's. Notice trends. Make decisions based on your data, not guesswork.
              </p>

              <p className="text-slate-200 font-medium pt-2">
                You don't have to choose between competing and caring about your brain. Track your performance. Know your baseline. Make informed decisions. Keep doing what you love, with your eyes open.
              </p>

              <p className="text-sm text-slate-400 italic pt-4 border-t border-slate-750/50 mt-6">
                This is not a medical device. Cerebro is a self-tracking tool for personal awareness. Always consult medical professionals for health decisions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
