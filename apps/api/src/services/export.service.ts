// services/export.service.ts
import prisma from '../config/database';
import { stringify } from 'csv-stringify/sync';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';

export class ExportService {
  async exportTransactionsCSV(userId: string): Promise<string> {
    const transactions = await prisma.transaction.findMany({
      where: { userId, deletedAt: null },
      include: { category: true, account: true },
      orderBy: { date: 'desc' }
    });

    const data = transactions.map((tx) => ({
      Date: tx.date.toISOString().split('T')[0],
      Description: tx.description,
      Type: tx.type,
      Category: tx.category?.name || 'Uncategorized',
      Account: tx.account.name,
      Amount: tx.amount.toNumber(),
      Notes: tx.notes || '',
      Tags: tx.tags.join(', ')
    }));

    return stringify(data, { header: true });
  }

  async exportTransactionsExcel(userId: string): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Transactions');

    worksheet.columns = [
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Description', key: 'description', width: 30 },
      { header: 'Type', key: 'type', width: 12 },
      { header: 'Category', key: 'category', width: 18 },
      { header: 'Account', key: 'account', width: 18 },
      { header: 'Amount', key: 'amount', width: 15 },
      { header: 'Notes', key: 'notes', width: 30 },
      { header: 'Tags', key: 'tags', width: 20 }
    ];

    const transactions = await prisma.transaction.findMany({
      where: { userId, deletedAt: null },
      include: { category: true, account: true },
      orderBy: { date: 'desc' }
    });

    for (const tx of transactions) {
      worksheet.addRow({
        date: tx.date.toISOString().split('T')[0],
        description: tx.description,
        type: tx.type,
        category: tx.category?.name || 'Uncategorized',
        account: tx.account.name,
        amount: tx.amount.toNumber(),
        notes: tx.notes || '',
        tags: tx.tags.join(', ')
      });
    }

    // Format header row
    worksheet.getRow(1).font = { bold: true };
    
    return workbook.xlsx.writeBuffer() as unknown as Promise<Buffer>;
  }

  async exportTransactionsPDF(userId: string): Promise<Buffer> {
    return new Promise(async (resolve, reject) => {
      try {
        const transactions = await prisma.transaction.findMany({
          where: { userId, deletedAt: null },
          include: { category: true, account: true },
          orderBy: { date: 'desc' },
          take: 50 // Limit to last 50 for layout simplicity in PDF
        });

        const doc = new PDFDocument({ margin: 30, size: 'A4' });
        const buffers: Buffer[] = [];
        
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          resolve(Buffer.concat(buffers));
        });

        // Add header title
        doc.fontSize(20).text('Personal Ledger Report', { align: 'center' });
        doc.moveDown();
        doc.fontSize(10).text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'right' });
        doc.moveDown();

        // Draw simple table headers
        let y = 120;
        doc.font('Helvetica-Bold');
        doc.text('Date', 30, y);
        doc.text('Description', 110, y);
        doc.text('Category', 260, y);
        doc.text('Account', 370, y);
        doc.text('Amount', 480, y, { align: 'right', width: 80 });
        
        doc.moveTo(30, y + 15).lineTo(560, y + 15).stroke();
        y += 20;

        doc.font('Helvetica');
        for (const tx of transactions) {
          if (y > 750) {
            doc.addPage();
            y = 50;
          }
          doc.text(tx.date.toISOString().split('T')[0], 30, y);
          doc.text(tx.description.substring(0, 25), 110, y);
          doc.text(tx.category?.name || 'Uncategorized', 260, y);
          doc.text(tx.account.name, 370, y);
          
          const amountText = `${tx.type === 'EXPENSE' ? '-' : ''}$${tx.amount.toNumber().toFixed(2)}`;
          doc.text(amountText, 480, y, { align: 'right', width: 80 });
          y += 20;
        }

        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Exports full backup data of a user (accounts, transactions, categories, budgets, savings goals, debts, bills)
   */
  async exportFullBackup(userId: string) {
    const [accounts, transactions, categories, budgets, savingsGoals, debts, bills] = await Promise.all([
      prisma.account.findMany({ where: { userId, deletedAt: null } }),
      prisma.transaction.findMany({ where: { userId, deletedAt: null } }),
      prisma.category.findMany({ where: { userId, deletedAt: null } }),
      prisma.budget.findMany({ 
        where: { userId, deletedAt: null },
        include: { budgetCategories: true }
      }),
      prisma.savingsGoal.findMany({ 
        where: { userId, deletedAt: null },
        include: { contributions: true }
      }),
      prisma.debt.findMany({ 
        where: { userId, deletedAt: null },
        include: { payments: true }
      }),
      prisma.bill.findMany({ where: { userId, deletedAt: null } })
    ]);

    return {
      version: '1.0.0',
      exportedAt: new Date(),
      data: {
        accounts,
        transactions,
        categories,
        budgets,
        savingsGoals,
        debts,
        bills
      }
    };
  }
}
export const exportService = new ExportService();
