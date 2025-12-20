'use client';

import { useEffect, useState } from 'react';
import { useSettingsStore } from '@/stores/settingsStore';
import { useTranslation } from '@/lib/i18n';
import { api } from '@/lib/api';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function AnalyticsPage() {
  const locale = useSettingsStore((s) => s.locale);
  const { t } = useTranslation(locale);

  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeWindow, setTimeWindow] = useState('thisWeek');

  useEffect(() => {
    loadAnalytics();
  }, [timeWindow]);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-slate-600 dark:text-slate-400 font-light">{t('loading')}</div>
      </div>
    );
  }

  const COLORS = ['#0ea5e9', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Time Window Selector */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar backdrop-blur-xl bg-white/20 dark:bg-white/5 rounded-xl p-1">
        {['thisWeek', 'lastWeek', 'thisMonth', 'custom'].map((tw) => (
          <button
            key={tw}
            onClick={() => setTimeWindow(tw)}
            className={`px-4 py-2 rounded-lg text-sm font-light whitespace-nowrap transition-all ${
              timeWindow === tw
                ? 'bg-white/60 dark:bg-white/10 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-white/20 dark:hover:bg-white/10'
            }`}
          >
            {t(tw)}
          </button>
        ))}
      </div>

      {analytics && (
        <>
          {/* Weekly Efficiency */}
          <section className="backdrop-blur-xl bg-white/30 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-light mb-4 text-slate-900 dark:text-white">{t('weeklyEfficiency')}</h2>
            <div className="mb-6">
              <div className="text-4xl font-light text-blue-600 dark:text-blue-400">
                {analytics.weeklyEfficiency.completionRate.toFixed(1)}%
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400 font-light">{t('completionRate')}</div>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={analytics.weeklyEfficiency.plannedVsDone}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
                <XAxis dataKey="date" stroke="rgba(148, 163, 184, 0.5)" />
                <YAxis stroke="rgba(148, 163, 184, 0.5)" />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', border: 'none', borderRadius: '8px' }} />
                <Legend />
                <Bar dataKey="planned" fill="#94a3b8" name="Planned" />
                <Bar dataKey="done" fill="#0ea5e9" name="Done" />
              </BarChart>
            </ResponsiveContainer>
          </section>

          {/* Completion by Category */}
          <section className="backdrop-blur-xl bg-white/30 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-light mb-4 text-slate-900 dark:text-white">Completion by Category</h2>
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
                <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', border: 'none', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </section>

          {/* Carryover Trend */}
          <section className="backdrop-blur-xl bg-white/30 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-light mb-4 text-slate-900 dark:text-white">{t('carryovers')} Trend</h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={analytics.carryoverTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
                <XAxis dataKey="date" stroke="rgba(148, 163, 184, 0.5)" />
                <YAxis stroke="rgba(148, 163, 184, 0.5)" />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', border: 'none', borderRadius: '8px' }} />
                <Legend />
                <Line type="monotone" dataKey="averageCarryovers" stroke="#f59e0b" name="Avg Carryovers" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </section>

          {/* Top Carried Over Tasks */}
          {analytics.topCarryovers.length > 0 && (
            <section className="backdrop-blur-xl bg-white/30 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-2xl p-6">
              <h2 className="text-lg font-light mb-4 text-slate-900 dark:text-white">Top Carried Over Tasks</h2>
              <div className="space-y-3">
                {analytics.topCarryovers.map((item: any) => (
                  <div key={item.taskId} className="flex justify-between items-center py-3 border-b border-white/10 last:border-0">
                    <span className="text-sm font-light text-slate-900 dark:text-white">{item.title}</span>
                    <span className="text-sm font-light text-orange-600 dark:text-orange-400">{item.carryOverCount}x</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
