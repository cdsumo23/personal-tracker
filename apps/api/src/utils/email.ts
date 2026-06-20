import nodemailer, { Transporter, SendMailOptions } from 'nodemailer';
import { config } from '@/config/env';
import logger from '@/config/logger';

// ─────────────────────────────────────────────
// Transporter Singleton
// ─────────────────────────────────────────────

let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.SMTP_HOST,
      port: config.SMTP_PORT,
      secure: config.SMTP_SECURE,
      auth: config.SMTP_USER
        ? { user: config.SMTP_USER, pass: config.SMTP_PASS }
        : undefined,
      tls: { rejectUnauthorized: config.NODE_ENV === 'production' },
    });
  }
  return transporter;
}

// ─────────────────────────────────────────────
// Internal send helper
// ─────────────────────────────────────────────

async function sendMail(options: SendMailOptions): Promise<void> {
  if (!config.SMTP_USER) {
    logger.warn('[Email] SMTP not configured — skipping email send', { to: options.to });
    return;
  }
  try {
    const info = await getTransporter().sendMail({
      from: `"${config.EMAIL_FROM_NAME}" <${config.EMAIL_FROM}>`,
      ...options,
    });
    logger.info('[Email] Message sent', { messageId: info.messageId, to: options.to });
  } catch (error) {
    logger.error('[Email] Failed to send email', { error, to: options.to });
    throw error;
  }
}

// ─────────────────────────────────────────────
// Base HTML template wrapper
// ─────────────────────────────────────────────

