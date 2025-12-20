export default function Privacy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-850 text-white p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <a href="/dashboard" className="text-rose-500 hover:text-rose-400 transition-colors">
            ← Back to Dashboard
          </a>
        </div>

        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>

        <section className="space-y-6 text-slate-300 leading-relaxed">
          <p className="text-sm text-slate-400">
            <strong>Last Updated:</strong> {new Date().toLocaleDateString()}
          </p>

          <div>
            <h2 className="text-2xl font-bold text-white mt-8 mb-4">Data We Collect</h2>
            <p>
              Cerebro collects email addresses and cognitive test results including reaction time measurements,
              speech metrics, and memory test scores. All data is stored securely and is only
              accessible by you through your password-protected account.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mt-8 mb-4">How We Use Your Data</h2>
            <p>
              Your data is used solely to provide you with cognitive performance tracking over time.
              We calculate your personal baseline and track trends in your performance.
              We do not share, sell, or distribute your data to third parties under any circumstances.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mt-8 mb-4">Data Security</h2>
            <p>
              We use industry-standard encryption and security measures to protect your data.
              All data is stored in secure databases with row-level security policies that ensure
              only you can access your own information. Your password is hashed and never stored in plain text.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mt-8 mb-4">Audio Storage</h2>
            <p>
              By default, audio recordings from speech tests are NOT stored. Only timing metrics
              and speech analysis are saved. You can opt-in to audio storage in your account settings,
              but we recommend against it for privacy reasons.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mt-8 mb-4">Your Rights</h2>
            <p>
              You have the right to access, modify, or delete your account and all associated data
              at any time. To request deletion of your account, contact us using the information below.
              Upon deletion, all your data will be permanently removed from our systems.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mt-8 mb-4">Third-Party Services</h2>
            <p>
              Cerebro uses Supabase for authentication and data storage, and Vercel for hosting.
              These services are SOC 2 compliant and follow industry-standard security practices.
              We do not use any third-party analytics, tracking, or advertising services.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mt-8 mb-4">Cookies</h2>
            <p>
              We use only essential cookies required for authentication and session management.
              We do not use tracking cookies or third-party advertising cookies.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mt-8 mb-4">Changes to This Policy</h2>
            <p>
              We may update this privacy policy from time to time. We will notify users of any
              material changes by updating the "Last Updated" date at the top of this policy.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mt-8 mb-4">Contact</h2>
            <p>
              For privacy concerns or data deletion requests, please contact us at the email
              address associated with your account.
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
