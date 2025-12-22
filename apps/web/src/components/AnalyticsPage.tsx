'use client';

import { useEffect, useState, useMemo } from 'react';
import { useSettingsStore } from '@/stores/settingsStore';
import { useTasksStore } from '@/stores/tasksStore';
import { useTranslation } from '@/lib/i18n';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function AnalyticsPage() {
  const locale = useSettingsStore((s) => s.locale);
  const { t } = useTranslation(locale);
  const tasks = useTasksStore((s) => s.tasks);

  const [timeWindow, setTimeWindow] = useState('thisWeek');

  const analytics = useMemo(() => {
    const now = new Date();
    let startDate: Date;
    let endDate = new Date(now);

    if (timeWindow === 'thisWeek') {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
    } else if (timeWindow === 'lastWeek') {
      endDate = new Date(now);
      endDate.setDate(now.getDate() - 7);
      startDate = new Date(endDate);
      startDate.setDate(endDate.getDate() - 7);
    } else if (timeWindow === 'thisMonth') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Filter tasks by date range - use createdAt or updatedAt if plannedDateActual is missing
    const filteredTasks = tasks.filter(task => {
      if (task.status === 'archived') return false;

      const taskDate = task.plannedDateActual
        ? new Date(task.plannedDateActual)
        : task.updatedAt
        ? new Date(task.updatedAt)
        : task.createdAt
        ? new Date(task.createdAt)
        : null;

      if (!taskDate) return false;
      return taskDate >= startDate && taskDate <= endDate;
    });

    // Calculate planned vs done per day
    const plannedVsDone: Array<{ date: string; planned: number; done: number }> = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const dayTasks = filteredTasks.filter(t => {
        const taskDateStr = t.plannedDateActual ||
          (t.updatedAt ? new Date(t.updatedAt).toISOString().split('T')[0] : null) ||
          (t.createdAt ? new Date(t.createdAt).toISOString().split('T')[0] : null);
        return taskDateStr === dateStr;
      });
      const done = dayTasks.filter(t => t.status === 'done').length;

      plannedVsDone.push({
        date: dateStr,
        planned: dayTasks.length,
        done,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Calculate completion rate
    const totalPlanned = plannedVsDone.reduce((sum, d) => sum + d.planned, 0);
    const totalDone = plannedVsDone.reduce((sum, d) => sum + d.done, 0);
    const completionRate = totalPlanned > 0 ? (totalDone / totalPlanned) * 100 : 0;

    // Completion by category (mock data since we don't have categories in current schema)
    const completionByCategory = [
      { categoryName: 'Work', count: filteredTasks.filter(t => t.status === 'done').length },
    ];

    // Carryover trend
    const carryoverTrend = plannedVsDone.map(day => {
      const dayTasks = filteredTasks.filter(t => {
        const taskDateStr = t.plannedDateActual ||
          (t.updatedAt ? new Date(t.updatedAt).toISOString().split('T')[0] : null) ||
          (t.createdAt ? new Date(t.createdAt).toISOString().split('T')[0] : null);
        return taskDateStr === day.date;
      });
      const avgCarryovers = dayTasks.length > 0
        ? dayTasks.reduce((sum, t) => sum + (t.carryOverCount || 0), 0) / dayTasks.length
        : 0;

      return {
        date: day.date,
        averageCarryovers: avgCarryovers,
      };
    });

    // Top carryovers
    const topCarryovers = filteredTasks
      .filter(t => (t.carryOverCount || 0) > 0)
      .sort((a, b) => (b.carryOverCount || 0) - (a.carryOverCount || 0))
      .slice(0, 10)
      .map(t => ({
        taskId: t.id,
        title: t.title,
        carryOverCount: t.carryOverCount || 0,
      }));

    return {
      weeklyEfficiency: {
        plannedVsDone,
        completionRate,
      },
      completionByCategory,
      carryoverTrend,
      topCarryovers,
    };
  }, [tasks, timeWindow]);

  const COLORS = ['#0ea5e9', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

  const timeWindows = ['thisWeek', 'lastWeek', 'thisMonth'] as const;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Time Window Selector */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar backdrop-blur-xl bg-white/20 dark:bg-white/5 rounded-xl p-1">
        {timeWindows.map((tw) => (
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
