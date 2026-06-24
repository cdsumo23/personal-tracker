'use client';

import * as React from 'react';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { Badge } from '@/components/ui/Badge';
import {
  Settings,
  Wallet,
  Tags,
  PieChart,
  ArrowLeftRight,
  Target,
  TrendingDown,
  CalendarDays,
  BarChart3,
  Globe,
  Shield,
  Search,
  ChevronRight,
  CheckCircle2,
  Lightbulb,
  AlertTriangle,
  MousePointer,
  FileText,
  BookOpen,
  Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/* ─────────────── Reusable primitives ─────────────── */

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <div className="w-6 h-6 rounded-full bg-primary-500/15 text-primary-600 dark:text-primary-400 flex items-center justify-center text-[11px] font-extrabold flex-shrink-0 mt-0.5">
        {n}
      </div>
      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{children}</p>
    </div>
  );
}

function FieldRow({ label, placeholder, tip }: { label: string; placeholder: string; tip?: string }) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-3 items-start py-2 border-b border-slate-100 dark:border-slate-800/60 last:border-0">
      <span className="font-bold text-xs text-slate-700 dark:text-slate-300 pt-0.5">{label}</span>
      <div>
        <span className="text-xs text-slate-500 dark:text-slate-400 font-mono bg-slate-100 dark:bg-slate-800/60 px-2 py-0.5 rounded-md">{placeholder}</span>
        {tip && <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{tip}</p>}
      </div>
    </div>
  );
}

