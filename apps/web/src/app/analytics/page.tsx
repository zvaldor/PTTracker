'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useTranslation } from '@/lib/i18n';
import { BottomNav } from '@/components/BottomNav';
import { api } from '@/lib/api';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function AnalyticsPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const locale = useSettingsStore((s) => s.locale);
  const { t } = useTranslation(locale);

  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const timeWindowOptions = ['thisWeek', 'lastWeek', 'thisMonth', 'custom'] as const;
  type TimeWindow = (typeof timeWindowOptions)[number];
  const [timeWindow, setTimeWindow] = useState<TimeWindow>('thisWeek');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    loadAnalytics();
  }, [isAuthenticated, router, timeWindow]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const now = new Date();
      let startDate: string;
      let endDate = now.toISOString().split('T')[0];

      if (timeWindow === 'thisWeek') {
        const start = new Date(now);
        start.setDate(now.getDate() - 7);
        startDate = start.toISOString().split('T')[0];
      } else if (timeWindow === 'lastWeek') {
        const end = new Date(now);
        end.setDate(now.getDate() - 7);
        endDate = end.toISOString().split('T')[0];
        const start = new Date(end);
        start.setDate(end.getDate() - 7);
        startDate = start.toISOString().split('T')[0];
      } else if (timeWindow === 'thisMonth') {
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        startDate = start.toISOString().split('T')[0];
      } else {
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      }

      const data = await api.getAnalytics({ startDate, endDate });
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || loading) {
    return <div className="flex items-center justify-center min-h-screen">{t('loading')}</div>;
  }

  const COLORS = ['#0ea5e9', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

  return (
    <div className="min-h-screen pb-20 bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-4 sticky top-0 z-40">
        <h1 className="text-xl font-bold mb-3">{t('analytics')}</h1>

        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {timeWindowOptions.map((tw) => (
            <button
              key={tw}
              onClick={() => setTimeWindow(tw)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                timeWindow === tw
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              {t(tw)}
            </button>
          ))}
        </div>
      </header>

      <main className="px-4 py-4 space-y-6">
        {analytics && (
          <>
            <section className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-4">{t('weeklyEfficiency')}</h2>
              <div className="mb-4">
                <div className="text-3xl font-bold text-primary-600">
                  {analytics.weeklyEfficiency.completionRate.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{t('completionRate')}</div>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={analytics.weeklyEfficiency.plannedVsDone}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="planned" fill="#94a3b8" name="Planned" />
                  <Bar dataKey="done" fill="#0ea5e9" name="Done" />
                </BarChart>
              </ResponsiveContainer>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-4">Completion by Category</h2>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={analytics.completionByCategory}
                    dataKey="count"
                    nameKey="categoryName"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {analytics.completionByCategory.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </section>

            <section className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-4">{t('carryovers')} Trend</h2>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={analytics.carryoverTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="averageCarryovers" stroke="#f59e0b" name="Avg Carryovers" />
                </LineChart>
              </ResponsiveContainer>
            </section>

            {analytics.topCarryovers.length > 0 && (
              <section className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <h2 className="text-lg font-semibold mb-4">Top Carried Over Tasks</h2>
                <div className="space-y-2">
                  {analytics.topCarryovers.map((item: any) => (
                    <div key={item.taskId} className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-sm">{item.title}</span>
                      <span className="text-sm font-semibold text-orange-600">{item.carryOverCount}x</span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
