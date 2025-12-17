'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HomeIcon, ChartBarIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import { HomeIcon as HomeIconSolid, ChartBarIcon as ChartBarIconSolid, Cog6ToothIcon as Cog6ToothIconSolid } from '@heroicons/react/24/solid';
import { useSettingsStore } from '@/stores/settingsStore';
import { useTranslation } from '@/lib/i18n';

export function BottomNav() {
  const pathname = usePathname();
  const locale = useSettingsStore((s) => s.locale);
  const { t } = useTranslation(locale);

  const tabs = [
    { name: t('home'), path: '/', icon: HomeIcon, activeIcon: HomeIconSolid },
    { name: t('analytics'), path: '/analytics', icon: ChartBarIcon, activeIcon: ChartBarIconSolid },
    { name: t('settings'), path: '/settings', icon: Cog6ToothIcon, activeIcon: Cog6ToothIconSolid },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 safe-area-bottom z-50">
      <div className="flex items-center justify-around h-16">
        {tabs.map((tab) => {
          const isActive = pathname === tab.path;
          const Icon = isActive ? tab.activeIcon : tab.icon;

          return (
            <Link
              key={tab.path}
              href={tab.path}
              className={`flex flex-col items-center justify-center flex-1 h-full ${
                isActive ? 'text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs mt-1">{tab.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
