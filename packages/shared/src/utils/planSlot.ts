export function getPlanSlot(params: {
  weeklyDay?: number | null;
  monthlyDay?: number | null;
  plannedDate?: string | null;
}): string | null {
  const { weeklyDay, monthlyDay, plannedDate } = params;

  if (plannedDate) {
    return `date:${plannedDate}`;
  }

  if (monthlyDay !== null && monthlyDay !== undefined) {
    return `monthly:${monthlyDay}`;
  }

  if (weeklyDay !== null && weeklyDay !== undefined) {
    const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    return `weekly:${days[weeklyDay]}`;
  }

  return null;
}

export function parsePlanSlot(planSlot: string): {
  weeklyDay?: number;
  monthlyDay?: number;
  plannedDate?: string;
} | null {
  if (planSlot.startsWith('date:')) {
    return { plannedDate: planSlot.substring(5) };
  }

  if (planSlot.startsWith('monthly:')) {
    const day = parseInt(planSlot.substring(8), 10);
    if (!isNaN(day) && day >= 1 && day <= 31) {
      return { monthlyDay: day };
    }
  }

  if (planSlot.startsWith('weekly:')) {
    const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const dayName = planSlot.substring(7);
    const weeklyDay = days.indexOf(dayName);
    if (weeklyDay !== -1) {
      return { weeklyDay };
    }
  }

  return null;
}

export function calculateOccurrencePerWeek(recurringRule: any): number {
  if (!recurringRule || !recurringRule.type) return 0;

  const { type, interval = 1, byWeekday = [], byMonthday = [] } = recurringRule;

  if (type === 'weekly') {
    const daysPerCycle = byWeekday.length || 1;
    const weeksPerCycle = interval;
    return daysPerCycle / weeksPerCycle;
  }

  if (type === 'monthly') {
    const daysPerCycle = byMonthday.length || 1;
    const monthsPerCycle = interval;
    return (daysPerCycle / monthsPerCycle) * (12 / 52);
  }

  if (type === 'intervalDays') {
    return 7 / interval;
  }

  return 0;
}
