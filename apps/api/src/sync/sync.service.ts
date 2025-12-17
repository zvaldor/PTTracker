import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { getPlanSlot, calculateOccurrencePerWeek } from '@pt/shared';
import type { BulkSyncDto, SyncResponse, Task } from '@pt/shared';

@Injectable()
export class SyncService {
  constructor(private prisma: PrismaService) {}

  async sync(userId: string, dto: BulkSyncDto): Promise<SyncResponse> {
    const lastSyncAt = dto.lastSyncAt ? new Date(dto.lastSyncAt) : new Date(0);
    const conflicts: SyncResponse['conflicts'] = [];
    const deleted: string[] = [];

    // Get server tasks updated after last sync
    const serverTasks = await this.prisma.task.findMany({
      where: {
        userId,
        updatedAt: { gt: lastSyncAt },
      },
    });

    // Process client tasks
    for (const clientTask of dto.tasks) {
      if (clientTask._deleted) {
        // Client deleted this task
        await this.prisma.task.deleteMany({
          where: { id: clientTask.id, userId },
        });
        deleted.push(clientTask.id);
        continue;
      }

      const serverTask = await this.prisma.task.findFirst({
        where: { id: clientTask.id, userId },
      });

      if (!serverTask) {
        // New task from client
        const lastPlannedKey = getPlanSlot({
          weeklyDay: clientTask.weeklyDay,
          monthlyDay: clientTask.monthlyDay,
          plannedDate: clientTask.plannedDate,
        });

        const occurrencePerWeekEstimate = clientTask.isRecurring && clientTask.recurringRule
          ? calculateOccurrencePerWeek(clientTask.recurringRule)
          : null;

        await this.prisma.task.create({
          data: {
            id: clientTask.id,
            userId,
            title: clientTask.title,
            description: clientTask.description,
            categoryId: clientTask.categoryId,
            status: clientTask.status,
            weeklyDay: clientTask.weeklyDay,
            monthlyDay: clientTask.monthlyDay,
            plannedDate: clientTask.plannedDate,
            lastPlannedKey,
            difficultyTshirt: clientTask.difficultyTshirt,
            difficultyHours: clientTask.difficultyHours,
            desire: clientTask.desire,
            isRecurring: clientTask.isRecurring,
            recurringRule: clientTask.recurringRule as any,
            occurrencePerWeekEstimate,
            carryOverCount: clientTask.carryOverCount,
            orderRank: clientTask.orderRank,
            completedAt: clientTask.completedAt ? new Date(clientTask.completedAt) : null,
            createdAt: clientTask.createdAt ? new Date(clientTask.createdAt) : undefined,
            updatedAt: clientTask.updatedAt ? new Date(clientTask.updatedAt) : undefined,
          },
        });
      } else {
        // Conflict detection
        const clientUpdated = new Date(clientTask.updatedAt);
        const serverUpdated = new Date(serverTask.updatedAt);

        if (serverUpdated > lastSyncAt && clientUpdated > lastSyncAt) {
          // Both modified since last sync - conflict!
          conflicts.push({
            taskId: clientTask.id,
            serverVersion: this.mapTask(serverTask),
            clientVersion: clientTask,
          });

          // Last write wins (use the most recent)
          if (clientUpdated > serverUpdated) {
            await this.updateTask(userId, clientTask);
          }
        } else if (clientUpdated > serverUpdated) {
          // Client is newer
          await this.updateTask(userId, clientTask);
        }
        // If server is newer, we'll send it to client in response
      }
    }

    // Get all current tasks to send to client
    const allTasks = await this.prisma.task.findMany({
      where: { userId },
    });

    return {
      tasks: allTasks.map(this.mapTask),
      deleted,
      conflicts,
      lastSyncAt: new Date().toISOString(),
    };
  }

  private async updateTask(userId: string, task: Task) {
    const lastPlannedKey = getPlanSlot({
      weeklyDay: task.weeklyDay,
      monthlyDay: task.monthlyDay,
      plannedDate: task.plannedDate,
    });

    const occurrencePerWeekEstimate = task.isRecurring && task.recurringRule
      ? calculateOccurrencePerWeek(task.recurringRule)
      : null;

    await this.prisma.task.update({
      where: { id: task.id },
      data: {
        title: task.title,
        description: task.description,
        categoryId: task.categoryId,
        status: task.status,
        weeklyDay: task.weeklyDay,
        monthlyDay: task.monthlyDay,
        plannedDate: task.plannedDate,
        lastPlannedKey,
        difficultyTshirt: task.difficultyTshirt,
        difficultyHours: task.difficultyHours,
        desire: task.desire,
        isRecurring: task.isRecurring,
        recurringRule: task.recurringRule as any,
        occurrencePerWeekEstimate,
        carryOverCount: task.carryOverCount,
        orderRank: task.orderRank,
        completedAt: task.completedAt ? new Date(task.completedAt) : null,
      },
    });
  }

  private mapTask(task: any): Task {
    return {
      ...task,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      completedAt: task.completedAt,
    };
  }
}
