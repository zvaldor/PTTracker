import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Settings } from '@pt/shared';

interface SettingsState {
  settings: Settings | null;
  locale: 'en' | 'ru';
  theme: 'system' | 'light' | 'dark';
  actualTheme: 'light' | 'dark';
  planMode: 'weekly' | 'monthly';
  syncMode: 'local' | 'cloud';
  weekStartDay: number; // 0 = Sunday, 1 = Monday, etc.
  visibleTags: {
    weekday: boolean;
    desire: boolean;
    difficulty: boolean;
    carryover: boolean;
  };
  setSettings: (settings: Settings) => void;
  setLocale: (locale: 'en' | 'ru') => void;
  setTheme: (theme: 'system' | 'light' | 'dark') => void;
  setActualTheme: (theme: 'light' | 'dark') => void;
  setPlanMode: (mode: 'weekly' | 'monthly') => void;
  setSyncMode: (mode: 'local' | 'cloud') => void;
  setWeekStartDay: (day: number) => void;
  setVisibleTags: (tags: { weekday?: boolean; desire?: boolean; difficulty?: boolean; carryover?: boolean }) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: null,
      locale: 'en',
      theme: 'system',
      actualTheme: 'light',
      planMode: 'weekly',
      syncMode: 'cloud',
      weekStartDay: 1, // Monday by default
      visibleTags: {
        weekday: true,
        desire: true,
        difficulty: true,
        carryover: true,
      },

      setSettings: (settings) => set({ settings }),
      setLocale: (locale) => set({ locale }),
      setTheme: (theme) => set({ theme }),
      setActualTheme: (actualTheme) => set({ actualTheme }),
      setPlanMode: (planMode) => set({ planMode }),
      setSyncMode: (syncMode) => set({ syncMode }),
      setWeekStartDay: (weekStartDay) => set({ weekStartDay }),
      setVisibleTags: (tags) => set((state) => ({
        visibleTags: { ...state.visibleTags, ...tags }
      })),
    }),
    {
      name: 'settings-storage',
    }
  )
);
