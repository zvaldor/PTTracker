import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { AnalyticsFilter, AnalyticsResponse } from '@pt/shared';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getAnalytics(userId: string, filter: AnalyticsFilter): Promise<AnalyticsResponse> {
    const whereClause: any = { userId };

    if (filter.startDate || filter.endDate) {
      whereClause.completedAt = {};
      if (filter.startDate) whereClause.completedAt.gte = new Date(filter.startDate);
      if (filter.endDate) whereClause.completedAt.lte = new Date(filter.endDate);
    }

    if (filter.categoryId) whereClause.categoryId = filter.categoryId;
    if (filter.desire) whereClause.desire = filter.desire;
    if (filter.status) whereClause.status = filter.status;

    const tasks = await this.prisma.task.findMany({
      where: whereClause,
      include: { category: true },
    });

    // What you do first - tasks completed earliest
    const completedTasks = tasks.filter(t => t.completedAt);
    const sortedByTime = completedTasks.sort((a, b) => {
      const timeA = a.completedAt ? new Date(a.completedAt).getHours() : 24;
      const timeB = b.completedAt ? new Date(b.completedAt).getHours() : 24;
      return timeA - timeB;
    });

    const earlyTasks = sortedByTime.slice(0, Math.ceil(sortedByTime.length / 3));

    const categoryMap = new Map<string, { id: string; name: string; count: number }>();
    const desireMap = { low: 0, med: 0, high: 0 };
    const difficultyMap: Record<string, number> = {};

    earlyTasks.forEach(task => {
      if (task.categoryId && task.category) {
        const existing = categoryMap.get(task.categoryId);
        if (existing) {
          existing.count++;
        } else {
          categoryMap.set(task.categoryId, {
            id: task.categoryId,
            name: task.category.name,
            count: 1,
          });
        }
      }

      if (task.desire) {
        desireMap[task.desire as keyof typeof desireMap]++;
      }

      const difficulty = task.difficultyTshirt || (task.difficultyHours ? `${task.difficultyHours}h` : 'unknown');
      difficultyMap[difficulty] = (difficultyMap[difficulty] || 0) + 1;
    });

    // Weekly efficiency
    const startDate = filter.startDate ? new Date(filter.startDate) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const endDate = filter.endDate ? new Date(filter.endDate) : new Date();

    const plannedVsDone = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const dayTasks = tasks.filter(t => {
        if (t.plannedDate === dateStr) return true;
        return false;
      });

      const done = dayTasks.filter(t => t.status === 'done').length;
      plannedVsDone.push({
        date: dateStr,
        planned: dayTasks.length,
        done,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    const totalPlanned = plannedVsDone.reduce((sum, d) => sum + d.planned, 0);
    const totalDone = plannedVsDone.reduce((sum, d) => sum + d.done, 0);
    const completionRate = totalPlanned > 0 ? (totalDone / totalPlanned) * 100 : 0;

    const averageCarryovers = tasks.length > 0
      ? tasks.reduce((sum, t) => sum + t.carryOverCount, 0) / tasks.length
      : 0;

    // Completion by category
    const completionByCategory = Array.from(categoryMap.values()).map(cat => ({
      categoryId: cat.id,
      categoryName: cat.name,
      count: cat.count,
    }));

    // Carryover trend
    const carryoverTrend = plannedVsDone.map(day => {
      const dayTasks = tasks.filter(t => t.plannedDate === day.date);
      const avgCarryovers = dayTasks.length > 0
        ? dayTasks.reduce((sum, t) => sum + t.carryOverCount, 0) / dayTasks.length
        : 0;

      return {
        date: day.date,
        averageCarryovers: avgCarryovers,
      };
    });

    // Top carryovers
    const topCarryovers = tasks
      .filter(t => t.carryOverCount > 0)
      .sort((a, b) => b.carryOverCount - a.carryOverCount)
      .slice(0, 10)
      .map(t => ({
        taskId: t.id,
        title: t.title,
        carryOverCount: t.carryOverCount,
      }));

    return {
      whatYouDoFirst: {
        categories: completionByCategory,
        byDesire: desireMap,
        byDifficulty: difficultyMap,
      },
      weeklyEfficiency: {
        plannedVsDone,
        completionRate,
        averageCarryovers,
      },
      completionByCategory,
      carryoverTrend,
      topCarryovers,
    };
  }
}
