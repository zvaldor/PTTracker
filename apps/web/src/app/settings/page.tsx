'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useTranslation } from '@/lib/i18n';
import { BottomNav } from '@/components/BottomNav';
import { SunIcon, MoonIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline';

export default function SettingsPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { locale, setLocale, theme, setTheme } = useSettingsStore();
  const { t } = useTranslation(locale);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen pb-20 bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-4 sticky top-0 z-40">
        <h1 className="text-xl font-bold">{t('settings')}</h1>
      </header>

      <main className="px-4 py-4 space-y-6">
        <section className="bg-white dark:bg-gray-800 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4">{t('profile')}</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400">{t('email')}</label>
              <div className="mt-1 text-sm font-medium">{user?.email}</div>
            </div>
          </div>
        </section>

        <section className="bg-white dark:bg-gray-800 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4">{t('language')}</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setLocale('en')}
              className={`flex-1 py-2 px-4 rounded-lg ${
                locale === 'en'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLocale('ru')}
              className={`flex-1 py-2 px-4 rounded-lg ${
                locale === 'ru'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Русский
            </button>
          </div>
        </section>

        <section className="bg-white dark:bg-gray-800 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4">{t('theme')}</h2>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setTheme('light')}
              className={`py-3 px-4 rounded-lg flex flex-col items-center gap-2 ${
                theme === 'light'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              <SunIcon className="w-6 h-6" />
              <span className="text-sm">{t('light')}</span>
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`py-3 px-4 rounded-lg flex flex-col items-center gap-2 ${
                theme === 'dark'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              <MoonIcon className="w-6 h-6" />
              <span className="text-sm">{t('dark')}</span>
            </button>
            <button
              onClick={() => setTheme('system')}
              className={`py-3 px-4 rounded-lg flex flex-col items-center gap-2 ${
                theme === 'system'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              <ComputerDesktopIcon className="w-6 h-6" />
              <span className="text-sm">{t('system')}</span>
            </button>
          </div>
        </section>

        <section className="bg-white dark:bg-gray-800 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4">{t('notifications')}</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Enable push notifications to get reminders about your tasks.
          </p>
          <button
            className="w-full py-2 px-4 bg-primary-600 text-white rounded-lg"
            onClick={() => {
              if ('Notification' in window) {
                Notification.requestPermission();
              }
            }}
          >
            Request Permission
          </button>
        </section>

        <section className="bg-white dark:bg-gray-800 rounded-lg p-4">
          <button
            onClick={handleLogout}
            className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium"
          >
            {t('logout')}
          </button>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
