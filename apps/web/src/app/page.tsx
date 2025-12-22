'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useTasksStore } from '@/stores/tasksStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useTranslation } from '@/lib/i18n';
import { api } from '@/lib/api';
import { LandingPage } from '@/components/LandingPage';
import { PlanModeSelector } from '@/components/PlanModeSelector';
import { TaskList } from '@/components/TaskList';
import { FAB } from '@/components/FAB';
import { TaskFormModal } from '@/components/TaskFormModal';
import { SettingsPage } from '@/components/SettingsPage';
import { AnalyticsPage } from '@/components/AnalyticsPage';
import { Bars3Icon } from '@heroicons/react/24/outline';
import { format, getDay } from 'date-fns';

export default function HomePage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const accessToken = useAuthStore((s) => s.accessToken);
  const locale = useSettingsStore((s) => s.locale);
  const planMode = useSettingsStore((s) => s.planMode);
  const { t } = useTranslation(locale);

  const { tasks, loadTasks, sync } = useTasksStore();
  const syncMode = useSettingsStore((s) => s.syncMode);
  const setPlanMode = useSettingsStore((s) => s.setPlanMode);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [currentPage, setCurrentPage] = useState<'tasks' | 'analytics' | 'settings'>('tasks');

  // Initialize API token on mount
  useEffect(() => {
    if (accessToken) {
      api.setToken(accessToken);
    }
  }, [accessToken]);

  // Auto-sync on page load and every 5 minutes
  useEffect(() => {
    if (isAuthenticated) {
      loadTasks();
      if (syncMode === 'cloud') {
        sync(); // Initial sync
        const interval = setInterval(() => {
          sync();
        }, 5 * 60 * 1000); // 5 minutes
        return () => clearInterval(interval);
      }
    }
  }, [isAuthenticated, syncMode, loadTasks, sync]);

  // Get today's tasks based on plan mode
  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
  const todayWeekday = getDay(today);
  const currentMonth = format(today, 'MMMM yyyy');

  // Calculate current week range (Monday to Sunday)
  const startOfWeek = new Date(today);
  const dayOfWeek = today.getDay();
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // If Sunday, go back 6 days, else go to Monday
  startOfWeek.setDate(today.getDate() + diff);
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  // Filter tasks based on plan mode
  const todayTasks = tasks.filter((task) => {
    if (task.status === 'archived') return false;

    if (planMode === 'weekly') {
      // In weekly mode, show all tasks in current week (Mon-Sun)
      if (!task.plannedDateActual) {
        return true; // Show tasks without date
      }
      const taskDate = new Date(task.plannedDateActual);
      return taskDate >= startOfWeek && taskDate <= endOfWeek;
    }

    if (planMode === 'monthly') {
      // In monthly mode, show all tasks in current month
      if (!task.plannedDateActual) {
        return true; // Show tasks without date
      }
      const taskMonth = format(new Date(task.plannedDateActual), 'MMMM yyyy');
      return taskMonth === currentMonth;
    }

    return true; // Default: show all non-archived tasks
  });

  const completedCount = todayTasks.filter(t => t.status === 'done').length;
  const totalCount = todayTasks.length;

  // Show landing page for unauthenticated users
  if (!isAuthenticated) {
    return <LandingPage />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 dark:from-slate-950 dark:via-blue-950/20 dark:to-slate-900">
      {/* Subtle grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:64px_64px] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)]"></div>

      {/* Minimal header */}
      <header className="relative backdrop-blur-xl bg-white/30 dark:bg-white/5 border-b border-white/20 dark:border-white/10 sticky top-0 z-40">
        <div className="px-4 py-4 flex items-center justify-between">
          {/* Menu button or Back button */}
          {currentPage === 'tasks' ? (
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-white/20 dark:hover:bg-white/10 rounded-lg transition-colors"
            >
              <Bars3Icon className="w-5 h-5 text-slate-700 dark:text-slate-300" />
            </button>
          ) : (
            <button
              onClick={() => setCurrentPage('tasks')}
              className="px-3 py-2 hover:bg-white/20 dark:hover:bg-white/10 rounded-lg transition-colors text-slate-700 dark:text-slate-300 font-light text-sm"
            >
              ← Back
            </button>
          )}

          {/* Month/Date or Page Title - Clickable to toggle mode */}
          {currentPage === 'tasks' ? (
            <button
              onClick={() => setPlanMode(planMode === 'weekly' ? 'monthly' : 'weekly')}
              className="text-lg font-light text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
            >
              {planMode === 'monthly' ? currentMonth : format(today, 'EEEE, d')}
            </button>
          ) : (
            <h1 className="text-lg font-light text-slate-900 dark:text-white">
              {currentPage.charAt(0).toUpperCase() + currentPage.slice(1)}
            </h1>
          )}

          {/* Completed counter (only on tasks page) */}
          {currentPage === 'tasks' ? (
            <div className="text-sm font-light text-slate-600 dark:text-slate-400">
              {completedCount}/{totalCount}
            </div>
          ) : (
            <div className="w-12" />
          )}
        </div>
      </header>

      {/* Menu dropdown */}
      {showMenu && (
        <div className="absolute top-16 left-4 z-50 backdrop-blur-xl bg-white/40 dark:bg-white/10 border border-white/20 dark:border-white/10 rounded-2xl p-2 shadow-lg min-w-[180px]">
          <button
            onClick={() => {
              setCurrentPage('analytics');
              setShowMenu(false);
            }}
            className="w-full text-left px-4 py-3 hover:bg-white/20 dark:hover:bg-white/10 rounded-xl transition-colors text-slate-900 dark:text-white font-light"
          >
            Analytics
          </button>
          <button
            onClick={() => {
              setCurrentPage('settings');
              setShowMenu(false);
            }}
            className="w-full text-left px-4 py-3 hover:bg-white/20 dark:hover:bg-white/10 rounded-xl transition-colors text-slate-900 dark:text-white font-light"
          >
            Settings
          </button>
          <button
            onClick={() => {
              useAuthStore.getState().logout();
              setShowMenu(false);
            }}
            className="w-full text-left px-4 py-3 hover:bg-white/20 dark:hover:bg-white/10 rounded-xl transition-colors text-red-600 dark:text-red-400 font-light"
          >
            Logout
          </button>
        </div>
      )}

      <main className="relative px-4 py-6">
        {currentPage === 'tasks' && <TaskList tasks={todayTasks} />}
        {currentPage === 'analytics' && <AnalyticsPage />}
        {currentPage === 'settings' && <SettingsPage />}
      </main>

      <FAB onClick={() => setShowCreateModal(true)} />
      <TaskFormModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} />
    </div>
  );
}
