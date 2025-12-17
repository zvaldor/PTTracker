import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Settings } from '@pt/shared';

interface SettingsState {
  settings: Settings | null;
  locale: 'en' | 'ru';
  theme: 'system' | 'light' | 'dark';
  actualTheme: 'light' | 'dark';
  planMode: 'weekly' | 'monthly' | 'range';
  setSettings: (settings: Settings) => void;
  setLocale: (locale: 'en' | 'ru') => void;
  setTheme: (theme: 'system' | 'light' | 'dark') => void;
  setActualTheme: (theme: 'light' | 'dark') => void;
  setPlanMode: (mode: 'weekly' | 'monthly' | 'range') => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: null,
      locale: 'en',
      theme: 'system',
      actualTheme: 'light',
      planMode: 'weekly',

      setSettings: (settings) => set({ settings }),
      setLocale: (locale) => set({ locale }),
      setTheme: (theme) => set({ theme }),
      setActualTheme: (actualTheme) => set({ actualTheme }),
      setPlanMode: (planMode) => set({ planMode }),
    }),
    {
      name: 'settings-storage',
    }
  )
);
