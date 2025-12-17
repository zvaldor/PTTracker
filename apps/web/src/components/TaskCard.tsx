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
      className={`bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 ${
        task.status === 'done' ? 'opacity-60' : ''
      }`}
      onTouchStart={() => setShowActions(true)}
      onTouchEnd={() => setTimeout(() => setShowActions(false), 2000)}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={handleToggleDone}
          className={`mt-1 ${
            task.status === 'done' ? 'text-green-500' : 'text-gray-400'
          }`}
        >
          <CheckCircleIcon className="w-6 h-6" />
        </button>

        <div className="flex-1 min-w-0">
          <h3 className={`font-medium ${task.status === 'done' ? 'line-through' : ''}`}>
            {task.title}
          </h3>
          {task.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {task.description}
            </p>
          )}
          <div className="flex gap-2 mt-2 flex-wrap">
            {task.desire && (
              <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                {task.desire}
              </span>
            )}
            {task.difficultyTshirt && (
              <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded">
                {task.difficultyTshirt}
              </span>
            )}
            {task.carryOverCount > 0 && (
              <span className="text-xs px-2 py-1 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded">
                Moved {task.carryOverCount}x
              </span>
            )}
          </div>
        </div>

        {showActions && (
          <button
            onClick={handleDelete}
            className="text-red-500 hover:text-red-600"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}
