'use client';

import { useState } from 'react';
import type { Task } from '@pt/shared';
import { useTasksStore } from '@/stores/tasksStore';
import { CheckCircleIcon, TrashIcon } from '@heroicons/react/24/outline';

interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  const updateTask = useTasksStore((s) => s.updateTask);
  const deleteTask = useTasksStore((s) => s.deleteTask);
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

  return (
    <div
      className={`group backdrop-blur-xl bg-white/40 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-2xl p-4 hover:bg-white/60 dark:hover:bg-white/10 transition-all duration-300 ${
        task.status === 'done' ? 'opacity-50' : ''
      }`}
      onTouchStart={() => setShowActions(true)}
      onTouchEnd={() => setTimeout(() => setShowActions(false), 2000)}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={handleToggleDone}
          className={`mt-0.5 transition-colors duration-200 ${
            task.status === 'done' ? 'text-emerald-500' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <CheckCircleIcon className="w-5 h-5" />
        </button>

        <div className="flex-1 min-w-0">
          <h3 className={`font-light text-slate-900 dark:text-white ${task.status === 'done' ? 'line-through' : ''}`}>
            {task.title}
          </h3>
          {task.description && (
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 font-light">
              {task.description}
            </p>
          )}
          <div className="flex gap-2 mt-2 flex-wrap">
            {task.desire && (
              <span className="text-xs px-2 py-1 backdrop-blur-sm bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg font-light border border-blue-500/20">
                {task.desire}
              </span>
            )}
            {task.difficultyTshirt && (
              <span className="text-xs px-2 py-1 backdrop-blur-sm bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-lg font-light border border-purple-500/20">
                {task.difficultyTshirt}
              </span>
            )}
            {task.carryOverCount > 0 && (
              <span className="text-xs px-2 py-1 backdrop-blur-sm bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-lg font-light border border-orange-500/20">
                Moved {task.carryOverCount}x
              </span>
            )}
          </div>
        </div>

        {showActions && (
          <button
            onClick={handleDelete}
            className="text-red-500 hover:text-red-600 transition-colors"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}
