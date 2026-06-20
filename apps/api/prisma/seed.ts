import { PrismaClient, Role, CategoryType, AccountType, TransactionType, BudgetPeriod, Priority, DebtType, BillFrequency } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // ─────────────────────────────────────────────
  // System Categories
  // ─────────────────────────────────────────────
  console.log('📁 Creating system categories...');

  const incomeCategories = [
    { name: 'Salary', icon: '💼', color: '#10B981' },
    { name: 'Business', icon: '🏢', color: '#3B82F6' },
    { name: 'Freelance', icon: '💻', color: '#8B5CF6' },
    { name: 'Investment', icon: '📈', color: '#F59E0B' },
    { name: 'Bonus', icon: '🎁', color: '#EC4899' },
    { name: 'Other Income', icon: '💰', color: '#6B7280' },
  ];

  const expenseCategories = [
    { name: 'Food & Dining', icon: '🍔', color: '#EF4444' },
    { name: 'Rent & Housing', icon: '🏠', color: '#F97316' },
    { name: 'Utilities', icon: '⚡', color: '#EAB308' },
    { name: 'Transportation', icon: '🚗', color: '#3B82F6' },
    { name: 'Healthcare', icon: '🏥', color: '#10B981' },
    { name: 'Education', icon: '📚', color: '#8B5CF6' },
    { name: 'Entertainment', icon: '🎬', color: '#EC4899' },
    { name: 'Shopping', icon: '🛍️', color: '#F59E0B' },
    { name: 'Insurance', icon: '🛡️', color: '#6B7280' },
    { name: 'Travel', icon: '✈️', color: '#14B8A6' },
    { name: 'Personal Care', icon: '💅', color: '#F472B6' },
    { name: 'Subscriptions', icon: '📱', color: '#6366F1' },
    { name: 'Savings', icon: '🏦', color: '#22C55E' },
    { name: 'Debt Payment', icon: '💳', color: '#DC2626' },
    { name: 'Other', icon: '📦', color: '#9CA3AF' },
  ];

  for (const cat of incomeCategories) {
    await prisma.category.upsert({
      where: { id: `system-income-${cat.name.toLowerCase().replace(/\s+/g, '-')}` },
      update: {},
      create: {
        id: `system-income-${cat.name.toLowerCase().replace(/\s+/g, '-')}`,
        name: cat.name,
        type: CategoryType.INCOME,
        icon: cat.icon,
        color: cat.color,
        isSystem: true,
      },
    });
  }

  for (const cat of expenseCategories) {
    await prisma.category.upsert({
      where: { id: `system-expense-${cat.name.toLowerCase().replace(/\s+/g, '-')}` },
      update: {},
      create: {
        id: `system-expense-${cat.name.toLowerCase().replace(/\s+/g, '-')}`,
        name: cat.name,
        type: CategoryType.EXPENSE,
        icon: cat.icon,
        color: cat.color,
        isSystem: true,
      },
    });
  }

  console.log(`✅ Created ${incomeCategories.length} income categories and ${expenseCategories.length} expense categories`);

  // ─────────────────────────────────────────────
  // Default Exchange Rates (base: USD)
  // ─────────────────────────────────────────────
  console.log('💱 Creating exchange rates...');

  const exchangeRates = [
    { baseCurrency: 'USD', targetCurrency: 'EUR', rate: 0.92 },
    { baseCurrency: 'USD', targetCurrency: 'GBP', rate: 0.79 },
    { baseCurrency: 'USD', targetCurrency: 'NGN', rate: 1550.0 },
    { baseCurrency: 'USD', targetCurrency: 'GHS', rate: 13.5 },
    { baseCurrency: 'USD', targetCurrency: 'LRD', rate: 193.0 },
    { baseCurrency: 'EUR', targetCurrency: 'USD', rate: 1.087 },
    { baseCurrency: 'EUR', targetCurrency: 'GBP', rate: 0.859 },
    { baseCurrency: 'GBP', targetCurrency: 'USD', rate: 1.265 },
    { baseCurrency: 'GBP', targetCurrency: 'EUR', rate: 1.164 },
    { baseCurrency: 'NGN', targetCurrency: 'USD', rate: 0.000645 },
    { baseCurrency: 'GHS', targetCurrency: 'USD', rate: 0.074 },
    { baseCurrency: 'LRD', targetCurrency: 'USD', rate: 0.00518 },
  ];

  for (const rate of exchangeRates) {
    await prisma.exchangeRate.upsert({
      where: { baseCurrency_targetCurrency: { baseCurrency: rate.baseCurrency, targetCurrency: rate.targetCurrency } },
      update: { rate: rate.rate },
      create: rate,
    });
  }

  console.log(`✅ Created ${exchangeRates.length} exchange rates`);

  // ─────────────────────────────────────────────
  // Admin User
  // ─────────────────────────────────────────────
  console.log('👤 Creating admin user...');

  const adminPasswordHash = await bcrypt.hash('Admin@123456', 12);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@budgetplanner.com' },
    update: {},
    create: {
      email: 'admin@budgetplanner.com',
      passwordHash: adminPasswordHash,
      firstName: 'System',
      lastName: 'Admin',
      role: Role.ADMIN,
      isVerified: true,
      isActive: true,
      currency: 'USD',
      timezone: 'UTC',
    },
  });

  console.log(`✅ Admin user created: ${adminUser.email}`);

  // ─────────────────────────────────────────────
  // Demo User
  // ─────────────────────────────────────────────
  console.log('👤 Creating demo user...');

  const demoPasswordHash = await bcrypt.hash('Demo@123456', 12);

  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@budgetplanner.com' },
    update: {},
    create: {
      email: 'demo@budgetplanner.com',
      passwordHash: demoPasswordHash,
      firstName: 'Alex',
      lastName: 'Morgan',
      role: Role.USER,
      isVerified: true,
      isActive: true,
      currency: 'USD',
      timezone: 'America/New_York',
      country: 'US',
      phone: '+1234567890',
    },
  });

  console.log(`✅ Demo user created: ${demoUser.email}`);

  // ─────────────────────────────────────────────
  // Demo Accounts
  // ─────────────────────────────────────────────
  console.log('🏦 Creating demo accounts...');

  const checkingAccount = await prisma.account.upsert({
    where: { id: 'demo-checking' },
    update: {},
    create: {
      id: 'demo-checking',
      userId: demoUser.id,
      name: 'Main Checking',
      type: AccountType.CHECKING,
      balance: 5420.5,
      currency: 'USD',
      color: '#3B82F6',
      icon: '🏦',
      isDefault: true,
    },
  });

  const savingsAccount = await prisma.account.upsert({
    where: { id: 'demo-savings' },
    update: {},
    create: {
      id: 'demo-savings',
      userId: demoUser.id,
      name: 'Emergency Fund',
      type: AccountType.SAVINGS,
      balance: 10000.0,
      currency: 'USD',
      color: '#10B981',
      icon: '💰',
      isDefault: false,
    },
  });

  const creditCard = await prisma.account.upsert({
    where: { id: 'demo-credit' },
    update: {},
    create: {
      id: 'demo-credit',
      userId: demoUser.id,
      name: 'Visa Credit Card',
      type: AccountType.CREDIT_CARD,
      balance: -1200.0,
      currency: 'USD',
      color: '#EF4444',
      icon: '💳',
      isDefault: false,
    },
  });

  console.log('✅ Demo accounts created');

  // ─────────────────────────────────────────────
  // Demo Transactions (last 3 months)
  // ─────────────────────────────────────────────
  console.log('💸 Creating demo transactions...');

  const now = new Date();
  const salaryCatId = `system-income-salary`;
  const foodCatId = `system-expense-food-&-dining`;
  const rentCatId = `system-expense-rent-&-housing`;
  const transportCatId = `system-expense-transportation`;
  const entCatId = `system-expense-entertainment`;
  const utilCatId = `system-expense-utilities`;
  const shopCatId = `system-expense-shopping`;

  const transactions = [
    // Month 1 (3 months ago)
    { accountId: checkingAccount.id, categoryId: salaryCatId, amount: 5500, type: TransactionType.INCOME, description: 'Monthly Salary', date: new Date(now.getFullYear(), now.getMonth() - 3, 1) },
    { accountId: checkingAccount.id, categoryId: rentCatId, amount: -1800, type: TransactionType.EXPENSE, description: 'Rent Payment', date: new Date(now.getFullYear(), now.getMonth() - 3, 2) },
    { accountId: checkingAccount.id, categoryId: foodCatId, amount: -320, type: TransactionType.EXPENSE, description: 'Grocery Store', date: new Date(now.getFullYear(), now.getMonth() - 3, 5) },
    { accountId: checkingAccount.id, categoryId: utilCatId, amount: -120, type: TransactionType.EXPENSE, description: 'Electric Bill', date: new Date(now.getFullYear(), now.getMonth() - 3, 8) },
    { accountId: checkingAccount.id, categoryId: transportCatId, amount: -85, type: TransactionType.EXPENSE, description: 'Gas Station', date: new Date(now.getFullYear(), now.getMonth() - 3, 10) },
    { accountId: checkingAccount.id, categoryId: entCatId, amount: -45, type: TransactionType.EXPENSE, description: 'Netflix & Spotify', date: new Date(now.getFullYear(), now.getMonth() - 3, 12) },
    { accountId: checkingAccount.id, categoryId: foodCatId, amount: -180, type: TransactionType.EXPENSE, description: 'Restaurant Dinner', date: new Date(now.getFullYear(), now.getMonth() - 3, 20) },
    // Month 2 (2 months ago)
    { accountId: checkingAccount.id, categoryId: salaryCatId, amount: 5500, type: TransactionType.INCOME, description: 'Monthly Salary', date: new Date(now.getFullYear(), now.getMonth() - 2, 1) },
    { accountId: checkingAccount.id, categoryId: rentCatId, amount: -1800, type: TransactionType.EXPENSE, description: 'Rent Payment', date: new Date(now.getFullYear(), now.getMonth() - 2, 2) },
    { accountId: checkingAccount.id, categoryId: foodCatId, amount: -295, type: TransactionType.EXPENSE, description: 'Grocery Store', date: new Date(now.getFullYear(), now.getMonth() - 2, 6) },
    { accountId: checkingAccount.id, categoryId: shopCatId, amount: -250, type: TransactionType.EXPENSE, description: 'Clothing Purchase', date: new Date(now.getFullYear(), now.getMonth() - 2, 14) },
    { accountId: checkingAccount.id, categoryId: utilCatId, amount: -110, type: TransactionType.EXPENSE, description: 'Electric Bill', date: new Date(now.getFullYear(), now.getMonth() - 2, 8) },
    { accountId: checkingAccount.id, categoryId: transportCatId, amount: -70, type: TransactionType.EXPENSE, description: 'Uber Rides', date: new Date(now.getFullYear(), now.getMonth() - 2, 18) },
    // Current Month
    { accountId: checkingAccount.id, categoryId: salaryCatId, amount: 5500, type: TransactionType.INCOME, description: 'Monthly Salary', date: new Date(now.getFullYear(), now.getMonth(), 1) },
    { accountId: checkingAccount.id, categoryId: rentCatId, amount: -1800, type: TransactionType.EXPENSE, description: 'Rent Payment', date: new Date(now.getFullYear(), now.getMonth(), 2) },
    { accountId: checkingAccount.id, categoryId: foodCatId, amount: -140, type: TransactionType.EXPENSE, description: 'Grocery Store', date: new Date(now.getFullYear(), now.getMonth(), 5) },
    { accountId: checkingAccount.id, categoryId: transportCatId, amount: -60, type: TransactionType.EXPENSE, description: 'Fuel', date: new Date(now.getFullYear(), now.getMonth(), 7) },
  ];

  for (const tx of transactions) {
    await prisma.transaction.create({
      data: {
        userId: demoUser.id,
        accountId: tx.accountId,
        categoryId: tx.categoryId,
        amount: Math.abs(tx.amount),
        type: tx.type,
        description: tx.description,
        date: tx.date,
        tags: [],
      },
    });
  }

  console.log(`✅ Created ${transactions.length} demo transactions`);

  // ─────────────────────────────────────────────
  // Demo Budget
  // ─────────────────────────────────────────────
  console.log('📊 Creating demo budget...');

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const demoBudget = await prisma.budget.create({
    data: {
      userId: demoUser.id,
      name: 'Monthly Budget',
      period: BudgetPeriod.MONTHLY,
      startDate: monthStart,
      endDate: monthEnd,
      totalAmount: 4500,
      isActive: true,
      carryover: false,
    },
  });

  const budgetCategories = [
    { categoryId: rentCatId, allocatedAmount: 1800 },
    { categoryId: foodCatId, allocatedAmount: 600 },
    { categoryId: transportCatId, allocatedAmount: 300 },
    { categoryId: utilCatId, allocatedAmount: 200 },
    { categoryId: entCatId, allocatedAmount: 150 },
    { categoryId: shopCatId, allocatedAmount: 300 },
  ];

  for (const bc of budgetCategories) {
    await prisma.budgetCategory.create({
      data: {
        budgetId: demoBudget.id,
        categoryId: bc.categoryId,
        allocatedAmount: bc.allocatedAmount,
      },
    });
  }

  console.log('✅ Demo budget created');

  // ─────────────────────────────────────────────
  // Demo Savings Goal
  // ─────────────────────────────────────────────
  console.log('🎯 Creating demo savings goal...');

  const vacationGoal = await prisma.savingsGoal.create({
    data: {
      userId: demoUser.id,
      name: 'Europe Vacation',
      targetAmount: 5000,
      currentAmount: 1200,
      deadline: new Date(now.getFullYear() + 1, 5, 1),
      priority: Priority.HIGH,
      icon: '✈️',
      color: '#3B82F6',
      isCompleted: false,
      autoContribute: true,
      contributionAmount: 300,
      contributionInterval: 'MONTHLY',
    },
  });

  await prisma.goalContribution.createMany({
    data: [
      { goalId: vacationGoal.id, amount: 400, date: new Date(now.getFullYear(), now.getMonth() - 2, 15), note: 'Initial deposit' },
      { goalId: vacationGoal.id, amount: 400, date: new Date(now.getFullYear(), now.getMonth() - 1, 15), note: 'Monthly contribution' },
      { goalId: vacationGoal.id, amount: 400, date: new Date(now.getFullYear(), now.getMonth(), 1), note: 'Monthly contribution' },
    ],
  });

  const emergencyGoal = await prisma.savingsGoal.create({
    data: {
      userId: demoUser.id,
      name: 'Emergency Fund (6 months)',
      targetAmount: 33000,
      currentAmount: 10000,
      priority: Priority.HIGH,
      icon: '🛡️',
      color: '#10B981',
      isCompleted: false,
      autoContribute: false,
    },
  });

  console.log('✅ Demo savings goals created');

  // ─────────────────────────────────────────────
  // Demo Debt
  // ─────────────────────────────────────────────
  console.log('💳 Creating demo debt...');

  const carLoan = await prisma.debt.create({
    data: {
      userId: demoUser.id,
      name: 'Car Loan',
      type: DebtType.PERSONAL_LOAN,
      originalAmount: 15000,
      currentBalance: 8500,
      interestRate: 5.9,
      minimumPayment: 280,
      lender: 'City Bank',
      strategy: 'AVALANCHE',
    },
  });

  await prisma.debtPayment.createMany({
    data: [
      { debtId: carLoan.id, amount: 280, date: new Date(now.getFullYear(), now.getMonth() - 2, 15), note: 'Monthly payment' },
      { debtId: carLoan.id, amount: 280, date: new Date(now.getFullYear(), now.getMonth() - 1, 15), note: 'Monthly payment' },
      { debtId: carLoan.id, amount: 500, date: new Date(now.getFullYear(), now.getMonth(), 10), note: 'Extra payment' },
    ],
  });

  console.log('✅ Demo debt created');

  // ─────────────────────────────────────────────
  // Demo Bills
  // ─────────────────────────────────────────────
  console.log('📄 Creating demo bills...');

  await prisma.bill.createMany({
    data: [
      {
        userId: demoUser.id,
        name: 'Rent',
        amount: 1800,
        dueDay: 1,
        category: 'Housing',
        isRecurring: true,
        frequency: BillFrequency.MONTHLY,
        nextDueDate: new Date(now.getFullYear(), now.getMonth() + 1, 1),
        reminderDays: 5,
      },
      {
        userId: demoUser.id,
        name: 'Electric Bill',
        amount: 120,
        dueDay: 10,
        category: 'Utilities',
        isRecurring: true,
        frequency: BillFrequency.MONTHLY,
        nextDueDate: new Date(now.getFullYear(), now.getMonth(), 10),
        reminderDays: 3,
      },
      {
        userId: demoUser.id,
        name: 'Netflix',
        amount: 15.99,
        dueDay: 15,
        category: 'Entertainment',
        isRecurring: true,
        frequency: BillFrequency.MONTHLY,
        nextDueDate: new Date(now.getFullYear(), now.getMonth(), 15),
        reminderDays: 2,
      },
      {
        userId: demoUser.id,
        name: 'Car Insurance',
        amount: 95,
        dueDay: 20,
        category: 'Insurance',
        isRecurring: true,
        frequency: BillFrequency.MONTHLY,
        nextDueDate: new Date(now.getFullYear(), now.getMonth(), 20),
        reminderDays: 5,
      },
      {
        userId: demoUser.id,
        name: 'Internet',
        amount: 60,
        dueDay: 5,
        category: 'Utilities',
        isRecurring: true,
        frequency: BillFrequency.MONTHLY,
        nextDueDate: new Date(now.getFullYear(), now.getMonth(), 5),
        reminderDays: 3,
      },
    ],
  });

  console.log('✅ Demo bills created');

  // ─────────────────────────────────────────────
  // Net Worth Snapshot
  // ─────────────────────────────────────────────
  await prisma.netWorthSnapshot.create({
    data: {
      userId: demoUser.id,
      totalAssets: 15420.5,
      totalLiabilities: 9700,
      netWorth: 5720.5,
      snapshotDate: new Date(),
    },
  });

  console.log('✅ Net worth snapshot created');

  console.log('\n🎉 Database seeding completed successfully!');
  console.log('\n📋 Summary:');
  console.log(`   Admin: admin@budgetplanner.com / Admin@123456`);
  console.log(`   Demo:  demo@budgetplanner.com  / Demo@123456`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
