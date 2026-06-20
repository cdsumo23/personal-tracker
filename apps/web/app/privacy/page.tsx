import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Smart Planner Privacy Policy – learn how we collect, use, and protect your personal information.',
};

export default function PrivacyPage() {
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
          <h1 className="text-3xl font-bold text-white mb-3">Privacy Policy</h1>
          <p className="text-slate-400 text-sm">Last updated: June 2026</p>
        </div>

        {/* Content */}
        <div className="space-y-10 text-slate-300 leading-relaxed">
          <Section title="1. Introduction">
            <p>
              Smart Planner ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our personal finance application.
            </p>
          </Section>

          <Section title="2. Information We Collect">
            <p>We may collect the following types of information:</p>
            <ul className="list-disc list-inside space-y-2 mt-3 text-slate-400">
              <li><strong className="text-slate-300">Account Information:</strong> Name, email address, and password (stored encrypted)</li>
              <li><strong className="text-slate-300">Financial Data:</strong> Transactions, budgets, goals, accounts, and debts you enter</li>
              <li><strong className="text-slate-300">Usage Data:</strong> How you interact with the app (anonymised and aggregated)</li>
              <li><strong className="text-slate-300">Device Information:</strong> Browser type, device type, and operating system</li>
            </ul>
          </Section>

          <Section title="3. How We Use Your Information">
            <p>We use the information we collect to:</p>
            <ul className="list-disc list-inside space-y-2 mt-3 text-slate-400">
              <li>Provide, operate, and improve the Service</li>
              <li>Send you account-related notifications (bill reminders, goal alerts)</li>
              <li>Respond to your inquiries and provide customer support</li>
              <li>Detect and prevent fraudulent or unauthorized activity</li>
              <li>Comply with legal obligations</li>
            </ul>
          </Section>

          <Section title="4. Data Storage & Security">
            <p>
              Your data is stored on secure servers. We use industry-standard encryption (TLS) for data in transit and encryption at rest for sensitive fields. Passwords are hashed using bcrypt and are never stored in plain text.
            </p>
            <p className="mt-3">
              While we implement these security measures, no method of transmission over the internet is 100% secure and we cannot guarantee absolute security.
            </p>
          </Section>

          <Section title="5. Data Sharing">
            <p>
              We do not sell, trade, or rent your personal information to third parties. We may share information with:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-3 text-slate-400">
              <li><strong className="text-slate-300">Service Providers:</strong> Trusted vendors who help us operate the Service (e.g., hosting providers), bound by confidentiality agreements</li>
              <li><strong className="text-slate-300">Legal Requirements:</strong> When required by law or to protect our rights</li>
            </ul>
          </Section>

          <Section title="6. Cookies">
            <p>
              We use essential cookies to maintain your session and authentication state. We do not use tracking or advertising cookies. You can configure your browser to refuse cookies, but this may limit your ability to use certain features.
            </p>
          </Section>

          <Section title="7. Your Rights">
            <p>You have the right to:</p>
            <ul className="list-disc list-inside space-y-2 mt-3 text-slate-400">
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your account and associated data</li>
              <li>Export your financial data in a portable format</li>
              <li>Withdraw consent for optional data processing</li>
            </ul>
            <p className="mt-3">To exercise these rights, use the account settings within the app or contact our support team.</p>
          </Section>

          <Section title="8. Data Retention">
            <p>
              We retain your data for as long as your account is active. If you delete your account, we will delete your personal data within 30 days, except where we are required by law to retain it longer.
            </p>
          </Section>

          <Section title="9. Children's Privacy">
            <p>
              The Service is not directed to individuals under the age of 16. We do not knowingly collect personal information from children. If we become aware that a child has provided us with personal information, we will delete it promptly.
            </p>
          </Section>

          <Section title="10. Changes to This Policy">
            <p>
              We may update this Privacy Policy from time to time. We will notify you of significant changes via email or an in-app notification. Your continued use of the Service after changes constitutes acceptance.
            </p>
          </Section>

          <Section title="11. Contact Us">
            <p>
              If you have questions or concerns about this Privacy Policy, please contact us through the app's support section.
            </p>
          </Section>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-slate-800 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <p className="text-slate-500 text-sm">© {new Date().getFullYear()} Smart Planner. All rights reserved.</p>
          <div className="flex gap-6 text-sm">
            <Link href="/terms" className="text-slate-400 hover:text-slate-200 transition-colors">Terms of Service</Link>
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