function Callout({ type, children }: { type: 'tip' | 'note' | 'warn'; children: React.ReactNode }) {
  const styles = {
    tip:  { bg: 'bg-emerald-500/5 dark:bg-emerald-950/20 border-emerald-300/60 dark:border-emerald-800/50', icon: <Lightbulb className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />, label: 'Tip' },
    note: { bg: 'bg-primary-500/5 dark:bg-primary-950/20 border-primary-300/60 dark:border-primary-800/50', icon: <FileText className="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" />, label: 'Note' },
    warn: { bg: 'bg-amber-500/5 dark:bg-amber-950/20 border-amber-300/60 dark:border-amber-800/50', icon: <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />, label: 'Warning' },
  }[type];
  return (
    <div className={cn('flex gap-2.5 p-3.5 rounded-xl border text-xs text-slate-600 dark:text-slate-400 leading-relaxed', styles.bg)}>
      {styles.icon}
      <span><strong>{styles.label}:</strong> {children}</span>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-base mb-4 flex items-center gap-2">{children}</h3>;
}

function SubTitle({ children }: { children: React.ReactNode }) {
  return <h4 className="font-bold text-slate-700 dark:text-slate-200 text-sm mt-6 mb-3 border-b border-slate-100 dark:border-slate-800/60 pb-1.5">{children}</h4>;
}

/* ─────────────── Section content ─────────────── */

const SECTIONS = [
  {
    id: 'settings',
    title: 'Settings & Profile',
    icon: <Settings className="w-4 h-4" />,
    category: 'Get Started',
    description: 'Set up your currency, timezone, password, and notification preferences.',
    content: (
      <div className="space-y-5">
        <SectionTitle><Settings className="w-4 h-4 text-primary-500" /> Settings & Profile Setup</SectionTitle>

        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          Visit <strong>Settings</strong> (bottom of the left sidebar) before logging your first transaction. Configuring your currency and timezone ensures all dashboard totals are accurate.
        </p>

        <SubTitle>📋 Step-by-Step: Update Your Profile</SubTitle>
        <div className="space-y-3">
          <Step n={1}>Click <strong>Settings</strong> in the sidebar (gear icon ⚙️).</Step>
          <Step n={2}>You land on the <strong>Info</strong> tab. Fill in your <em>First Name</em>, <em>Last Name</em>, and optionally <em>Phone</em> and <em>Country</em>.</Step>
          <Step n={3}>Set your <strong>Default Currency</strong> — e.g. <code>USD</code>, <code>NGN</code>, <code>GBP</code>. This controls how all balances are shown on the dashboard.</Step>
          <Step n={4}>Set your <strong>Timezone</strong> — e.g. <code>America/New_York</code>. This aligns nightly jobs and calendar dates to your local clock.</Step>
          <Step n={5}>Optionally upload a <strong>Profile Photo</strong> by clicking the avatar area.</Step>
          <Step n={6}>Click <strong>"Save Changes"</strong> — a green toast will confirm the update.</Step>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden mt-4">
          <div className="bg-slate-50 dark:bg-slate-800/40 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Example form values</div>
          <div className="px-4 py-2 divide-y divide-slate-100 dark:divide-slate-800/60">
            <FieldRow label="First Name" placeholder="Charles" />
            <FieldRow label="Last Name" placeholder="Sumo" />
            <FieldRow label="Phone" placeholder="+1 555 234 5678" tip="Optional — used for future SMS alert features." />
            <FieldRow label="Default Currency" placeholder="USD" tip="All multi-currency amounts convert to this on the dashboard." />
            <FieldRow label="Timezone" placeholder="America/New_York" />
          </div>
        </div>

        <SubTitle>🔒 Changing Your Password</SubTitle>
        <div className="space-y-3">
          <Step n={1}>Switch to the <strong>Security</strong> tab.</Step>
          <Step n={2}>Enter your <em>Current Password</em>.</Step>
          <Step n={3}>Enter a <em>New Password</em> — it must be at least 8 characters and include at least one uppercase letter, one number, and one special character (e.g. <code>MyPass#24</code>).</Step>
          <Step n={4}>Re-enter the same password in <em>Confirm Password</em>.</Step>
          <Step n={5}>Click <strong>"Update Password"</strong>.</Step>
        </div>

        <SubTitle>🔔 Enabling Push Notifications</SubTitle>
        <div className="space-y-3">
          <Step n={1}>Switch to the <strong>Preferences</strong> tab.</Step>
          <Step n={2}>Click <strong>"Enable Push Notifications"</strong>. Your browser will prompt you to allow notifications — click <em>Allow</em>.</Step>
          <Step n={3}>Use the <strong>"Send Test Notification"</strong> button to verify your device received it.</Step>
        </div>

        <Callout type="tip">Export a full backup of your data at any time under the <strong>Data</strong> tab. Keep the JSON file safe — you can restore it later if you ever need to recover your history.</Callout>
      </div>
    ),
  },
  {
    id: 'accounts',
    title: 'Accounts',
    icon: <Wallet className="w-4 h-4" />,
    category: 'Get Started',
    description: 'Create bank accounts, mobile wallets, credit cards, and cash accounts.',
    content: (
      <div className="space-y-5">
        <SectionTitle><Wallet className="w-4 h-4 text-primary-500" /> Managing Accounts</SectionTitle>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          Accounts are the wallets where your money lives. You must create at least one account before you can log transactions or pay bills.
        </p>

        <SubTitle>📋 Step-by-Step: Add a New Account</SubTitle>
        <div className="space-y-3">
          <Step n={1}>Navigate to the <strong>Accounts</strong> page from the sidebar.</Step>
          <Step n={2}>Click the <strong>"+ Add Account"</strong> button (top right).</Step>
          <Step n={3}>A modal form appears. Fill in each field as described below.</Step>
          <Step n={4}>Click <strong>"Add Account"</strong> to save.</Step>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden mt-4">
          <div className="bg-slate-50 dark:bg-slate-800/40 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Form fields & examples</div>
          <div className="px-4 py-2 divide-y divide-slate-100 dark:divide-slate-800/60">
            <FieldRow label="Account Name" placeholder="Chase Checking" tip="A descriptive label you'll recognise easily when selecting accounts." />
            <FieldRow label="Account Type" placeholder="Checking" tip="Click one of the 6 type tiles: Cash, Checking, Savings, Mobile Money, Credit Card, or Investment." />
            <FieldRow label="Opening Balance" placeholder="2500.00" tip="Enter the current real balance. You can enter a negative number for an overdraft or debt account." />
            <FieldRow label="Currency" placeholder="USD" tip="The native currency of this account. Transactions will be recorded in this currency." />
            <FieldRow label="Color" placeholder="(click a colour dot)" tip="Purely visual — helps you tell accounts apart at a glance." />
            <FieldRow label="Notes" placeholder="Primary salary account" tip="Optional personal reminder about this account." />
            <FieldRow label="Set as Default" placeholder="☑ checked" tip="When checked, this account will be pre-selected every time you add a transaction." />
          </div>
        </div>

        <Callout type="tip">If you have accounts in different currencies (e.g. a USD checking and an NGN mobile wallet), add each one separately with the correct currency. The dashboard will convert everything to your default currency automatically.</Callout>
        <Callout type="warn">Deleting an account will hide it and all of its transaction history. Use <strong>Edit</strong> instead if you only want to correct a detail.</Callout>
      </div>
    ),
  },
  {
    id: 'categories',
    title: 'Categories',
    icon: <Tags className="w-4 h-4" />,
    category: 'Get Started',
    description: 'Create personal income/expense categories with custom colours and icons.',
    content: (
      <div className="space-y-5">
        <SectionTitle><Tags className="w-4 h-4 text-primary-500" /> Customising Categories</SectionTitle>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          Categories classify each transaction (e.g. <em>Groceries</em>, <em>Salary</em>, <em>Rent</em>). They also power budget tracking and reports.
        </p>

        <SubTitle>📋 Step-by-Step: Create a Category</SubTitle>
        <div className="space-y-3">
          <Step n={1}>Go to <strong>Categories</strong> in the sidebar.</Step>
          <Step n={2}>Choose the <strong>Expense</strong> or <strong>Income</strong> tab at the top depending on what this category will be used for.</Step>
          <Step n={3}>Click <strong>"+ Add Category"</strong>.</Step>
          <Step n={4}>Fill in the form fields shown below.</Step>
          <Step n={5}>Click <strong>"Create"</strong> to save.</Step>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden mt-4">
          <div className="bg-slate-50 dark:bg-slate-800/40 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Form fields & examples</div>
          <div className="px-4 py-2 divide-y divide-slate-100 dark:divide-slate-800/60">
            <FieldRow label="Name" placeholder="Groceries" tip="Use a short, clear label you'll recognise instantly when logging transactions." />
            <FieldRow label="Type" placeholder="EXPENSE" tip="Already set based on which tab you're on — double-check before saving." />
            <FieldRow label="Icon" placeholder="ShoppingCart" tip="Click any icon from the picker grid to assign it. E.g. ShoppingCart for Groceries." />
            <FieldRow label="Color" placeholder="#10b981" tip="Click a colour swatch. This colour will appear in charts and category lists." />
          </div>
        </div>

        <Callout type="note">System categories (marked with a shield icon 🛡️) are created by administrators and shared across all users. You cannot edit or delete them, but you can use them freely in transactions and budgets.</Callout>
        <Callout type="tip">Create categories that match how you naturally think about spending. For example: <em>Food &amp; Dining</em>, <em>Transport</em>, <em>Utilities</em>, <em>Entertainment</em>.</Callout>
      </div>
    ),
  },
  {
    id: 'budgets',
    title: 'Budgets',
    icon: <PieChart className="w-4 h-4" />,
    category: 'Planning',
    description: 'Create monthly/quarterly budgets per category with spending limit forecasts.',
    content: (
      <div className="space-y-5">
        <SectionTitle><PieChart className="w-4 h-4 text-primary-500" /> Setting Up Budgets</SectionTitle>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          Budgets set a maximum spending limit per category for a defined period. The system automatically forecasts whether you'll overspend before the period ends.
        </p>

        <Callout type="note">You need at least one <strong>Expense category</strong> set up before you can create a budget. Go to Categories first if you haven't already.</Callout>

        <SubTitle>📋 Step-by-Step: Create a Budget</SubTitle>
        <div className="space-y-3">
          <Step n={1}>Navigate to <strong>Budgets</strong> in the sidebar.</Step>
          <Step n={2}>Click <strong>"+ Create Budget"</strong> (top right).</Step>
          <Step n={3}>Enter a <em>Budget Name</em> — e.g. <code>June 2026 Household Budget</code>.</Step>
          <Step n={4}>Click the <em>Period</em> tile that matches your cycle: <code>Monthly</code>, <code>Quarterly</code>, or <code>Annual</code>.</Step>
          <Step n={5}>Set the <em>Start Date</em> and <em>End Date</em> — these define exactly when this budget is active.</Step>
          <Step n={6}>Under <strong>Category Allocations</strong>, click <strong>"+ Add Category"</strong> to add a spending limit row.</Step>
          <Step n={7}>For each row: select the <em>Category</em>, enter the <em>Amount</em> limit, and pick the <em>Currency</em>.</Step>
          <Step n={8}>Repeat Step 6–7 for every category you want to budget.</Step>
          <Step n={9}>Click <strong>"Create Budget"</strong> to save.</Step>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden mt-4">
          <div className="bg-slate-50 dark:bg-slate-800/40 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Example: "June 2026 Budget"</div>
          <div className="px-4 py-2 divide-y divide-slate-100 dark:divide-slate-800/60">
            <FieldRow label="Budget Name" placeholder="June 2026 Budget" />
            <FieldRow label="Period" placeholder="Monthly" />
            <FieldRow label="Start Date" placeholder="2026-06-01" />
            <FieldRow label="End Date" placeholder="2026-06-30" />
            <FieldRow label="Category 1" placeholder="Groceries — $500 — USD" />
            <FieldRow label="Category 2" placeholder="Transport — $150 — USD" />
            <FieldRow label="Category 3" placeholder="Entertainment — $100 — USD" />
          </div>
        </div>

        <SubTitle>📊 Reading Budget Cards</SubTitle>
        <div className="space-y-3 text-sm text-slate-500 dark:text-slate-400">
          <p>After saving, each budget appears as a card showing:</p>
          <ul className="space-y-1.5 pl-4 list-disc text-xs leading-relaxed">
            <li><strong>Solid progress bar</strong> — actual money spent so far.</li>
            <li><strong>Ghost bar extension</strong> — projected spending if your current pace continues.</li>
            <li><strong>Status badge</strong>: <Badge variant="success">Active</Badge> → on track, <Badge variant="warning">Warning</Badge> → past 80%, <Badge variant="danger">Over Budget</Badge> → exceeded limit.</li>
            <li>A <strong>⚠️ projection alert</strong> appears if you're on track to exceed limits even if you haven't yet.</li>
          </ul>
        </div>

        <Callout type="tip">Budgets automatically expire and turn <Badge variant="default">Inactive</Badge> when their end date passes. Create a new budget for the next period — your old budget stays as a historical record.</Callout>
      </div>
    ),
  },
  {
    id: 'transactions',
    title: 'Transactions',
    icon: <ArrowLeftRight className="w-4 h-4" />,
    category: 'Core Ledger',
    description: 'Log income, expenses, and account transfers with categories, tags, and recurring rules.',
    content: (
      <div className="space-y-5">
        <SectionTitle><ArrowLeftRight className="w-4 h-4 text-primary-500" /> Logging Transactions</SectionTitle>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          Transactions are the heartbeat of Smart Planner. Every purchase, paycheck, or account transfer is recorded here. This is also what drives your budget tracking, reports, and dashboard totals.
        </p>

        <Callout type="note">You must have at least one <strong>Account</strong> created before you can add transactions.</Callout>

        <SubTitle>📋 Step-by-Step: Add an Expense</SubTitle>
        <div className="space-y-3">
          <Step n={1}>Go to <strong>Transactions</strong> in the sidebar.</Step>
          <Step n={2}>Click <strong>"+ Add Transaction"</strong>.</Step>
          <Step n={3}>Select the <em>Type</em>: click <strong>↓ Expense</strong> (highlighted in red).</Step>
          <Step n={4}>Type a <em>Description</em>, e.g. <code>Coffee at Starbucks</code>.</Step>
          <Step n={5}>Enter the <em>Amount</em>, e.g. <code>6.50</code>.</Step>
          <Step n={6}>Set the <em>Date</em> — defaults to today.</Step>
          <Step n={7}>Choose your <em>Account</em> from the dropdown (e.g. <code>Chase Checking</code>).</Step>
          <Step n={8}>Pick a <em>Category</em> from the dropdown (e.g. <code>Food &amp; Dining</code>).</Step>
          <Step n={9}>Optionally add <em>Notes</em> and <em>Tags</em> (comma-separated, e.g. <code>lunch, work</code>).</Step>
          <Step n={10}>Click <strong>"Add Transaction"</strong>. The account balance updates instantly.</Step>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden mt-4">
          <div className="bg-slate-50 dark:bg-slate-800/40 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Expense example</div>
          <div className="px-4 py-2 divide-y divide-slate-100 dark:divide-slate-800/60">
            <FieldRow label="Type" placeholder="↓ Expense" />
            <FieldRow label="Description" placeholder="Coffee at Starbucks" />
            <FieldRow label="Amount" placeholder="6.50" />
            <FieldRow label="Date" placeholder="2026-06-24" />
            <FieldRow label="Account" placeholder="Chase Checking" />
            <FieldRow label="Category" placeholder="Food & Dining" />
            <FieldRow label="Tags" placeholder="coffee, morning, work" tip="Separate multiple tags with commas." />
          </div>
        </div>

        <SubTitle>📋 Example: Log a Salary (Income)</SubTitle>
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="bg-slate-50 dark:bg-slate-800/40 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Income example</div>
          <div className="px-4 py-2 divide-y divide-slate-100 dark:divide-slate-800/60">
            <FieldRow label="Type" placeholder="↑ Income" />
            <FieldRow label="Description" placeholder="Monthly Salary - Acme Corp" />
            <FieldRow label="Amount" placeholder="4500.00" />
            <FieldRow label="Date" placeholder="2026-06-01" />
            <FieldRow label="Account" placeholder="Chase Checking" />
            <FieldRow label="Category" placeholder="Salary" />
            <FieldRow label="Recurring" placeholder="☑ checked → Monthly" tip="Check 'Recurring transaction' and select Monthly — the system will auto-generate this entry every month." />
          </div>
        </div>

        <SubTitle>📋 Example: Transfer Between Accounts</SubTitle>
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="bg-slate-50 dark:bg-slate-800/40 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Transfer example</div>
          <div className="px-4 py-2 divide-y divide-slate-100 dark:divide-slate-800/60">
            <FieldRow label="Type" placeholder="↔ Transfer" />
            <FieldRow label="Description" placeholder="Moving savings to emergency fund" />
            <FieldRow label="Amount" placeholder="500.00" />
            <FieldRow label="Account (from)" placeholder="Chase Checking" />
            <FieldRow label="Date" placeholder="2026-06-24" />
          </div>
        </div>

        <Callout type="tip">Use the <strong>Duplicate</strong> button (copy icon) on any existing transaction row to instantly pre-fill a new form with the same details — great for recurring similar purchases.</Callout>
      </div>
    ),
  },
  {
    id: 'bills',
    title: 'Bills',
    icon: <CalendarDays className="w-4 h-4" />,
    category: 'Core Ledger',
    description: 'Schedule recurring bills, get due-date reminders, and mark them as paid.',
    content: (
      <div className="space-y-5">
        <SectionTitle><CalendarDays className="w-4 h-4 text-primary-500" /> Setting Up Bills</SectionTitle>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          Bills track fixed recurring payments (rent, subscriptions, utilities). The system sends you push reminders before the due date and automatically logs an expense transaction when you mark a bill as paid.
        </p>

        <SubTitle>📋 Step-by-Step: Add a Bill</SubTitle>
        <div className="space-y-3">
          <Step n={1}>Go to <strong>Bills</strong> in the sidebar.</Step>
          <Step n={2}>Click <strong>"+ Add Bill"</strong> (or the dashed "Add Another Bill" tile).</Step>
          <Step n={3}>Fill in the form as shown below.</Step>
          <Step n={4}>Click <strong>"Create Bill"</strong>.</Step>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden mt-4">
          <div className="bg-slate-50 dark:bg-slate-800/40 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Form fields & examples — Rent</div>
          <div className="px-4 py-2 divide-y divide-slate-100 dark:divide-slate-800/60">
            <FieldRow label="Bill Name" placeholder="Monthly Rent" tip="A clear label shown on the card and in transaction logs." />
            <FieldRow label="Bill Amount" placeholder="1200.00" tip="The recurring cost each cycle." />
            <FieldRow label="Currency" placeholder="USD" tip="The currency this bill is charged in." />
            <FieldRow label="Due Day of Month" placeholder="1" tip="The calendar day (1–31) when payment is due each month." />
            <FieldRow label="Billing Frequency" placeholder="Monthly" tip="Options: Monthly, Weekly, Quarterly, Yearly." />
            <FieldRow label="Reminder Alerts" placeholder="3" tip="How many days before the due date you'd like a push notification reminder." />
            <FieldRow label="Category" placeholder="Housing" tip="Links this bill to a budget category so payments are tracked in your budget." />
            <FieldRow label="Notes" placeholder="Autopay enabled" tip="Optional personal note." />
          </div>
        </div>

        <SubTitle>💳 Step-by-Step: Pay a Bill</SubTitle>
        <div className="space-y-3">
          <Step n={1}>On the Bills page, find the bill you want to pay.</Step>
          <Step n={2}>Click the <strong>"Mark Paid"</strong> button on the bill card.</Step>
          <Step n={3}>A confirmation modal appears showing the bill name and amount.</Step>
          <Step n={4}>Select the <em>Account</em> to deduct the payment from (e.g. <code>Chase Checking ($2,800.00)</code>).</Step>
          <Step n={5}>Click <strong>"Confirm Payment"</strong>.</Step>
        </div>

        <Callout type="note">When you confirm payment: (1) an Expense transaction is auto-created in your ledger, (2) the account balance is deducted, and (3) if the bill is recurring, the next due date automatically advances to the next cycle.</Callout>
        <Callout type="tip">Enable push notifications by clicking <strong>"Enable Alerts"</strong> on the amber banner at the top of the Bills page. You'll get browser reminders before bills are due.</Callout>
      </div>
    ),
  },
  {
    id: 'goals',
    title: 'Savings Goals',
    icon: <Target className="w-4 h-4" />,
    category: 'Planning',
    description: 'Set savings targets, track contributions, and link goals to categories.',
    content: (
      <div className="space-y-5">
        <SectionTitle><Target className="w-4 h-4 text-primary-500" /> Savings Goals</SectionTitle>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          Create financial milestones — an emergency fund, vacation, gadget, or down payment — and track your progress with contributions over time.
        </p>

        <SubTitle>📋 Step-by-Step: Create a Goal</SubTitle>
        <div className="space-y-3">
          <Step n={1}>Go to <strong>Savings Goals</strong> in the sidebar.</Step>
          <Step n={2}>Click <strong>"+ Create Goal"</strong>.</Step>
          <Step n={3}>Fill in all required fields in the form.</Step>
          <Step n={4}>Click <strong>"Create Goal"</strong> to save.</Step>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden mt-4">
          <div className="bg-slate-50 dark:bg-slate-800/40 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Form fields & examples — Emergency Fund</div>
          <div className="px-4 py-2 divide-y divide-slate-100 dark:divide-slate-800/60">
            <FieldRow label="Goal Name" placeholder="Emergency Fund" />
            <FieldRow label="Target Amount" placeholder="10000.00" tip="The total amount you're aiming to save." />
            <FieldRow label="Current Amount" placeholder="2500.00" tip="How much you've already saved toward this goal." />
            <FieldRow label="Deadline" placeholder="2026-12-31" tip="Target completion date. Shows a countdown on the card." />
            <FieldRow label="Priority" placeholder="HIGH" tip="Options: LOW, MEDIUM, HIGH. Affects sort order on the page." />
            <FieldRow label="Monthly Contribution" placeholder="500.00" tip="Optional planned monthly amount — used to project completion date." />
            <FieldRow label="Category Link" placeholder="Savings" tip="When transactions with this category are logged, a contribution is auto-recorded." />
            <FieldRow label="Color" placeholder="#6366f1 (purple)" tip="Visual colour for the goal card." />
          </div>
        </div>

        <SubTitle>💰 Step-by-Step: Add a Contribution</SubTitle>
        <div className="space-y-3">
          <Step n={1}>On the Goals page, click the <strong>"+ Contribute"</strong> button on any goal card.</Step>
          <Step n={2}>Enter the <em>Amount</em> you're adding, e.g. <code>200.00</code>.</Step>
          <Step n={3}>Select the <em>Source Account</em> the money is coming from.</Step>
          <Step n={4}>Optionally add a <em>Note</em>, e.g. <code>Bonus from work</code>.</Step>
          <Step n={5}>Click <strong>"Add Contribution"</strong>. The progress ring on the card updates immediately.</Step>
        </div>

        <Callout type="tip">Link your goal to a <strong>Category</strong> so contributions are auto-logged whenever you pay a bill or record a transaction in that category — no manual tracking needed.</Callout>
      </div>
    ),
  },
  {
    id: 'debts',
    title: 'Debts',
    icon: <TrendingDown className="w-4 h-4" />,
    category: 'Planning',
    description: 'Track money borrowed or lent with interest rates and payoff targets.',
    content: (
      <div className="space-y-5">
        <SectionTitle><TrendingDown className="w-4 h-4 text-primary-500" /> Debts & Liabilities</SectionTitle>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          Track loans, credit lines, or personal IOUs — both money you owe and money others owe you.
        </p>

        <SubTitle>📋 Step-by-Step: Add a Debt</SubTitle>
        <div className="space-y-3">
          <Step n={1}>Go to <strong>Debts</strong> in the sidebar.</Step>
          <Step n={2}>Click <strong>"+ Add Debt"</strong>.</Step>
          <Step n={3}>Fill in all form fields (see below).</Step>
          <Step n={4}>Click <strong>"Save"</strong>.</Step>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden mt-4">
          <div className="bg-slate-50 dark:bg-slate-800/40 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Example: Personal Loan</div>
          <div className="px-4 py-2 divide-y divide-slate-100 dark:divide-slate-800/60">
            <FieldRow label="Name / Label" placeholder="Student Loan — Sallie Mae" tip="The lender's name or a short description of the debt." />
            <FieldRow label="Type" placeholder="Borrowed" tip="'Borrowed' = you owe someone. 'Lent' = someone owes you." />
            <FieldRow label="Total Amount" placeholder="15000.00" tip="The original principal (starting amount)." />
            <FieldRow label="Interest Rate" placeholder="5.5" tip="Annual interest rate in %. Leave blank if none." />
            <FieldRow label="Due Date" placeholder="2029-08-01" tip="The target payoff date." />
            <FieldRow label="Notes" placeholder="Federal subsidised loan" />
          </div>
        </div>

        <Callout type="note">Record debt payments directly on the debt card using the payment button. Each payment reduces the outstanding balance shown on the card.</Callout>
      </div>
    ),
  },
  {
    id: 'reports',
    title: 'Reports & Calendar',
    icon: <BarChart3 className="w-4 h-4" />,
    category: 'Analytics',
    description: 'View income vs expense charts, category breakdowns, and monthly financial summaries.',
    content: (
      <div className="space-y-5">
        <SectionTitle><BarChart3 className="w-4 h-4 text-primary-500" /> Reports & Calendar</SectionTitle>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          No forms to fill here — these pages automatically pull data from your transactions and bills to give you visual insights.
        </p>

        <SubTitle>📊 What You'll See on Reports</SubTitle>
        <div className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
          <ul className="space-y-2 pl-4 list-disc text-xs leading-relaxed">
            <li><strong>Income vs. Expense bar chart</strong> — side-by-side monthly comparison to see if you're in surplus or deficit.</li>
            <li><strong>Category breakdown pie chart</strong> — shows what percentage of spending went to each category.</li>
            <li><strong>Monthly summary email</strong> — on the 1st of every month, the system emails you a digest of last month's net cash flow, top spending category, and total saved.</li>
          </ul>
        </div>

        <SubTitle>📅 What You'll See on Calendar</SubTitle>
        <div className="space-y-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          <p>The calendar shows a monthly grid with coloured dots and events:</p>
          <ul className="space-y-1.5 pl-4 list-disc">
            <li><strong className="text-emerald-500">Green dots</strong> — income transactions on that day.</li>
            <li><strong className="text-rose-500">Red dots</strong> — expense transactions on that day.</li>
            <li><strong className="text-amber-500">Calendar entries</strong> — upcoming bill due dates.</li>
          </ul>
          <p className="mt-2">Click any event to see its full details.</p>
        </div>

        <SubTitle>💱 Exchange Rates</SubTitle>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          Visit <strong>Exchange Rates</strong> in the sidebar to see live conversion rates relative to your default currency. Rates refresh automatically every hour in the background. All multi-currency conversions across the entire app use these rates.
        </p>
      </div>
    ),
  },
  {
    id: 'admin',
    title: 'Admin Panel',
    icon: <Shield className="w-4 h-4" />,
    category: 'Configuration',
    description: 'Manage users, system categories, and platform statistics (Admin only).',
    content: (
      <div className="space-y-5">
        <SectionTitle><Shield className="w-4 h-4 text-primary-500" /> Admin Panel</SectionTitle>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          Only visible to accounts with the <strong>ADMIN</strong> role. Provides system-level controls for managing the platform.
        </p>

        <SubTitle>⚙️ Admin Capabilities</SubTitle>
        <div className="space-y-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          <ul className="space-y-2 pl-4 list-disc">
            <li><strong>User Manager</strong> — view all registered users, see their last login dates, block accounts, or promote a user to Admin role.</li>
            <li><strong>System Categories</strong> — create, edit, or delete global categories that appear for all users by default. Changes take effect immediately for every account on the platform.</li>
            <li><strong>Platform Statistics</strong> — view total user count, total transaction volume, and database health indicators.</li>
          </ul>
        </div>

        <Callout type="warn">Changes made in the Admin Panel affect all users. Be careful when editing or deleting system categories — this could break existing transactions or budgets that reference them.</Callout>
      </div>
    ),
  },
];

/* ─────────────── Page component ─────────────── */

export default function DocsPage() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedId, setSelectedId] = React.useState('settings');

  const filtered = SECTIONS.filter(
    (s) =>
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const active = SECTIONS.find((s) => s.id === selectedId) || SECTIONS[0];

  // Group nav items by category
  const groups = filtered.reduce<Record<string, typeof SECTIONS>>((acc, s) => {
    (acc[s.category] = acc[s.category] || []).push(s);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <PageHeader
        title="Documentation & Guides"
        subtitle="Step-by-step instructions for every feature — from creating accounts to paying bills."
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* ── Left nav ── */}
        <div className="lg:col-span-1 space-y-3 lg:sticky lg:top-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search guides…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40 transition-all"
            />
          </div>

          {/* Grouped nav */}
          <div className="space-y-4">
            {Object.entries(groups).map(([group, items]) => (
              <div key={group}>
                <p className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 px-1 mb-1.5">{group}</p>
                <div className="space-y-0.5">
                  {items.map((s) => {
                    const isActive = selectedId === s.id;
                    return (
                      <button
                        key={s.id}
                        onClick={() => setSelectedId(s.id)}
                        className={cn(
                          'w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-left select-none border',
                          isActive
                            ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400 border-primary-500/20'
                            : 'border-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900/50 hover:text-slate-800 dark:hover:text-slate-200'
                        )}
                      >
                        <span className="flex items-center gap-2 min-w-0">
                          <span className={cn('flex-shrink-0', isActive ? 'text-primary-500' : 'text-slate-400')}>{s.icon}</span>
                          <span className="truncate">{s.title}</span>
                        </span>
                        <ChevronRight className={cn('w-3 h-3 flex-shrink-0 transition-transform', isActive ? 'text-primary-400' : 'text-slate-300 dark:text-slate-600')} />
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {filtered.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-6">No results for "{searchQuery}"</p>
            )}
          </div>

          {/* Completion badge */}
          <Card className="p-4 border-slate-200/60 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-900/10 hidden lg:block">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Quick Setup Checklist</span>
            </div>
            <ul className="space-y-1.5 text-[11px] text-slate-500 dark:text-slate-400">
              {['Set default currency in Settings','Add at least one Account','Create your Categories','Set up a Budget','Log your first Transaction'].map((item, i) => (
                <li key={i} className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded border border-slate-300 dark:border-slate-600 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* ── Main content ── */}
        <div className="lg:col-span-3">
          <Card className="p-6 md:p-8 border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/50 backdrop-blur-md relative overflow-hidden">
            {/* Ambient bg */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />

            {/* Header */}
            <div className="flex flex-wrap items-start gap-3 pb-5 mb-6 border-b border-slate-100 dark:border-slate-800">
              <div className="w-10 h-10 rounded-2xl bg-primary-500/10 flex items-center justify-center text-primary-500 flex-shrink-0">
                {active.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <Badge variant="default" className="text-[9px] uppercase tracking-wider px-1.5 py-0">{active.category}</Badge>
                </div>
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">{active.title}</h2>
                <p className="text-xs text-slate-400 mt-0.5">{active.description}</p>
              </div>
            </div>

            {/* Body */}
            <div className="min-h-[50vh]">
              {active.content}
            </div>

            {/* Footer nav */}
            <div className="mt-8 pt-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              {(() => {
                const idx = SECTIONS.findIndex((s) => s.id === selectedId);
                const prev = SECTIONS[idx - 1];
                const next = SECTIONS[idx + 1];
                return (
                  <>
                    {prev ? (
                      <button onClick={() => setSelectedId(prev.id)} className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                        <ChevronRight className="w-3.5 h-3.5 rotate-180" /> {prev.title}
                      </button>
                    ) : <div />}
                    {next ? (
                      <button onClick={() => setSelectedId(next.id)} className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                        {next.title} <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    ) : <div />}
                  </>
                );
              })()}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
