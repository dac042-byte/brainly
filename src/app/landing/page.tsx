import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Brain Tracking Tools - Monitor Your Cognitive Health | BrainGauge',
  description: 'Free brain tracking tools to monitor cognitive health. Test reaction time, speech patterns, and memory recall. Track brain performance over time with science-based assessments.',
  keywords: ['brain tracking tools', 'cognitive tracking', 'brain health monitoring', 'cognitive health tools', 'memory tracking', 'brain assessment tools', 'cognitive testing software'],
}

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
          Brain Tracking Tools for Cognitive Health
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
          Monitor your cognitive health with science-based brain tracking tools.
          Test reaction time, speech patterns, and memory recall in just 2 minutes per week.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/signup"
            className="bg-gradient-to-r from-rose-600 to-pink-600 text-white px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition"
          >
            Start Free
          </Link>
          <Link
            href="/mission"
            className="border-2 border-rose-600 text-rose-600 dark:text-rose-400 px-8 py-3 rounded-lg font-semibold hover:bg-rose-50 dark:hover:bg-rose-950 transition"
          >
            Learn More
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          Comprehensive Brain Tracking Tools
        </h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold mb-3 text-rose-600">Reaction Time Test</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Track your cognitive speed and response consistency.
              Detect changes in processing speed over time.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold mb-3 text-rose-600">Speech Analysis</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Monitor verbal fluency, articulation, and speech patterns.
              AI-powered analysis of cognitive communication.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold mb-3 text-rose-600">Memory Tracking</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Test short-term memory retention and recall ability.
              Track memory performance trends.
            </p>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-gray-50 dark:bg-gray-900 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Use Brain Tracking Tools?
          </h2>
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-rose-600 text-white rounded-full flex items-center justify-center font-bold">✓</div>
              <div>
                <h3 className="font-bold mb-2">Early Detection of Cognitive Changes</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Track baseline cognitive health and detect potential changes early with regular brain tracking.
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-rose-600 text-white rounded-full flex items-center justify-center font-bold">✓</div>
              <div>
                <h3 className="font-bold mb-2">Monitor Brain Health Over Time</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Use our cognitive tracking tools to see trends and patterns in your brain performance.
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-rose-600 text-white rounded-full flex items-center justify-center font-bold">✓</div>
              <div>
                <h3 className="font-bold mb-2">Private & Secure Brain Assessment</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Your cognitive health data stays encrypted and private. No sharing, no selling.
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-rose-600 text-white rounded-full flex items-center justify-center font-bold">✓</div>
              <div>
                <h3 className="font-bold mb-2">Science-Based Cognitive Testing</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Our brain tracking tools are based on established cognitive assessment methods.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          How Our Cognitive Tracking Works
        </h2>
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="flex gap-6 items-start">
            <div className="flex-shrink-0 w-12 h-12 bg-rose-600 text-white rounded-full flex items-center justify-center text-xl font-bold">1</div>
            <div>
              <h3 className="text-xl font-bold mb-2">Take Your First Assessment</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Complete a quick 2-minute brain test to establish your cognitive baseline.
              </p>
            </div>
          </div>
          <div className="flex gap-6 items-start">
            <div className="flex-shrink-0 w-12 h-12 bg-rose-600 text-white rounded-full flex items-center justify-center text-xl font-bold">2</div>
            <div>
              <h3 className="text-xl font-bold mb-2">Test Weekly</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Consistent weekly brain tracking provides the most accurate cognitive health monitoring.
              </p>
            </div>
          </div>
          <div className="flex gap-6 items-start">
            <div className="flex-shrink-0 w-12 h-12 bg-rose-600 text-white rounded-full flex items-center justify-center text-xl font-bold">3</div>
            <div>
              <h3 className="text-xl font-bold mb-2">Track Your Progress</h3>
              <p className="text-gray-600 dark:text-gray-300">
                View trends in your brain performance over weeks and months with visual dashboards.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-rose-600 to-pink-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Start Tracking Your Cognitive Health Today
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Free brain tracking tools. No credit card required.
          </p>
          <Link
            href="/signup"
            className="bg-white text-rose-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition inline-block"
          >
            Get Started Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-gray-600 dark:text-gray-400 text-sm">
        <div className="flex justify-center gap-6 mb-4">
          <Link href="/privacy" className="hover:text-rose-600">Privacy</Link>
          <Link href="/terms" className="hover:text-rose-600">Terms</Link>
          <Link href="/mission" className="hover:text-rose-600">Mission</Link>
        </div>
        <p>© 2025 BrainGauge. All rights reserved.</p>
      </footer>
    </div>
  )
}
