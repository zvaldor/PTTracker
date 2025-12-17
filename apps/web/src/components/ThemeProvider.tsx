'use client';

import { useEffect } from 'react';
import { useSettingsStore } from '@/stores/settingsStore';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSettingsStore((s) => s.theme);
  const setActualTheme = useSettingsStore((s) => s.setActualTheme);

  useEffect(() => {
    const updateTheme = () => {
      let actualTheme: 'light' | 'dark' = 'light';

      if (theme === 'system') {
        actualTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      } else {
        actualTheme = theme;
      }

      setActualTheme(actualTheme);
      document.documentElement.classList.toggle('dark', actualTheme === 'dark');
    };

    updateTheme();

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', updateTheme);

    return () => mediaQuery.removeEventListener('change', updateTheme);
  }, [theme, setActualTheme]);

  return <>{children}</>;
}
