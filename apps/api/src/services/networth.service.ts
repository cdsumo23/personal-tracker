// services/networth.service.ts
import prisma from '../config/database';
import { reportService } from './report.service';

export class NetWorthService {
  async getCurrentNetWorth(userId: string) {
    const stats = await reportService.getDashboardStats(userId);
    return {
      totalAssets: stats.totalAssets,
      totalLiabilities: stats.totalLiabilities,
      netWorth: stats.netWorth,
      date: new Date()
    };
  }

  /**
   * Captures a snapshot of the user's current net worth and logs it to NetWorthSnapshot table.
   */
  async takeSnapshot(userId: string) {
    const stats = await this.getCurrentNetWorth(userId);
    
    // Check if snapshot already exists for today to avoid duplicates
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await prisma.netWorthSnapshot.findFirst({
      where: {
        userId,
        snapshotDate: {
          gte: today
        }
      }
    });

    if (existing) {
      return prisma.netWorthSnapshot.update({
        where: { id: existing.id },
        data: {
          totalAssets: stats.totalAssets,
          totalLiabilities: stats.totalLiabilities,
          netWorth: stats.netWorth
        }
      });
    }

    return prisma.netWorthSnapshot.create({
      data: {
        userId,
        totalAssets: stats.totalAssets,
        totalLiabilities: stats.totalLiabilities,
        netWorth: stats.netWorth,
        snapshotDate: new Date()
      }
    });
  }

  async getHistory(userId: string) {
    return prisma.netWorthSnapshot.findMany({
      where: { userId },
      orderBy: { snapshotDate: 'asc' }
    });
  }
}
export const netWorthService = new NetWorthService();
