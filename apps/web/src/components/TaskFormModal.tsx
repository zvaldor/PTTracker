'use client';

import { useState, useEffect } from 'react';
import type { CreateTaskDto, DifficultyTshirt, Desire } from '@pt/shared';
import { useTasksStore } from '@/stores/tasksStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useTranslation } from '@/lib/i18n';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TaskFormModal({ isOpen, onClose }: TaskFormModalProps) {
  const createTask = useTasksStore((s) => s.createTask);
  const locale = useSettingsStore((s) => s.locale);
  const planMode = useSettingsStore((s) => s.planMode);
  const { t } = useTranslation(locale);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState<DifficultyTshirt>('M');
  const [desire, setDesire] = useState<Desire>('med');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setTitle('');
      setDescription('');
      setDifficulty('M');
      setDesire('med');
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const taskData: CreateTaskDto = {
        title,
        description,
        difficultyTshirt: difficulty,
        desire,
      };

      // Set planning based on current mode
      if (planMode === 'weekly') {
        taskData.weeklyDay = new Date().getDay();
      } else if (planMode === 'monthly') {
        taskData.monthlyDay = new Date().getDate();
      } else {
        taskData.plannedDate = new Date().toISOString().split('T')[0];
      }

      await createTask(taskData);
      onClose();
    } catch (error) {
      console.error('Failed to create task:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center sm:justify-center">
      <div className="bg-white dark:bg-gray-800 w-full sm:max-w-lg sm:rounded-t-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{t('createTask')}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">{t('title')}</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">{t('description')}</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">{t('difficulty')}</label>
            <div className="grid grid-cols-4 gap-2">
              {(['S', 'M', 'L', 'XL'] as DifficultyTshirt[]).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDifficulty(d)}
                  className={`py-2 px-4 rounded-lg ${
                    difficulty === d
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">{t('desire')}</label>
            <div className="grid grid-cols-3 gap-2">
              {(['low', 'med', 'high'] as Desire[]).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDesire(d)}
                  className={`py-2 px-4 rounded-lg capitalize ${
                    desire === d
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {t(d)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-gray-200 dark:bg-gray-700 rounded-lg font-medium"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={loading || !title}
              className="flex-1 py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium disabled:opacity-50"
            >
              {loading ? t('loading') : t('save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