function htmlWrapper(title: string, body: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f9fafb; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); padding: 32px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 24px; }
    .content { padding: 32px; color: #374151; line-height: 1.6; }
    .button { display: inline-block; background: #4f46e5; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-weight: 600; margin: 16px 0; }
    .footer { background: #f3f4f6; padding: 16px 32px; text-align: center; font-size: 12px; color: #6b7280; }
    .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 4px; margin: 16px 0; }
    .stat { background: #f0fdf4; border-radius: 6px; padding: 16px; margin: 8px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>💰 Budget Planner</h1>
    </div>
    <div class="content">
      ${body}
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Budget Planner. All rights reserved.</p>
      <p>You are receiving this email because you registered at Budget Planner.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

// ─────────────────────────────────────────────
// Email Functions
// ─────────────────────────────────────────────

/**
 * Send an email verification link to a newly registered user.
 * @param to - Recipient email address
 * @param token - Email verification token
 */
export async function sendVerificationEmail(to: string, token: string): Promise<void> {
  const verifyUrl = `${config.FRONTEND_URL}/verify-email?token=${token}`;
  const html = htmlWrapper('Verify Your Email', `
    <h2>Welcome to Budget Planner! 🎉</h2>
    <p>Thanks for signing up! Please verify your email address to activate your account.</p>
    <p style="text-align:center">
      <a href="${verifyUrl}" class="button">Verify Email Address</a>
    </p>
    <div class="warning">
      <strong>⚠️ This link expires in 24 hours.</strong> If you did not create an account, please ignore this email.
    </div>
    <p>Or copy and paste this URL into your browser:</p>
    <p style="word-break:break-all; color:#6366f1; font-size:13px">${verifyUrl}</p>
  `);

  await sendMail({ to, subject: 'Verify your Budget Planner email', html });
}

/**
 * Send a password reset email with a reset link.
 * @param to - Recipient email address
 * @param token - Password reset token
 */
export async function sendPasswordResetEmail(to: string, token: string): Promise<void> {
  const resetUrl = `${config.FRONTEND_URL}/reset-password?token=${token}`;
  const html = htmlWrapper('Reset Your Password', `
    <h2>Password Reset Request 🔐</h2>
    <p>We received a request to reset your password. Click the button below to choose a new password:</p>
    <p style="text-align:center">
      <a href="${resetUrl}" class="button">Reset Password</a>
    </p>
    <div class="warning">
      <strong>⚠️ This link expires in 1 hour.</strong> If you did not request a password reset, please ignore this email — your account is safe.
    </div>
    <p>Or copy and paste this URL into your browser:</p>
    <p style="word-break:break-all; color:#6366f1; font-size:13px">${resetUrl}</p>
  `);

  await sendMail({ to, subject: 'Reset your Budget Planner password', html });
}

/**
 * Send a welcome email after successful email verification.
 * @param to - Recipient email
 * @param name - User's first name
 */
export async function sendWelcomeEmail(to: string, name: string): Promise<void> {
  const html = htmlWrapper('Welcome to Budget Planner!', `
    <h2>Hi ${name}, you're all set! 🚀</h2>
    <p>Your email has been verified and your account is now active. Here's what you can do:</p>
    <ul>
      <li>💳 Connect your bank accounts</li>
      <li>📊 Create your first budget</li>
      <li>🎯 Set savings goals</li>
      <li>📈 Track your spending patterns</li>
    </ul>
    <p style="text-align:center">
      <a href="${config.FRONTEND_URL}/dashboard" class="button">Go to Dashboard</a>
    </p>
    <p>If you have any questions, feel free to reply to this email. We're here to help!</p>
  `);

  await sendMail({ to, subject: `Welcome to Budget Planner, ${name}!`, html });
}

/**
 * Send an alert when a budget category approaches or exceeds its limit.
 * @param to - Recipient email
 * @param budgetName - Name of the budget
 * @param categoryName - Name of the category over budget
 * @param percentage - Current usage percentage (e.g. 85 = 85%)
 */
export async function sendBudgetAlertEmail(
  to: string,
  budgetName: string,
  categoryName: string,
  percentage: number
): Promise<void> {
  const isOver = percentage >= 100;
  const subject = isOver
    ? `🚨 Budget Exceeded: ${categoryName} in ${budgetName}`
    : `⚠️ Budget Alert: ${categoryName} at ${percentage}%`;

  const html = htmlWrapper('Budget Alert', `
    <h2>${isOver ? '🚨 Budget Exceeded!' : '⚠️ Budget Warning'}</h2>
    <p>Your <strong>${categoryName}</strong> category in <strong>${budgetName}</strong> has reached <strong>${percentage}%</strong> of its allocated budget.</p>
    <div class="warning">
      ${isOver
        ? `You have <strong>exceeded</strong> your budget for ${categoryName}. Consider reviewing your spending.`
        : `You are close to your budget limit. Only <strong>${100 - percentage}%</strong> remaining.`
      }
    </div>
    <p style="text-align:center">
      <a href="${config.FRONTEND_URL}/budgets" class="button">View Budget</a>
    </p>
  `);

  await sendMail({ to, subject, html });
}

/**
 * Send a bill payment reminder.
 * @param to - Recipient email
 * @param billName - Name of the bill
 * @param amount - Bill amount
 * @param dueDate - Due date of the bill
 */
export async function sendBillReminderEmail(
  to: string,
  billName: string,
  amount: number,
  dueDate: Date
): Promise<void> {
  const formattedDate = dueDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const formattedAmount = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const html = htmlWrapper('Bill Reminder', `
    <h2>📄 Bill Due Soon</h2>
    <p>This is a reminder that your bill is due soon:</p>
    <div class="stat">
      <strong>${billName}</strong><br/>
      Amount: <strong>${formattedAmount}</strong><br/>
      Due Date: <strong>${formattedDate}</strong>
    </div>
    <p style="text-align:center">
      <a href="${config.FRONTEND_URL}/bills" class="button">View Bills</a>
    </p>
  `);

  await sendMail({ to, subject: `Reminder: ${billName} is due on ${formattedDate}`, html });
}

/**
 * Send a monthly financial summary email.
 * @param to - Recipient email
 * @param name - User's first name
 * @param summary - Summary data object
 */
export async function sendMonthlySummaryEmail(
  to: string,
  name: string,
  summary: {
    month: string;
    totalIncome: number;
    totalExpenses: number;
    netSavings: number;
    topCategory: string;
    budgetAdherence: number;
    savingsGoalProgress: number;
  }
): Promise<void> {
  const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

  const html = htmlWrapper(`Monthly Summary: ${summary.month}`, `
    <h2>Hi ${name}, here's your ${summary.month} summary 📊</h2>
    <div class="stat">💰 Total Income: <strong>${fmt(summary.totalIncome)}</strong></div>
    <div class="stat">💸 Total Expenses: <strong>${fmt(summary.totalExpenses)}</strong></div>
    <div class="stat">🏦 Net Savings: <strong>${fmt(summary.netSavings)}</strong></div>
    <div class="stat">📊 Top Spending Category: <strong>${summary.topCategory}</strong></div>
    <div class="stat">✅ Budget Adherence: <strong>${summary.budgetAdherence}%</strong></div>
    <div class="stat">🎯 Savings Goal Progress: <strong>${summary.savingsGoalProgress}%</strong></div>
    <p style="text-align:center">
      <a href="${config.FRONTEND_URL}/reports" class="button">View Full Report</a>
    </p>
  `);

  await sendMail({ to, subject: `Your ${summary.month} Financial Summary`, html });
}
