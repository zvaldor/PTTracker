'use client';

import { useSettingsStore } from '@/stores/settingsStore';
import { useTranslation } from '@/lib/i18n';

export function PlanModeSelector() {
  const locale = useSettingsStore((s) => s.locale);
  const planMode = useSettingsStore((s) => s.planMode);
  const setPlanMode = useSettingsStore((s) => s.setPlanMode);
  const { t } = useTranslation(locale);

  const modes: Array<'weekly' | 'monthly'> = ['weekly', 'monthly'];

  return (
    <div className="flex gap-2 backdrop-blur-sm bg-white/20 dark:bg-white/5 rounded-xl p-1">
      {modes.map((mode) => (
        <button
          key={mode}
          onClick={() => setPlanMode(mode)}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-light transition-all ${
            planMode === mode
              ? 'bg-white/60 dark:bg-white/10 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          {t(mode)}
        </button>
      ))}
    </div>
  );
}
