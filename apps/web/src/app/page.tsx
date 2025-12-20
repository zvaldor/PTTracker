'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useTasksStore } from '@/stores/tasksStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useTranslation } from '@/lib/i18n';
import { LandingPage } from '@/components/LandingPage';
import { BottomNav } from '@/components/BottomNav';
import { PlanModeSelector } from '@/components/PlanModeSelector';
import { TaskList } from '@/components/TaskList';
import { FAB } from '@/components/FAB';
import { TaskFormModal } from '@/components/TaskFormModal';
import { format, getDay } from 'date-fns';

export default function HomePage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const locale = useSettingsStore((s) => s.locale);
  const planMode = useSettingsStore((s) => s.planMode);
  const { t } = useTranslation(locale);

  const { tasks, loadTasks } = useTasksStore();
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadTasks();
    }
  }, [isAuthenticated, loadTasks]);

  // Get today's tasks based on plan mode
  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
  const todayWeekday = getDay(today);
  const todayMonthDay = today.getDate();

  const todayTasks = tasks.filter((task) => {
    if (task.status === 'archived') return false;

    if (planMode === 'weekly') {
      return task.weeklyDay === todayWeekday || task.plannedDate === todayStr;
    }
    if (planMode === 'monthly') {
      return task.monthlyDay === todayMonthDay || task.plannedDate === todayStr;
    }
    if (planMode === 'range') {
      return task.plannedDate === todayStr;
    }
    return false;
  });

  const recurringFrequentTasks = tasks.filter(
    (task) => task.isRecurring && (task.occurrencePerWeekEstimate || 0) > 1 && task.status !== 'archived'
  );

  const backlogTasks = tasks.filter(
    (task) => !task.weeklyDay && !task.monthlyDay && !task.plannedDate && task.status !== 'archived'
  );

  // Show landing page for unauthenticated users
  if (!isAuthenticated) {
    return <LandingPage />;
  }

  return (
    <div className="min-h-screen pb-20 bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 dark:from-slate-950 dark:via-blue-950/20 dark:to-slate-900">
      {/* Subtle grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:64px_64px] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)]"></div>

      {/* Glassmorphism header */}
      <header className="relative backdrop-blur-xl bg-white/40 dark:bg-white/5 border-b border-white/20 dark:border-white/10 px-4 py-6 sticky top-0 z-40">
        <h1 className="text-2xl font-light tracking-tight text-slate-900 dark:text-white mb-4">
          {format(today, 'EEEE, MMMM d')}
        </h1>
        <PlanModeSelector />
      </header>

      <main className="relative px-4 py-6 space-y-8">
        <section>
          <h2 className="text-lg font-light text-slate-700 dark:text-slate-300 mb-4">{t('today')}</h2>
          <TaskList tasks={todayTasks} />
        </section>

        {recurringFrequentTasks.length > 0 && (
          <section>
            <h2 className="text-lg font-light text-slate-700 dark:text-slate-300 mb-4">{t('recurringFrequent')}</h2>
            <TaskList tasks={recurringFrequentTasks} />
          </section>
        )}

        {backlogTasks.length > 0 && (
          <section>
            <h2 className="text-lg font-light text-slate-700 dark:text-slate-300 mb-4">{t('backlog')}</h2>
            <TaskList tasks={backlogTasks} />
          </section>
        )}
      </main>

      <FAB onClick={() => setShowCreateModal(true)} />
      <TaskFormModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} />
      <BottomNav />
    </div>
  );
}
