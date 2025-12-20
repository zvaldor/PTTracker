'use client';

import { useState } from 'react';
import { format, parse } from 'date-fns';
import type { Task } from '@pt/shared';
import { useTasksStore } from '@/stores/tasksStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { CheckCircleIcon, TrashIcon } from '@heroicons/react/24/outline';

interface TaskCardProps {
  task: Task;
}

const WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function TaskCard({ task }: TaskCardProps) {
  const updateTask = useTasksStore((s) => s.updateTask);
  const deleteTask = useTasksStore((s) => s.deleteTask);
  const planMode = useSettingsStore((s) => s.planMode);
  const [showActions, setShowActions] = useState(false);

  const handleToggleDone = async () => {
    await updateTask(task.id, {
      status: task.status === 'done' ? 'todo' : 'done',
    });
  };

  const handleDelete = async () => {
    if (confirm('Delete this task?')) {
      await deleteTask(task.id);
    }
  };

  // Calculate display day
  let displayDay = '';
  if (planMode === 'weekly' && task.weeklyDay !== null && task.weeklyDay !== undefined) {
    displayDay = WEEKDAY_SHORT[task.weeklyDay];
  } else if (planMode === 'monthly' && task.plannedDateActual) {
    const date = parse(task.plannedDateActual, 'yyyy-MM-dd', new Date());
    const day = format(date, 'd');
    const weekday = WEEKDAY_SHORT[date.getDay()];
    displayDay = `${day} ${weekday}`;
  }

  return (
    <div
      className={`group flex items-center gap-4 py-3 px-4 hover:bg-white/20 dark:hover:bg-white/5 rounded-xl transition-all duration-200 ${
        task.status === 'done' ? 'opacity-40' : ''
      }`}
      onTouchStart={() => setShowActions(true)}
      onTouchEnd={() => setTimeout(() => setShowActions(false), 2000)}
    >
      {/* Checkbox */}
      <button
        onClick={handleToggleDone}
        className={`flex-shrink-0 transition-colors duration-200 ${
          task.status === 'done' ? 'text-emerald-500' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
        }`}
      >
        <CheckCircleIcon className="w-5 h-5" />
      </button>

      {/* Day column */}
      {displayDay && (
        <div className="w-16 flex-shrink-0 text-xs font-light text-slate-500 dark:text-slate-400">
          {displayDay}
        </div>
      )}

      {/* Title */}
      <div className="flex-1 min-w-0">
        <span className={`font-light text-slate-900 dark:text-white ${task.status === 'done' ? 'line-through' : ''}`}>
          {task.title}
        </span>
      </div>

      {/* Inline tags */}
      <div className="flex items-center gap-3 text-xs font-light">
        {task.desire && (
          <span className="text-blue-600 dark:text-blue-400">{task.desire}</span>
        )}
        {task.difficultyTshirt && (
          <span className="text-purple-600 dark:text-purple-400">{task.difficultyTshirt}</span>
        )}
        {task.carryOverCount > 0 && (
          <span className="text-orange-600 dark:text-orange-400">↻{task.carryOverCount}</span>
        )}
      </div>

      {/* Delete button */}
      {showActions && (
        <button
          onClick={handleDelete}
          className="flex-shrink-0 text-red-500 hover:text-red-600 transition-colors"
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
