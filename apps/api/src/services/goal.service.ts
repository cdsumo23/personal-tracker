// services/goal.service.ts
import { goalRepository } from '../repositories/goal.repository';

export class GoalService {
  async getAll(userId: string) {
    return goalRepository.findAll(userId);
  }

  async getById(id: string, userId: string) {
    const goal = await goalRepository.findById(id, userId);
    if (!goal) throw new Error('Savings goal not found');
    return goal;
  }

  async create(userId: string, data: any) {
    return goalRepository.create(userId, {
      name: data.name,
      targetAmount: data.targetAmount,
      currentAmount: data.currentAmount,
      deadline: data.deadline ? new Date(data.deadline) : null,
      priority: data.priority,
      icon: data.icon,
      color: data.color,
      categoryId: data.categoryId,
      autoContribute: data.autoContribute,
      contributionAmount: data.contributionAmount,
      contributionInterval: data.contributionInterval
    });
  }

  async update(id: string, userId: string, data: any) {
    await this.getById(id, userId); // verify ownership
    return goalRepository.update(id, userId, {
      name: data.name,
      targetAmount: data.targetAmount,
      currentAmount: data.currentAmount,
      deadline: data.deadline ? new Date(data.deadline) : null,
      priority: data.priority,
      icon: data.icon,
      color: data.color,
      categoryId: data.categoryId,
      autoContribute: data.autoContribute,
      contributionAmount: data.contributionAmount,
      contributionInterval: data.contributionInterval,
      isCompleted: data.isCompleted
    });
  }

  async delete(id: string, userId: string) {
    await this.getById(id, userId);
    return goalRepository.delete(id);
  }

  async addContribution(id: string, userId: string, data: any) {
    await this.getById(id, userId); // check owner
    return goalRepository.addContribution(id, data.amount, data.note, data.date ? new Date(data.date) : undefined);
  }

  /**
   * Forecasts the completion date of a savings goal based on its historical savings rates
   */
  async forecastGoalCompletion(id: string, userId: string) {
    const goal = await this.getById(id, userId);
    const target = goal.targetAmount.toNumber();
    const current = goal.currentAmount.toNumber();
    const needed = target - current;

    if (needed <= 0) {
      return { status: 'COMPLETED', message: 'Goal is already achieved!' };
    }

    // Look at past contributions in the last 60 days
    const contributions = goal.contributions || [];
    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() - 60);

    const recentContributions = contributions.filter(
      (c) => new Date(c.date) >= dateLimit
    );

    const totalRecent = recentContributions.reduce((acc, c) => acc + c.amount.toNumber(), 0);
    const dailyRate = totalRecent / 60; // savings per day

    if (dailyRate <= 0) {
      return {
        status: 'STAGNANT',
        message: 'No contributions recorded in the last 60 days. Unable to estimate completion.'
      };
    }

    const daysRemaining = Math.ceil(needed / dailyRate);
    const estimatedCompletionDate = new Date();
    estimatedCompletionDate.setDate(estimatedCompletionDate.getDate() + daysRemaining);

    const isAheadOfDeadline = goal.deadline 
      ? estimatedCompletionDate < new Date(goal.deadline) 
      : true;

    return {
      status: 'ON_TRACK',
      needed,
      dailySavingsRate: dailyRate,
      monthlySavingsRate: dailyRate * 30,
      daysRemaining,
      estimatedCompletionDate,
      isAheadOfDeadline
    };
  }
}
export const goalService = new GoalService();
