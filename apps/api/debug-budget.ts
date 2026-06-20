import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Check ALL June transactions including potential deletedAt ones
  const all = await prisma.transaction.findMany({
    where: {
      type: 'EXPENSE',
      date: { gte: new Date('2026-06-01'), lte: new Date('2026-06-30T23:59:59') }
    },
    select: { id: true, date: true, categoryId: true, amount: true, deletedAt: true },
    orderBy: { date: 'desc' }
  });
  console.log('All June expense transactions (including deleted):');
  for (const t of all) {
    console.log(`  amt=${t.amount} cat=${t.categoryId} date=${t.date.toISOString()} deleted=${t.deletedAt ? 'YES' : 'no'}`);
  }

  // Also check what the budgets usage API would return
  console.log('\n--- Checking budget usage for Monthly Budget ---');
  const budget = await prisma.budget.findFirst({ 
    where: { name: 'Monthly Budget', deletedAt: null },
    include: { budgetCategories: { include: { category: true } } }
  });
  
  if (budget) {
    const catMap: Record<string, any> = {};
    for (const bc of budget.budgetCategories) {
      catMap[bc.categoryId] = { name: bc.category?.name, allocated: Number(bc.allocatedAmount), currency: (bc as any).currency || 'USD' };
    }

    const startOfDay = new Date(budget.startDate); startOfDay.setHours(0,0,0,0);
    const endOfDay = new Date(budget.endDate); endOfDay.setHours(23,59,59,999);

    const txs = await prisma.transaction.findMany({
      where: { userId: budget.userId, deletedAt: null, type: 'EXPENSE', date: { gte: startOfDay, lte: endOfDay } },
      include: { account: { select: { currency: true } } }
    });

    const catSpend: Record<string, number> = {};
    for (const tx of txs) {
      if (tx.categoryId && catMap[tx.categoryId]) {
        catSpend[tx.categoryId] = (catSpend[tx.categoryId] || 0) + Number(tx.amount);
      }
    }

    console.log('\nCategory spending vs allocation:');
    for (const [catId, info] of Object.entries(catMap)) {
      const spent = catSpend[catId] || 0;
      console.log(`  ${info.name}: spent=${spent} / allocated=${info.allocated} (${((spent/info.allocated)*100).toFixed(0)}%)`);
    }
  }

  await prisma.$disconnect();
}
main().catch(console.error);
