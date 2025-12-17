'use client';

import { useSettingsStore } from '@/stores/settingsStore';
import { useTranslation } from '@/lib/i18n';

export function PlanModeSelector() {
  const locale = useSettingsStore((s) => s.locale);
  const planMode = useSettingsStore((s) => s.planMode);
  const setPlanMode = useSettingsStore((s) => s.setPlanMode);
  const { t } = useTranslation(locale);

  const modes: Array<'weekly' | 'monthly' | 'range'> = ['weekly', 'monthly', 'range'];

  return (
    <div className="flex gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
      {modes.map((mode) => (
        <button
          key={mode}
          onClick={() => setPlanMode(mode)}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            planMode === mode
              ? 'bg-white dark:bg-gray-600 text-primary-600 dark:text-primary-400 shadow-sm'
              : 'text-gray-600 dark:text-gray-300'
          }`}
        >
          {t(mode)}
        </button>
      ))}
    </div>
  );
}
