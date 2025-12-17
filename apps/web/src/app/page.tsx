'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useTasksStore } from '@/stores/tasksStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useTranslation } from '@/lib/i18n';
import { BottomNav } from '@/components/BottomNav';
import { PlanModeSelector } from '@/components/PlanModeSelector';
import { TaskList } from '@/components/TaskList';
import { FAB } from '@/components/FAB';
import { TaskFormModal } from '@/components/TaskFormModal';
import { format, getDay } from 'date-fns';

export default function HomePage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const locale = useSettingsStore((s) => s.locale);
  const planMode = useSettingsStore((s) => s.planMode);
  const { t } = useTranslation(locale);

  const { tasks, loadTasks } = useTasksStore();
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    loadTasks();
  }, [isAuthenticated, router, loadTasks]);

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

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen pb-20 bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-4 sticky top-0 z-40">
        <h1 className="text-xl font-bold mb-3">{format(today, 'EEEE, MMMM d')}</h1>
        <PlanModeSelector />
      </header>

      <main className="px-4 py-4 space-y-6">
        <section>
          <h2 className="text-lg font-semibold mb-3">{t('today')}</h2>
          <TaskList tasks={todayTasks} />
        </section>

        {recurringFrequentTasks.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold mb-3">{t('recurringFrequent')}</h2>
            <TaskList tasks={recurringFrequentTasks} />
          </section>
        )}

        {backlogTasks.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold mb-3">{t('backlog')}</h2>
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
