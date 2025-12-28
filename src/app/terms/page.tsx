export default function Terms() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-850 text-white p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <a href="/dashboard" className="text-rose-500 hover:text-rose-400 transition-colors">
            ← Back to Dashboard
          </a>
        </div>

        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>

        <section className="space-y-6 text-slate-300 leading-relaxed">
          <p className="text-sm text-slate-400">
            <strong>Last Updated:</strong> {new Date().toLocaleDateString()}
          </p>

          <div className="bg-red-900/20 border border-red-700/50 rounded-xl p-6 my-8">
            <h2 className="text-2xl font-bold text-red-300 mb-4">
              Not a Medical Device
            </h2>
            <p className="text-red-200 font-medium leading-relaxed">
              Cogna is NOT a medical device and is NOT intended to diagnose, treat,
              cure, or prevent any disease or medical condition. This tool is for personal
              cognitive performance tracking and awareness only. It should never be used
              as a substitute for professional medical advice, diagnosis, or treatment.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mt-8 mb-4">Acceptance of Terms</h2>
            <p>
              By accessing and using Cogna, you accept and agree to be bound by these Terms
              of Service. If you do not agree to these terms, please do not use this service.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mt-8 mb-4">Intended Use</h2>
            <p>
              Cogna is designed for personal cognitive performance self-tracking. It measures
              reaction time, speech patterns, and memory recall to help you monitor trends in
              your own performance over time. Results should be compared only to your personal
              baseline, not to other individuals.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mt-8 mb-4">Medical Disclaimer</h2>
            <p>
              Always seek the advice of qualified healthcare professionals with any questions
              you may have regarding a medical condition or cognitive health concerns. Never
              disregard professional medical advice or delay seeking it because of something
              you have observed using Cogna.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mt-8 mb-4">Liability Limitation</h2>
            <p>
              Use of this service is at your own risk. We are not liable for any decisions
              made based on data from this tool. Cogna is provided "as is" without warranties
              of any kind, either express or implied. We do not guarantee the accuracy,
              reliability, or completeness of any data or analysis.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mt-8 mb-4">Acceptable Use</h2>
            <p>
              You agree to use Cogna only for personal, non-commercial purposes. You may not:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Use the service for any unlawful purpose</li>
              <li>Attempt to gain unauthorized access to other users' data</li>
              <li>Interfere with or disrupt the service or servers</li>
              <li>Use automated systems to access the service without permission</li>
              <li>Misrepresent yourself or provide false information</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mt-8 mb-4">Account Responsibility</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials
              and for all activities that occur under your account. You must immediately notify
              us of any unauthorized use of your account.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mt-8 mb-4">Data Accuracy</h2>
            <p>
              While we strive to provide accurate measurements, cognitive test results can be
              influenced by many factors including device performance, environmental conditions,
              fatigue, stress, and more. Results should be interpreted with appropriate context
              and caution.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mt-8 mb-4">Service Modifications</h2>
            <p>
              We reserve the right to modify, suspend, or discontinue any aspect of the service
              at any time without prior notice. We are not liable to you or any third party for
              any modification, suspension, or discontinuance of the service.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mt-8 mb-4">Account Termination</h2>
            <p>
              We reserve the right to terminate or suspend accounts that violate these terms,
              without prior notice or liability. You may terminate your account at any time
              by contacting us to request account deletion.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mt-8 mb-4">Governing Law</h2>
            <p>
              These terms shall be governed by and construed in accordance with applicable
              laws, without regard to conflict of law principles.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mt-8 mb-4">Changes to Terms</h2>
            <p>
              We may update these Terms of Service from time to time. We will notify users
              of any material changes by updating the "Last Updated" date at the top of this page.
              Continued use of the service after changes constitutes acceptance of the new terms.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mt-8 mb-4">Contact</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us
              at the email address associated with your account.
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
