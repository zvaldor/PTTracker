export type WeekStart = 'mon' | 'sun';
export type DifficultyMode = 'tshirt' | 'hours';

export interface TshirtLabels {
  S: string;
  M: string;
  L: string;
  XL: string;
}

export interface Settings {
  id: string;
  userId: string;
  weekStartsOn: WeekStart;
  enableCategories: boolean;
  enableDifficulty: boolean;
  enableDesire: boolean;
  difficultyMode: DifficultyMode;
  tshirtLabels: TshirtLabels;
  hourPresets: number[];
  notificationsEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateSettingsDto {
  weekStartsOn?: WeekStart;
  enableCategories?: boolean;
  enableDifficulty?: boolean;
  enableDesire?: boolean;
  difficultyMode?: DifficultyMode;
  tshirtLabels?: TshirtLabels;
  hourPresets?: number[];
  notificationsEnabled?: boolean;
}

export const DEFAULT_TSHIRT_LABELS: TshirtLabels = {
  S: 'Small',
  M: 'Medium',
  L: 'Large',
  XL: 'Extra Large'
};

export const DEFAULT_HOUR_PRESETS = [0.5, 1, 2, 4, 8];
