import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { getPlanSlot, calculateOccurrencePerWeek } from '@pt/shared';
import type { Task, CreateTaskDto, UpdateTaskDto } from '@pt/shared';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string): Promise<Task[]> {
    const tasks = await this.prisma.task.findMany({
      where: { userId },
      orderBy: [{ orderRank: 'asc' }, { createdAt: 'desc' }],
    });
    return tasks.map(this.mapTask);
  }

  async findOne(userId: string, id: string): Promise<Task | null> {
    const task = await this.prisma.task.findFirst({
      where: { id, userId },
    });
    return task ? this.mapTask(task) : null;
  }

  async create(userId: string, dto: CreateTaskDto): Promise<Task> {
    const lastPlannedKey = getPlanSlot({
      weeklyDay: dto.weeklyDay,
      monthlyDay: dto.monthlyDay,
      plannedDate: dto.plannedDate,
    });

    const occurrencePerWeekEstimate = dto.isRecurring && dto.recurringRule
      ? calculateOccurrencePerWeek(dto.recurringRule)
      : null;

    const task = await this.prisma.task.create({
      data: {
        userId,
        title: dto.title,
        description: dto.description,
        categoryId: dto.categoryId,
        weeklyDay: dto.weeklyDay,
        monthlyDay: dto.monthlyDay,
        plannedDate: dto.plannedDate,
        lastPlannedKey,
        difficultyTshirt: dto.difficultyTshirt,
        difficultyHours: dto.difficultyHours,
        desire: dto.desire,
        isRecurring: dto.isRecurring || false,
        recurringRule: dto.recurringRule as any,
        occurrencePerWeekEstimate,
      },
    });

    return this.mapTask(task);
  }

  async update(userId: string, id: string, dto: UpdateTaskDto): Promise<Task> {
    const updateData: any = { ...dto };

    if (dto.weeklyDay !== undefined || dto.monthlyDay !== undefined || dto.plannedDate !== undefined) {
      updateData.lastPlannedKey = getPlanSlot({
        weeklyDay: dto.weeklyDay,
        monthlyDay: dto.monthlyDay,
        plannedDate: dto.plannedDate,
      });
    }

    if (dto.isRecurring !== undefined && dto.recurringRule) {
      updateData.occurrencePerWeekEstimate = calculateOccurrencePerWeek(dto.recurringRule);
    }

    if (dto.status === 'done') {
      updateData.completedAt = new Date();
    }

    const task = await this.prisma.task.update({
      where: { id },
      data: updateData,
    });

    return this.mapTask(task);
  }

  async delete(userId: string, id: string): Promise<void> {
    await this.prisma.task.delete({
      where: { id },
    });
  }

  async findByPlanSlot(userId: string, planSlot: string): Promise<Task[]> {
    const tasks = await this.prisma.task.findMany({
      where: {
        userId,
        lastPlannedKey: planSlot,
        status: { not: 'archived' },
      },
      orderBy: [{ orderRank: 'asc' }, { createdAt: 'desc' }],
    });
    return tasks.map(this.mapTask);
  }

  async findRecurringFrequent(userId: string): Promise<Task[]> {
    const tasks = await this.prisma.task.findMany({
      where: {
        userId,
        isRecurring: true,
        occurrencePerWeekEstimate: { gt: 1 },
        status: { not: 'archived' },
      },
      orderBy: [{ orderRank: 'asc' }, { createdAt: 'desc' }],
    });
    return tasks.map(this.mapTask);
  }

  async findBacklog(userId: string): Promise<Task[]> {
    const tasks = await this.prisma.task.findMany({
      where: {
        userId,
        lastPlannedKey: null,
        status: { not: 'archived' },
      },
      orderBy: [{ orderRank: 'asc' }, { createdAt: 'desc' }],
    });
    return tasks.map(this.mapTask);
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
