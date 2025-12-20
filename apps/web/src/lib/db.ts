import Dexie, { Table } from 'dexie';
import type { Task, Category, Settings } from '@pt/shared';

export interface LocalTask extends Task {
  _deleted?: boolean;
  _dirty?: boolean;
}

export interface LocalCategory extends Category {
  _deleted?: boolean;
}

export class PTDatabase extends Dexie {
  tasks!: Table<LocalTask, string>;
  categories!: Table<LocalCategory, string>;
  settings!: Table<Settings, string>;
  meta!: Table<{ key: string; value: any }, string>;

  constructor() {
    super('PTTrackerDB');

    this.version(1).stores({
      tasks: 'id, userId, status, weeklyDay, monthlyDay, plannedDate, lastPlannedKey, isRecurring, occurrencePerWeekEstimate',
      categories: 'id, userId, isEnabled',
      settings: 'id, userId',
      meta: 'key',
    });

    // Version 2: Add _dirty and _deleted indexes for sync
    this.version(2).stores({
      tasks: 'id, userId, status, weeklyDay, monthlyDay, plannedDate, lastPlannedKey, isRecurring, occurrencePerWeekEstimate, _dirty, _deleted',
      categories: 'id, userId, isEnabled, _deleted',
      settings: 'id, userId',
      meta: 'key',
    });
  }
}

export const db = new PTDatabase();
