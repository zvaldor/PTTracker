export type TaskStatus = 'todo' | 'done' | 'archived';
export type DifficultyTshirt = 'S' | 'M' | 'L' | 'XL';
export type Desire = 'low' | 'med' | 'high';
export type RecurringType = 'weekly' | 'monthly' | 'intervalDays';

export interface RecurringRule {
  type: RecurringType;
  interval: number;
  byWeekday?: number[];
  byMonthday?: number[];
  startDate?: string;
  endDate?: string;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string | null;
  categoryId?: string | null;
  status: TaskStatus;

  // Planning fields
  weeklyDay?: number | null;
  monthlyDay?: number | null;
  plannedDate?: string | null;
  lastPlannedKey?: string | null;

  // Metadata
  difficultyTshirt?: DifficultyTshirt | null;
  difficultyHours?: number | null;
  desire?: Desire | null;
  isRecurring: boolean;
  recurringRule?: RecurringRule | null;
  occurrencePerWeekEstimate?: number | null;
  carryOverCount: number;
  orderRank: number;

  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date | null;
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  categoryId?: string;
  weeklyDay?: number;
  monthlyDay?: number;
  plannedDate?: string;
  difficultyTshirt?: DifficultyTshirt;
  difficultyHours?: number;
  desire?: Desire;
  isRecurring?: boolean;
  recurringRule?: RecurringRule;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  categoryId?: string;
  status?: TaskStatus;
  weeklyDay?: number;
  monthlyDay?: number;
  plannedDate?: string;
  difficultyTshirt?: DifficultyTshirt;
  difficultyHours?: number;
  desire?: Desire;
  isRecurring?: boolean;
  recurringRule?: RecurringRule;
  carryOverCount?: number;
  orderRank?: number;
}

export interface BulkSyncDto {
  tasks: Array<Task & { _deleted?: boolean }>;
  lastSyncAt?: string;
}

export interface SyncResponse {
  tasks: Task[];
  deleted: string[];
  conflicts: Array<{
    taskId: string;
    serverVersion: Task;
    clientVersion: Task;
  }>;
  lastSyncAt: string;
}
