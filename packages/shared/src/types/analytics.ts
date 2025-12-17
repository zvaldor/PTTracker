export interface AnalyticsFilter {
  startDate?: string;
  endDate?: string;
  categoryId?: string;
  difficulty?: string;
  desire?: string;
  status?: string;
}

export interface PlannedVsDoneByDay {
  date: string;
  planned: number;
  done: number;
}

export interface CompletionByCategory {
  categoryId: string;
  categoryName: string;
  count: number;
}

export interface CarryoverTrend {
  date: string;
  averageCarryovers: number;
}

export interface WhatYouDoFirst {
  categories: Array<{
    categoryId: string;
    categoryName: string;
    count: number;
  }>;
  byDesire: {
    low: number;
    med: number;
    high: number;
  };
  byDifficulty: Record<string, number>;
}

export interface WeeklyEfficiency {
  plannedVsDone: PlannedVsDoneByDay[];
  completionRate: number;
  averageCarryovers: number;
}

export interface TopCarryovers {
  taskId: string;
  title: string;
  carryOverCount: number;
}

export interface AnalyticsResponse {
  whatYouDoFirst: WhatYouDoFirst;
  weeklyEfficiency: WeeklyEfficiency;
  completionByCategory: CompletionByCategory[];
  carryoverTrend: CarryoverTrend[];
  topCarryovers: TopCarryovers[];
}
