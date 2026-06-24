'use client';

import * as React from 'react';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  Settings,
  Wallet,
  Tags,
  PieChart,
  ArrowLeftRight,
  Target,
  TrendingDown,
  CalendarDays,
  Calendar,
  BarChart3,
  Globe,
  Shield,
  BookOpen,
  Search,
  ChevronRight,
  Sparkles,
  Info,
  ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DocSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  category: string;
  description: string;
  content: React.ReactNode;
}

export default function DocsPage() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedSection, setSelectedSection] = React.useState('settings');

  const sections: DocSection[] = [
    {
      id: 'settings',
      title: 'Settings & Profile Setup',
      icon: <Settings className="w-4 h-4" />,
      category: 'Configuration',
      description: 'Configure default currency, timezone, profile details, push notifications, and backup/restore tools.',
      content: (
        <div className="space-y-6">
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
            Customize settings to configure how Smart Planner handles your currency, timezone, security, and push notifications.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-5 border-slate-200/60 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/10">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-primary-500/10 flex items-center justify-center text-primary-500">
                  <Globe className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Currency & Timezone</h4>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Choose the default currency for all consolidated dashboard views. Transactions in other currencies will automatically convert to this pivot currency. Set your local timezone to align recurring updates.
              </p>
            </Card>
            <Card className="p-5 border-slate-200/60 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/10">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500">
                  <CalendarDays className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Push Notifications</h4>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Opt-in to web push notification alerts under the **Preferences** tab. Receive real-time updates and push warning notifications directly on your browser or device for upcoming bills or budget limits.
              </p>
            </Card>
            <Card className="p-5 border-slate-200/60 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/10 col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-500">
                  <Settings className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Data Portability (Backup & Restore)</h4>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Smart Planner prioritizes your data ownership. Under the **Data** tab, export a full JSON dump of your entire ledger (accounts, transactions, bills, and goals). You can restore this file at any time to recover your logs.
              </p>
            </Card>
          </div>
        </div>
      )
    },
    {
      id: 'accounts',
      title: 'Managing Accounts',
      icon: <Wallet className="w-4 h-4" />,
      category: 'Core Ledger',
      description: 'Create, update, and manage accounts (checking, savings, credit card, cash, investments).',
      content: (
        <div className="space-y-6">
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
            Accounts represent the physical or digital containers where your money resides.
          </p>
          <div className="space-y-4">
            <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Supported Account Types:</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { type: 'Cash', desc: 'Paper & coins in hand' },
                { type: 'Checking', desc: 'Standard bank accounts' },
                { type: 'Savings', desc: 'Interest-bearing savings' },
                { type: 'Mobile Money', desc: 'Digital wallets & phone pay' },
                { type: 'Credit Card', desc: 'Liability debt cards' },
                { type: 'Investment', desc: 'Brokerage & trading logs' }
              ].map((a, idx) => (
                <div key={idx} className="p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/20 dark:bg-slate-900/10">
                  <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block mb-0.5">{a.type}</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">{a.desc}</span>
                </div>
              ))}
            </div>

            <Card className="p-5 border-slate-200/60 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/10">
              <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm mb-2">Setting a Default Account</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Toggling **Set as Default** on an account makes it the pre-selected option when adding any new transactions, transfers, or bill payments, speeding up your day-to-day logging.
              </p>
            </Card>
          </div>
        </div>
      )
    },
    {
      id: 'categories',
      title: 'Customizing Categories',
      icon: <Tags className="w-4 h-4" />,
      category: 'Core Ledger',
      description: 'Organize your income and expenses using custom or admin-defined system categories.',
      content: (
        <div className="space-y-6">
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
            Categories enable you to organize transactions for precise reporting, budgets, and savings tracking.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-5 border-slate-200/60 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/10">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="info" className="text-[10px] font-bold">System</Badge>
                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">System Categories</h4>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Pre-defined, universal categories created by administrators. These ensure standard transaction structures and cannot be edited or deleted by standard accounts.
              </p>
            </Card>
            <Card className="p-5 border-slate-200/60 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/10">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="default" className="text-[10px] font-bold">Personal</Badge>
                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Custom Categories</h4>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Create personal categories customized for your specific lifestyle. Assign custom colors, select from dozens of icons, and filter them under either the **Income** or **Expense** tab.
              </p>
            </Card>
          </div>
        </div>
      )
    },
    {
      id: 'budgets',
      title: 'Predictive Budgets',
      icon: <PieChart className="w-4 h-4" />,
      category: 'Planning',
      description: 'Create multi-category budgets and leverage the forecasting engine to project end-of-period usage.',
      content: (
        <div className="space-y-6">
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
            Budgets define monthly, quarterly, or annual limits for your spending categories. Smart Planner computes actual and projected metrics dynamically.
          </p>
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-amber-200/80 dark:border-amber-900/30 bg-amber-500/5 dark:bg-amber-950/10 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-xs text-amber-800 dark:text-amber-300 block mb-1">spending Forecast System</span>
                <span className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed block">
                  Smart Planner monitors how quickly you spend during a budget period. If your current pace projects you will exceed your allocation, the system shows a **Warning** and prints a warning alert (⚠️) even if you are currently below the limit.
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Understanding Status Badges:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-900/10">
                  <Badge variant="success">Active</Badge>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">Budget is active and spending is on track.</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-900/10">
                  <Badge variant="warning">Warning</Badge>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">Actual spending has exceeded 80% of limit.</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-900/10">
                  <Badge variant="danger">Over Budget</Badge>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">Actual spending has crossed 100% of allocation.</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-900/10">
                  <Badge variant="default">Inactive</Badge>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">Budget duration has passed and is expired.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'transactions',
      title: 'The Transactions Ledger',
      icon: <ArrowLeftRight className="w-4 h-4" />,
      category: 'Core Ledger',
      description: 'Record daily income, expenses, account transfers, split costs, and log recurring entries.',
      content: (
        <div className="space-y-6">
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
            Record all transactions to keep your dashboard and accounts balanced.
          </p>
          <div className="space-y-4">
            <Card className="p-5 border-slate-200/60 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/10">
              <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm mb-2">Supported Types</h4>
              <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-2 list-disc list-inside leading-relaxed">
                <li><strong className="text-slate-700 dark:text-slate-300">Income:</strong> Increases the balance of the designated account.</li>
                <li><strong className="text-slate-700 dark:text-slate-300">Expense:</strong> Decrements the balance of the account and aggregates under categories.</li>
                <li><strong className="text-slate-700 dark:text-slate-300">Transfer:</strong> Shifts funds from one wallet/account to another. (No category is associated).</li>
              </ul>
            </Card>

            <Card className="p-5 border-slate-200/60 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/10">
              <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm mb-2">Ledger Features</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
                Quickly navigate thousands of items using pagination, descriptive search bar matches, and filters (by account, category, or type).
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                To log repeating patterns easily, select the **Duplicate** option on any transaction row to populate details into a new form.
              </p>
            </Card>
          </div>
        </div>
      )
    },
    {
      id: 'goals',
      title: 'Savings Goals Tracker',
      icon: <Target className="w-4 h-4" />,
      category: 'Planning',
      description: 'Set target savings milestones, specify completion dates, and log manual or category-linked contributions.',
      content: (
        <div className="space-y-6">
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
            Create goals to track long-term purchases, emergency funds, or investments.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-5 border-slate-200/60 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/10">
              <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm mb-2">Progress Milestones</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Define the absolute target amount and completion deadline. The dashboard shows visual percentages, progress lines, and how much savings are still needed to reach the target.
              </p>
            </Card>
            <Card className="p-5 border-slate-200/60 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/10">
              <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm mb-2">Category Auto-Link</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Optionally link your savings goal to a category. When you log transaction inputs or mark a bill with this category as paid, the system automatically registers a contribution to the goal.
              </p>
            </Card>
          </div>
        </div>
      )
    },
    {
      id: 'debts',
      title: 'Debts & Liabilities',
      icon: <TrendingDown className="w-4 h-4" />,
      category: 'Planning',
      description: 'Track loans, interest rates, target payoff dates, and record payments directly to principal balances.',
      content: (
        <div className="space-y-6">
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
            Manage your liabilities and loans in one unified view.
          </p>
          <Card className="p-5 border-slate-200/60 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/10">
            <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm mb-2">Debt Classifications</h4>
            <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-2 list-disc list-inside leading-relaxed">
              <li><strong className="text-slate-700 dark:text-slate-300">Lent (Asset):</strong> Money you lent out to others. Represents an incoming balance due.</li>
              <li><strong className="text-slate-700 dark:text-slate-300">Borrowed (Liability):</strong> Money you borrowed from banks or creditors. Includes optional interest rate tracking and payoff targets.</li>
            </ul>
          </Card>
        </div>
      )
    },
    {
      id: 'bills',
      title: 'Bills & Notifications',
      icon: <CalendarDays className="w-4 h-4" />,
      category: 'Core Ledger',
      description: 'Schedule recurring bill requirements, subscribe to push notifications, and automate balance logging.',
      content: (
        <div className="space-y-6">
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
            Never miss utility bills, subscriptions, or rent payments with active alerts and quick ledger logs.
          </p>
          <div className="space-y-4">
            <Card className="p-5 border-slate-200/60 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/10">
              <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm mb-2">Automated Transaction Logging</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                When you click **Pay** on a bill, the system prompts you to pick an account. Once paid, the system automatically writes an `Expense` transaction log with today's date, deducts the amount from the account balance, and advances the bill's next due date (if marked as recurring).
              </p>
            </Card>

            <Card className="p-5 border-slate-200/60 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/10">
              <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm mb-2">Web Push Notifications</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Enable push notifications directly on the Bills page using the amber status card. When alerts are enabled, the server triggers notification reminders to your browser when a bill's due date approaches.
              </p>
            </Card>
          </div>
        </div>
      )
    },
    {
      id: 'other',
      title: 'Calendar, Reports & Exchange Rates',
      icon: <BarChart3 className="w-4 h-4" />,
      category: 'Analytics',
      description: 'View monthly calendars, track analytics reports, and view exchange rates.',
      content: (
        <div className="space-y-6">
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
            Consolidated views of calendars, monthly summaries, and currency exchange rates.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 border-slate-200/60 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/10">
              <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-primary-500" /> Calendar
              </h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Provides a grid of your month showing transaction logs (green/red) and upcoming due bills, making cash flow planning highly visual.
              </p>
            </Card>
            <Card className="p-4 border-slate-200/60 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/10">
              <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs mb-1.5 flex items-center gap-1">
                <BarChart3 className="w-3.5 h-3.5 text-violet-500" /> Reports
              </h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Aggregates income vs. expense graphs, category breakdowns, and sends summary newsletters on the 1st of every month automatically.
              </p>
            </Card>
            <Card className="p-4 border-slate-200/60 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/10">
              <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs mb-1.5 flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-emerald-500" /> Exchange Rates
              </h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Displays real-time currency conversion rates. Exchange rates update hourly in the background to ensure conversions remain precise.
              </p>
            </Card>
          </div>
        </div>
      )
    },
    {
      id: 'admin',
      title: 'Admin Panel',
      icon: <Shield className="w-4 h-4" />,
      category: 'Configuration',
      description: 'Administration control tools, system categories configuration, and platform statistics.',
      content: (
        <div className="space-y-6">
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
            Accessible only to accounts configured with the `ADMIN` role. Offers system management tools.
          </p>
          <Card className="p-5 border-slate-200/60 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/10">
            <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm mb-2">Administrative Controls</h4>
            <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-2 list-disc list-inside leading-relaxed">
              <li><strong className="text-slate-700 dark:text-slate-300">User Manager:</strong> Block accounts, inspect creation dates, or update user permissions.</li>
              <li><strong className="text-slate-700 dark:text-slate-300">System Categories:</strong> Manage default system categories populated on registration.</li>
              <li><strong className="text-slate-700 dark:text-slate-300">Database & Platform Stats:</strong> Monitor user growth and total ledger volume metrics.</li>
            </ul>
          </Card>
        </div>
      )
    }
  ];

  const filteredSections = sections.filter(
    (s) =>
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeSection = sections.find((s) => s.id === selectedSection) || sections[0];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Documentation & Guides"
        subtitle="Learn how to manage accounts, configure settings, set up budgets, and log transactions."
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Side: Navigation Links & Search */}
        <div className="lg:col-span-1 space-y-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search guides..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full text-xs placeholder-slate-400 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-1 focus:ring-primary-500"
            />
          </div>

          <div className="flex flex-col gap-1 max-h-[60vh] overflow-y-auto pr-1">
            {filteredSections.map((sec) => {
              const isActive = selectedSection === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => setSelectedSection(sec.id)}
                  className={cn(
                    'flex items-center justify-between px-3.5 py-3 rounded-xl text-left transition-all text-xs font-semibold select-none outline-none focus:outline-none border',
                    isActive
                      ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400 border-primary-500/20 shadow-glow'
                      : 'text-slate-600 dark:text-slate-400 border-transparent hover:bg-slate-100/60 dark:hover:bg-slate-900/50 hover:text-slate-900 dark:hover:text-slate-200'
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={cn(isActive ? 'text-primary-500' : 'text-slate-400')}>
                      {sec.icon}
                    </span>
                    <span className="truncate">{sec.title}</span>
                  </div>
                  <ChevronRight className={cn('w-3.5 h-3.5 transition-transform flex-shrink-0', isActive ? 'text-primary-500 translate-x-0.5' : 'text-slate-400/50')} />
                </button>
              );
            })}
            {filteredSections.length === 0 && (
              <div className="p-4 text-center text-xs text-slate-400 bg-slate-50/50 dark:bg-slate-900/20 rounded-xl">
                No guides matching search query.
              </div>
            )}
          </div>

          {/* Quick link to raw guide file */}
          <Card className="p-4 border-slate-200/60 dark:border-slate-800 bg-slate-50/10 dark:bg-slate-900/5 select-none hidden lg:block">
            <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Offline Reading</h5>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
              You can find a raw markdown copy of this guide in your local project workspace directory:
            </p>
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 p-2 rounded-lg break-all select-all">
              docs/user_guide.md
            </div>
          </Card>
        </div>

        {/* Right Side: Section Details Card */}
        <div className="lg:col-span-3">
          <Card className="p-6 md:p-8 border-slate-200/80 dark:border-slate-800/80 shadow-glow relative overflow-hidden bg-white/70 dark:bg-slate-900/50 backdrop-blur-md">
            {/* Ambient Background decoration */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary-500/5 rounded-full filter blur-3xl pointer-events-none -mr-12 -mt-12" />

            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-5 mb-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="text-[9px] uppercase tracking-wider px-1.5 py-0">
                    {activeSection.category}
                  </Badge>
                </div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <span className="text-primary-500">{activeSection.icon}</span>
                  {activeSection.title}
                </h2>
              </div>
            </div>

            {/* Document Content */}
            <div className="min-h-[40vh] transition-opacity duration-300">
              {activeSection.content}
            </div>

            <div className="mt-8 pt-5 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400 select-none">
              <span className="flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-slate-400" /> Need more help? Contact system administrator.
              </span>
              <span>Smart Planner Guides v1.0</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
