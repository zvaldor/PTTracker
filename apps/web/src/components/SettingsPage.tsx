'use client';

import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useTranslation } from '@/lib/i18n';
import { SunIcon, MoonIcon, ComputerDesktopIcon, CloudIcon, DevicePhoneMobileIcon } from '@heroicons/react/24/outline';

const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function SettingsPage() {
  const { user, logout } = useAuthStore();
  const {
    locale, setLocale,
    theme, setTheme,
    syncMode, setSyncMode,
    weekStartDay, setWeekStartDay,
    visibleTags, setVisibleTags
  } = useSettingsStore();
  const { t } = useTranslation(locale);

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Profile Section */}
      <section className="backdrop-blur-xl bg-white/30 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-2xl p-6">
        <h2 className="text-lg font-light mb-4 text-slate-900 dark:text-white">{t('profile')}</h2>
        <div>
          <label className="text-sm text-slate-600 dark:text-slate-400 font-light">{t('email')}</label>
          <div className="mt-1 text-sm font-light text-slate-900 dark:text-white">{user?.email}</div>
        </div>
      </section>

      {/* Sync Mode Section */}
      <section className="backdrop-blur-xl bg-white/30 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-2xl p-6">
        <h2 className="text-lg font-light mb-4 text-slate-900 dark:text-white">Data Storage</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 font-light mb-4">
          Choose where to store your tasks
        </p>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setSyncMode('local')}
            className={`py-4 px-4 rounded-xl flex flex-col items-center gap-2 font-light transition-all ${
              syncMode === 'local'
                ? 'bg-white/60 dark:bg-white/10 text-slate-900 dark:text-white shadow-sm border border-white/30'
                : 'bg-white/20 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-white/30 dark:hover:bg-white/10'
            }`}
          >
            <DevicePhoneMobileIcon className="w-6 h-6" />
            <span className="text-sm">Local Device</span>
          </button>
          <button
            onClick={() => setSyncMode('cloud')}
            className={`py-4 px-4 rounded-xl flex flex-col items-center gap-2 font-light transition-all ${
              syncMode === 'cloud'
                ? 'bg-white/60 dark:bg-white/10 text-slate-900 dark:text-white shadow-sm border border-white/30'
                : 'bg-white/20 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-white/30 dark:hover:bg-white/10'
            }`}
          >
            <CloudIcon className="w-6 h-6" />
            <span className="text-sm">Cloud Sync</span>
          </button>
        </div>
      </section>

      {/* Week Start Day Section */}
      <section className="backdrop-blur-xl bg-white/30 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-2xl p-6">
        <h2 className="text-lg font-light mb-4 text-slate-900 dark:text-white">Week Starts On</h2>
        <div className="grid grid-cols-2 gap-2">
          {WEEKDAY_NAMES.slice(0, 2).map((day, index) => (
            <button
              key={index}
              onClick={() => setWeekStartDay(index)}
              className={`py-3 px-4 rounded-xl font-light transition-all ${
                weekStartDay === index
                  ? 'bg-white/60 dark:bg-white/10 text-slate-900 dark:text-white shadow-sm border border-white/30'
                  : 'bg-white/20 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-white/30 dark:hover:bg-white/10'
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      </section>

      {/* Visible Tags Section */}
      <section className="backdrop-blur-xl bg-white/30 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-2xl p-6">
        <h2 className="text-lg font-light mb-4 text-slate-900 dark:text-white">Visible Task Tags</h2>
        <div className="space-y-3">
          {[
            { key: 'weekday', label: 'Weekday' },
            { key: 'desire', label: 'Desire' },
            { key: 'difficulty', label: 'Difficulty' },
            { key: 'carryover', label: 'Carryover Count' },
          ].map(({ key, label }) => (
            <label
              key={key}
              className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            >
              <span className="text-sm font-light text-slate-900 dark:text-white">{label}</span>
              <input
                type="checkbox"
                checked={visibleTags[key as keyof typeof visibleTags]}
                onChange={(e) => setVisibleTags({ [key]: e.target.checked })}
                className="w-5 h-5 rounded border-white/30 text-blue-500 focus:ring-blue-500/50 focus:ring-offset-0"
              />
            </label>
          ))}
        </div>
      </section>

      {/* Language Section */}
      <section className="backdrop-blur-xl bg-white/30 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-2xl p-6">
        <h2 className="text-lg font-light mb-4 text-slate-900 dark:text-white">{t('language')}</h2>
        <div className="flex gap-3">
          <button
            onClick={() => setLocale('en')}
            className={`flex-1 py-3 px-4 rounded-xl font-light transition-all ${
              locale === 'en'
                ? 'bg-white/60 dark:bg-white/10 text-slate-900 dark:text-white shadow-sm'
                : 'bg-white/20 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-white/30 dark:hover:bg-white/10'
            }`}
          >
            English
          </button>
          <button
            onClick={() => setLocale('ru')}
            className={`flex-1 py-3 px-4 rounded-xl font-light transition-all ${
              locale === 'ru'
                ? 'bg-white/60 dark:bg-white/10 text-slate-900 dark:text-white shadow-sm'
                : 'bg-white/20 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-white/30 dark:hover:bg-white/10'
            }`}
          >
            Русский
          </button>
        </div>
      </section>

      {/* Theme Section */}
      <section className="backdrop-blur-xl bg-white/30 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-2xl p-6">
        <h2 className="text-lg font-light mb-4 text-slate-900 dark:text-white">{t('theme')}</h2>
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => setTheme('light')}
            className={`py-4 px-4 rounded-xl flex flex-col items-center gap-2 font-light transition-all ${
              theme === 'light'
                ? 'bg-white/60 dark:bg-white/10 text-slate-900 dark:text-white shadow-sm'
                : 'bg-white/20 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-white/30 dark:hover:bg-white/10'
            }`}
          >
            <SunIcon className="w-6 h-6" />
            <span className="text-sm">{t('light')}</span>
          </button>
          <button
            onClick={() => setTheme('dark')}
            className={`py-4 px-4 rounded-xl flex flex-col items-center gap-2 font-light transition-all ${
              theme === 'dark'
                ? 'bg-white/60 dark:bg-white/10 text-slate-900 dark:text-white shadow-sm'
                : 'bg-white/20 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-white/30 dark:hover:bg-white/10'
            }`}
          >
            <MoonIcon className="w-6 h-6" />
            <span className="text-sm">{t('dark')}</span>
          </button>
          <button
            onClick={() => setTheme('system')}
            className={`py-4 px-4 rounded-xl flex flex-col items-center gap-2 font-light transition-all ${
              theme === 'system'
                ? 'bg-white/60 dark:bg-white/10 text-slate-900 dark:text-white shadow-sm'
                : 'bg-white/20 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-white/30 dark:hover:bg-white/10'
            }`}
          >
            <ComputerDesktopIcon className="w-6 h-6" />
            <span className="text-sm">{t('system')}</span>
          </button>
        </div>
      </section>

      {/* Notifications Section */}
      <section className="backdrop-blur-xl bg-white/30 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-2xl p-6">
        <h2 className="text-lg font-light mb-4 text-slate-900 dark:text-white">{t('notifications')}</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 font-light mb-4">
          Enable push notifications to get reminders about your tasks.
        </p>
        <button
          className="w-full py-3 px-4 backdrop-blur-xl bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-700 dark:text-blue-300 rounded-xl font-light transition-all"
          onClick={() => {
            if ('Notification' in window) {
              Notification.requestPermission();
            }
          }}
        >
          Request Permission
        </button>
      </section>

      {/* Logout Section */}
      <section className="backdrop-blur-xl bg-white/30 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-2xl p-6">
        <button
          onClick={handleLogout}
          className="w-full py-3 px-4 backdrop-blur-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-700 dark:text-red-300 rounded-xl font-light transition-all"
        >
          {t('logout')}
        </button>
      </section>
    </div>
  );
}
