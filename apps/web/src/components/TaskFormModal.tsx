'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import type { CreateTaskDto, DifficultyTshirt, Desire } from '@pt/shared';
import { useTasksStore } from '@/stores/tasksStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useTranslation } from '@/lib/i18n';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function TaskFormModal({ isOpen, onClose }: TaskFormModalProps) {
  const createTask = useTasksStore((s) => s.createTask);
  const locale = useSettingsStore((s) => s.locale);
  const visibleTags = useSettingsStore((s) => s.visibleTags);
  const { t } = useTranslation(locale);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState<DifficultyTshirt | undefined>(undefined);
  const [desire, setDesire] = useState<Desire | undefined>(undefined);
  const [weekday, setWeekday] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setTitle('');
      setDescription('');
      setDifficulty(undefined);
      setDesire(undefined);
      setWeekday(undefined);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const taskData: CreateTaskDto = {
        title,
        description: description || undefined,
      };

      // Only add optional fields if they are set
      if (weekday !== undefined) {
        const today = new Date();
        const selectedDate = new Date(today);
        selectedDate.setDate(today.getDate() + ((weekday - today.getDay() + 7) % 7));

        taskData.weeklyDay = weekday;
        taskData.plannedDateActual = format(selectedDate, 'yyyy-MM-dd');
      }

      if (difficulty) {
        taskData.difficultyTshirt = difficulty;
      }

      if (desire) {
        taskData.desire = desire;
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center sm:justify-center">
      <div className="backdrop-blur-xl bg-white/90 dark:bg-slate-900/90 border border-white/20 dark:border-white/10 w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-white/20 dark:border-white/10 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-light text-slate-900 dark:text-white">{t('createTask')}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 dark:hover:bg-white/10 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-slate-700 dark:text-slate-300" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-light mb-2 text-slate-700 dark:text-slate-300">{t('title')}</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 backdrop-blur-xl bg-white/60 dark:bg-white/5 border border-white/30 dark:border-white/10 rounded-xl font-light text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              required
              autoFocus
              placeholder="Enter task title..."
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-light mb-2 text-slate-700 dark:text-slate-300">{t('description')}</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 backdrop-blur-xl bg-white/60 dark:bg-white/5 border border-white/30 dark:border-white/10 rounded-xl font-light text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
              placeholder="Add description (optional)..."
            />
          </div>

          {/* Weekday - only if visible */}
          {visibleTags.weekday && (
            <div>
              <label className="block text-sm font-light mb-2 text-slate-700 dark:text-slate-300">
                Day of Week <span className="text-slate-400">(optional)</span>
              </label>
              <div className="grid grid-cols-7 gap-2">
                {WEEKDAY_SHORT.map((day, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setWeekday(weekday === index ? undefined : index)}
                    className={`py-2 px-2 rounded-lg text-xs font-light transition-all ${
                      weekday === index
                        ? 'bg-white/60 dark:bg-white/10 text-slate-900 dark:text-white shadow-sm border border-white/30'
                        : 'bg-white/20 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-white/30 dark:hover:bg-white/10'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Difficulty - only if visible */}
          {visibleTags.difficulty && (
            <div>
              <label className="block text-sm font-light mb-2 text-slate-700 dark:text-slate-300">
                {t('difficulty')} <span className="text-slate-400">(optional)</span>
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['S', 'M', 'L', 'XL'] as DifficultyTshirt[]).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDifficulty(difficulty === d ? undefined : d)}
                    className={`py-3 px-4 rounded-xl font-light transition-all ${
                      difficulty === d
                        ? 'bg-purple-500/30 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/30 shadow-sm'
                        : 'bg-white/20 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-white/30 dark:hover:bg-white/10'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Desire - only if visible */}
          {visibleTags.desire && (
            <div>
              <label className="block text-sm font-light mb-2 text-slate-700 dark:text-slate-300">
                {t('desire')} <span className="text-slate-400">(optional)</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['low', 'med', 'high'] as Desire[]).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDesire(desire === d ? undefined : d)}
                    className={`py-3 px-4 rounded-xl capitalize font-light transition-all ${
                      desire === d
                        ? 'bg-blue-500/30 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-500/30 shadow-sm'
                        : 'bg-white/20 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-white/30 dark:hover:bg-white/10'
                    }`}
                  >
                    {t(d)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 backdrop-blur-xl bg-white/20 dark:bg-white/5 hover:bg-white/30 dark:hover:bg-white/10 border border-white/20 dark:border-white/10 rounded-xl font-light text-slate-700 dark:text-slate-300 transition-all"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={loading || !title}
              className="flex-1 py-3 px-4 backdrop-blur-xl bg-blue-500/30 hover:bg-blue-500/40 border border-blue-500/30 text-blue-700 dark:text-blue-300 rounded-xl font-light transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {loading ? t('loading') : t('save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
