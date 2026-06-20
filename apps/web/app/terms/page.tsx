import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Smart Planner Terms of Service – understand your rights and responsibilities when using our platform.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-16 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Back link */}
        <Link
          href="/register"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors mb-10"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Back to Register
        </Link>

        {/* Header */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-1.5 text-indigo-400 text-xs font-medium mb-4">
            Legal
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">Terms of Service</h1>
          <p className="text-slate-400 text-sm">Last updated: June 2026</p>
        </div>

        {/* Content */}
        <div className="space-y-10 text-slate-300 leading-relaxed">
          <Section title="1. Acceptance of Terms">
            <p>
              By accessing or using Smart Planner ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.
            </p>
          </Section>

          <Section title="2. Description of Service">
            <p>
              Smart Planner is a personal finance management application that allows you to track expenses, manage budgets, monitor savings goals, and gain insights into your financial health. The Service is provided for personal, non-commercial use.
            </p>
          </Section>

          <Section title="3. User Accounts">
            <p>
              You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized use of your account. We are not liable for any loss arising from unauthorized use of your account.
            </p>
          </Section>

          <Section title="4. Privacy">
            <p>
              Your use of the Service is also governed by our{' '}
              <Link href="/privacy" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2">
                Privacy Policy
              </Link>
              , which is incorporated into these Terms by reference. Please review our Privacy Policy to understand our practices.
            </p>
          </Section>

          <Section title="5. User Data">
            <p>
              You retain ownership of all financial data you input into the Service. By using the Service, you grant us a limited license to store and process this data solely to provide the Service to you. We do not sell your personal or financial data to third parties.
            </p>
          </Section>

          <Section title="6. Prohibited Uses">
            <p>You agree not to:</p>
            <ul className="list-disc list-inside space-y-2 mt-3 text-slate-400">
              <li>Use the Service for any unlawful purpose</li>
              <li>Attempt to gain unauthorized access to any portion of the Service</li>
              <li>Interfere with or disrupt the integrity or performance of the Service</li>
              <li>Upload or transmit malicious code or harmful content</li>
              <li>Impersonate any person or entity</li>
            </ul>
          </Section>

          <Section title="7. Disclaimers">
            <p>
              The Service is provided "as is" without warranties of any kind. Smart Planner does not provide financial advice. All financial insights and projections are for informational purposes only and should not be relied upon as professional financial guidance.
            </p>
          </Section>

          <Section title="8. Limitation of Liability">
            <p>
              To the fullest extent permitted by law, Smart Planner shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Service, including loss of data or financial loss.
            </p>
          </Section>

          <Section title="9. Changes to Terms">
            <p>
              We reserve the right to modify these Terms at any time. We will notify users of material changes via email or an in-app notification. Your continued use of the Service after changes constitutes acceptance of the new Terms.
            </p>
          </Section>

          <Section title="10. Contact">
            <p>
              If you have any questions about these Terms of Service, please contact us through the app's support section.
            </p>
          </Section>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-slate-800 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <p className="text-slate-500 text-sm">© {new Date().getFullYear()} Smart Planner. All rights reserved.</p>
          <div className="flex gap-6 text-sm">
            <Link href="/privacy" className="text-slate-400 hover:text-slate-200 transition-colors">Privacy Policy</Link>
            <Link href="/register" className="text-indigo-400 hover:text-indigo-300 transition-colors">Create Account</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-white mb-3">{title}</h2>
      <div className="text-slate-400">{children}</div>
    </div>
  );
}
