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

          <div className="space-y-6">
            {/* Origin Story */}
            <div className="bg-slate-850/80 backdrop-blur-xl rounded-2xl border border-slate-750/50 p-6">
              <h2 className="text-xl font-bold text-white mb-4">
                Built by a Fighter, for Fighters
              </h2>
              <div className="space-y-4 text-slate-300 leading-relaxed">
                <p>
                  Cerebro was built by a college student and former MMA fighter who understood the reality of brain health in contact sports. After years of training and competing, the awareness of cumulative impact became impossible to ignore.
                </p>
                <p>
                  The question wasn't whether contact sports affect the brain—it was how to track those changes over time in a way that's private, accessible, and actually useful for athletes who love what they do but want to be smart about it.
                </p>
              </div>
            </div>

            {/* Purpose */}
            <div className="bg-slate-850/80 backdrop-blur-xl rounded-2xl border border-slate-750/50 p-6">
              <h2 className="text-xl font-bold text-white mb-4">
                For Athletes Who Take Brain Health Seriously
              </h2>
              <div className="space-y-4 text-slate-300 leading-relaxed">
                <p>
                  Cerebro is designed for contact sport athletes—MMA fighters, boxers, rugby players, football athletes—anyone who knows the risks but wants to stay in the game responsibly.
                </p>
                <p>
                  This isn't about fear or stopping what you love. It's about having the data to make informed decisions. Track your cognitive performance over time. Notice patterns. Know when you need rest. Be proactive, not reactive.
                </p>
              </div>
            </div>

            {/* Privacy First */}
            <div className="bg-slate-850/80 backdrop-blur-xl rounded-2xl border border-slate-750/50 p-6">
              <h2 className="text-xl font-bold text-white mb-4">
                Your Data, Your Eyes Only
              </h2>
              <div className="space-y-4 text-slate-300 leading-relaxed">
                <p>
                  Athletes shouldn't have to choose between tracking their brain health and keeping their career private. Cerebro keeps all your data secure and personal.
                </p>
                <ul className="space-y-2 pl-5">
                  <li className="text-slate-400">• No data sharing with coaches, teams, or organizations</li>
                  <li className="text-slate-400">• No third-party analytics or tracking</li>
                  <li className="text-slate-400">• You own your data completely</li>
                  <li className="text-slate-400">• Self-tracking, self-awareness, self-determination</li>
                </ul>
              </div>
            </div>

            {/* The Tool */}
            <div className="bg-slate-850/80 backdrop-blur-xl rounded-2xl border border-slate-750/50 p-6">
              <h2 className="text-xl font-bold text-white mb-4">
                What Cerebro Does
              </h2>
              <div className="space-y-4 text-slate-300 leading-relaxed">
                <p>
                  Cerebro measures three key areas of cognitive performance: reaction time, speech processing, and memory recall. Together, these give you a snapshot of how your brain is functioning.
                </p>
                <p>
                  Track your performance over time. Compare yourself to your baseline, not someone else's. Notice trends. Make decisions based on your data, not guesswork.
                </p>
                <p className="text-sm text-slate-400 italic">
                  This is not a medical device. Cerebro is a self-tracking tool for personal awareness. Always consult medical professionals for health decisions.
                </p>
              </div>
            </div>

            {/* Call to Action */}
            <div className="bg-gradient-to-br from-rose-900/20 to-rose-800/10 backdrop-blur-xl rounded-2xl border border-rose-700/30 p-6">
              <h2 className="text-xl font-bold text-white mb-3">
                Stay in the Fight, Stay Smart
              </h2>
              <p className="text-slate-300 leading-relaxed">
                You don't have to choose between competing and caring about your brain. Track your performance. Know your baseline. Make informed decisions. Keep doing what you love, with your eyes open.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
