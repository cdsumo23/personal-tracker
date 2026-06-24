# Smart Planner User Documentation & Guide

Welcome to the **Smart Planner** user manual. This document will guide you step-by-step through setting up your workspace, managing accounts, budgeting with predictions, logging transactions, and keeping track of your bills and savings.

---

## Table of Contents
1. [Settings & Profile Setup](#1-settings--profile-setup)
2. [Managing Accounts](#2-managing-accounts)
3. [Customizing Categories](#3-customizing-categories)
4. [Predictive Budgets](#4-predictive-budgets)
5. [The Transactions Ledger](#5-the-transactions-ledger)
6. [Savings Goals Tracker](#6-savings-goals-tracker)
7. [Debts & Liabilities](#7-debts--liabilities)
8. [Bills & Push Notifications](#8-bills--push-notifications)
9. [Financial Calendar](#9-financial-calendar)
10. [Reports & Financial Analytics](#10-reports--financial-analytics)
11. [Exchange Rates & Multi-Currency](#11-exchange-rates--multi-currency)
12. [Admin Panel (For Administrators)](#12-admin-panel-for-administrators)

---

## 1. Settings & Profile Setup

Before you log your first transaction, you should customize your settings to configure how Smart Planner handles your currency and notifications.

### Accessing Settings
* Click **Settings** in the bottom-left sidebar navigation (labeled with a gear icon ⚙️).

### Profile Information (Info Tab)
* **Default Currency:** Select the main currency for your dashboard views (e.g., `USD`, `EUR`, `GBP`, `NGN`, etc.). All multi-currency accounts and transactions will be converted to this base currency when displaying total net worth or dashboard sums.
* **Timezone:** Select your local timezone to ensure transactions and scheduled cron tasks align with your local calendar days.
* **Profile Photo:** Upload a custom profile picture.

### Preferences & Notifications (Preferences Tab)
* **Web Push Notifications:** Enable or disable push notifications. Smart Planner will request permission in your browser to send push alerts (e.g., for upcoming bill due dates or budget utilization warnings).
* **Test Notification:** Click the **Test Notification** button to verify that web push works on your current device.

### Data Portability (Data Tab)
* **Export Backup:** Download a full JSON file containing all your user data (accounts, transactions, budgets, bills, savings goals).
* **Restore Backup:** Upload a previously exported backup file to restore your entire financial ledger.

### Password Management (Security Tab)
* Update your password by entering your current password followed by a new password meeting the security criteria (at least 8 characters, an uppercase letter, lowercase letter, number, and special character).

---

## 2. Managing Accounts

Accounts represent the physical or digital containers where your money resides (e.g., cash in hand, bank checking account, high-yield savings, mobile wallet).

### Adding a New Account
1. Navigate to the **Accounts** page.
2. Click the **+ Add Account** button.
3. Fill in the following fields:
   * **Account Name:** Give your account a descriptive name (e.g., "Chase Checking", "Emergency Fund Cash").
   * **Account Type:** Select from:
     * `Cash` (paper/coin cash)
     * `Checking` (bank debit accounts)
     * `Savings` (interest-bearing savings)
     * `Mobile Money` (mobile money services like Venmo, M-Pesa, etc.)
     * `Credit Card` (liability accounts with balances representing money owed)
     * `Investment` (brokerage or trading accounts)
   * **Initial Balance:** Enter the starting balance.
   * **Currency:** Choose the primary currency of this account.
   * **Color & Icon:** Assign a color and icon to visually distinguish the account.
   * **Set as Default:** Toggle this on to automatically pre-select this account when adding new transactions.
   * **Notes:** Optional comments.

### Account Cards & Balances
* Each account displays its current balance in its native currency.
* Toggle the three-dot menu on any account card to **Edit** its fields or **Delete** it (deleting an account will also delete its transaction history).

---

## 3. Customizing Categories

Categories help organize your income and expenses into distinct buckets (e.g., "Housing", "Groceries", "Salary"). This classification is critical for generating accurate reports and tracking budgets.

### Custom vs. System Categories
* **System Categories:** Smart Planner includes built-in categories created by the administrator. These are shared system-wide and are labeled with a shield icon. They cannot be edited or deleted by normal users.
* **Custom Categories:** Personal categories you create yourself to fit your specific lifestyle. You have full edit/delete rights over custom categories.

### Adding a Category
1. Navigate to the **Categories** page.
2. Select either the **Expense** or **Income** tab at the top.
3. Click the **+ Add Category** button.
4. Input the name, select a representative icon from the picker, and choose a color.
5. Click **Create**.

---

## 4. Predictive Budgets

Budgets help you set spending limits for specific categories over a set period. Smart Planner implements a predictive forecasting engine to warn you of future overspending before it occurs.

### Setting Up a Budget
1. Go to the **Budgets** page and click **+ Create Budget**.
2. Configure your parameters:
   * **Budget Name:** (e.g., "June 2026 Budget").
   * **Period:** `Monthly`, `Quarterly`, or `Annual`.
   * **Date Range:** The start and end dates.
   * **Category Allocations:** Add one or more categories and set an allocated spending limit for each (e.g., "$500 for Food", "$150 for Entertainment"). You can mix currencies per category; they will automatically sum in your base currency.

### Reading the Budget Cards
Each budget uses a dual progress bar to show actual vs. projected spending:
* **Solid Progress Bar:** Shows the percentage of the budget actually spent so far.
* **Semi-Transparent (Ghost) Progress Bar:** Projects your spending for the remainder of the period based on your current spending velocity.
* **Status Badges:**
  * `Active`: Spending is normal.
  * `Warning`: Actual spending has crossed 80% of the allocation.
  * `Over Budget`: Spent amount has exceeded 100% of the allocation.
  * `Over Projection`: An alert (⚠️) is displayed if your current velocity projects that you will exceed the limit before the period ends.
  * `Inactive`: The budget has expired.

### Auto-Expiry
* Active budgets whose end dates pass are automatically set to `Inactive` by the system, ensuring they do not clutter current dashboards or interfere with active spending tracking.

---

## 5. The Transactions Ledger

The Transactions page is the central journal of all your incoming and outgoing funds.

### Creating a Transaction
1. Click the **+ Add Transaction** button.
2. Specify the following details:
   * **Type:** Choose `Expense` (money leaving), `Income` (money arriving), or `Transfer` (money moving between your own accounts).
   * **Amount:** The financial value.
   * **Account:** The account affected. (For Transfers, you will select both a **From Account** and a **To Account**).
   * **Category:** Choose a category (not applicable for Transfers).
   * **Date:** Select the transaction date.
   * **Description:** A short title (e.g., "Groceries at Safeway").
   * **Notes:** Additional description details.
   * **Tags:** Optional tags separated by commas (e.g., `vacation, summer-2026`).
   * **Recurring Toggle:** Mark the transaction as recurring to automate future repeats. Select an interval (`Daily`, `Weekly`, `Monthly`, `Yearly`).

### Transaction Actions
* **Search:** Filter your list by searching for text matches in the description, notes, or tags.
* **Filters:** Drill down your transaction list by Account, Category, Type, or Date Range.
* **Duplicate:** Quickly copy an existing transaction to save time when logging repeating expenses.
* **Edit/Delete:** Update fields or remove a transaction entirely using the actions at the end of each row.

---

## 6. Savings Goals Tracker

Savings Goals help you set aside money for future big-ticket items, emergencies, or investments.

### Creating a Goal
1. Navigate to the **Savings Goals** page.
2. Click **+ Create Goal** and enter:
   * **Goal Name:** (e.g., "New Laptop", "Emergency Fund").
   * **Target Amount:** The final savings objective.
   * **Target Date:** The target completion deadline.
   * **Category Link:** Optionally link the goal to a transaction category. When you log a transaction to this category (or pay a bill associated with it), the system can automatically log a savings contribution.

### Recording Contributions
* Track progress by adding contributions manually on the goal's detail view, or rely on auto-contributions linked to category spend/saving logs.

---

## 7. Debts & Liabilities

Track what you owe (or what others owe you) with amortization schedules and debt payoff dates.

### Logging a Debt
1. Go to the **Debts** page and click **+ Add Debt**.
2. Fill in:
   * **Name:** Name of the creditor or borrower.
   * **Type:** Select `Lent` (others owe you) or `Borrowed` (you owe others).
   * **Total Amount:** The initial principal balance.
   * **Interest Rate:** (Optional) Annual interest percentage.
   * **Due Date:** Target final payoff date.
3. Manage the debt by posting payments towards the principal balance directly from its details card.

---

## 8. Bills & Push Notifications

Bills are fixed, recurring payments with set due dates (e.g., Rent, Netflix subscription, Utility bills). 

### Creating a Bill
1. Go to the **Bills** page and click **+ Add Bill**.
2. Enter:
   * **Bill Name:** (e.g., "Electricity Bill").
   * **Amount & Currency:** Cost of the bill.
   * **Due Day:** The calendar day of the month it is due.
   * **Is Recurring:** If checked, the bill resets to the next month's due date when marked as paid.
   * **Reminder Days:** Configure how many days in advance you want to receive alert warnings.

### Subscribing to Push Alerts
* If you haven't enabled push notifications, an alert banner will appear at the top of the Bills page. Click **Enable Alerts** to activate Web Push Notifications so you receive reminders on your browser/phone when bills are nearing their due dates.

### Marking Bills as Paid
* Click the **Pay** button on any bill.
* Choose an account. If selected, Smart Planner will automatically write a corresponding `Expense` transaction in your transaction ledger with today's date, deducting the amount from the account balance.

---

## 9. Financial Calendar

The **Calendar** page provides a monthly calendar grid showing:
* Incoming transactions (Green items)
* Expenses (Red items)
* Upcoming bills (Colored dots on their respective due days)

Hover over or click calendar entries to see their full transaction or bill details.

---

## 10. Reports & Financial Analytics

The **Reports** page aggregates all transactional data to provide visual insights.

### Report Sections
* **Income vs. Expense Charts:** Compare total income against total expenses.
* **Category Breakdown:** View spending distribution via interactive pie charts.
* **Monthly Summaries:** Summary reports are automatically compiled on the 1st of every month summarizing your previous month's net cash flow, highest expense category, and total saved.

---

## 11. Exchange Rates & Multi-Currency

Smart Planner supports seamless multi-currency transactions. 

* The **Exchange Rates** page displays current conversion rates relative to your base currency.
* Rates are synchronized automatically every hour.
* When adding transactions or viewing budgets, the system performs real-time currency conversions using these synchronized exchange rates, ensuring unified calculations in your default currency.

---

## 12. Admin Panel (For Administrators)

Users registered with the `ADMIN` role have access to the **Admin Panel** link in the sidebar.

### Administrative Functions
* **User Management:** View all registered accounts, block users, or change user roles.
* **System Category Manager:** Create and update default system categories that are pre-populated for all users.
* **System Statistics:** View platform statistics (total active users, total ledger transactions, system-wide database size).
