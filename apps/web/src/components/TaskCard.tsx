'use client';

import { useState, useRef, useEffect } from 'react';
import { format, parse } from 'date-fns';
import type { Task, DifficultyTshirt, Desire } from '@pt/shared';
import { useTasksStore } from '@/stores/tasksStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { CheckCircleIcon, TrashIcon } from '@heroicons/react/24/outline';

interface TaskCardProps {
  task: Task;
}

const WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const WEEKDAY_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function TaskCard({ task }: TaskCardProps) {
  const updateTask = useTasksStore((s) => s.updateTask);
  const deleteTask = useTasksStore((s) => s.deleteTask);
  const planMode = useSettingsStore((s) => s.planMode);
  const visibleTags = useSettingsStore((s) => s.visibleTags);
  const [showActions, setShowActions] = useState(false);
  const [showWeekdayPicker, setShowWeekdayPicker] = useState(false);
  const [showDesirePicker, setShowDesirePicker] = useState(false);
  const [showDifficultyPicker, setShowDifficultyPicker] = useState(false);

  const weekdayRef = useRef<HTMLButtonElement>(null);
  const desireRef = useRef<HTMLButtonElement>(null);
  const difficultyRef = useRef<HTMLButtonElement>(null);
  const weekdayPickerRef = useRef<HTMLDivElement>(null);
  const desirePickerRef = useRef<HTMLDivElement>(null);
  const difficultyPickerRef = useRef<HTMLDivElement>(null);

  // Close pickers when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (showWeekdayPicker && weekdayPickerRef.current && !weekdayPickerRef.current.contains(target) && !weekdayRef.current?.contains(target)) {
        setShowWeekdayPicker(false);
      }
      if (showDesirePicker && desirePickerRef.current && !desirePickerRef.current.contains(target) && !desireRef.current?.contains(target)) {
        setShowDesirePicker(false);
      }
      if (showDifficultyPicker && difficultyPickerRef.current && !difficultyPickerRef.current.contains(target) && !difficultyRef.current?.contains(target)) {
        setShowDifficultyPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside as EventListener);
    document.addEventListener('touchstart', handleClickOutside as EventListener);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside as EventListener);
      document.removeEventListener('touchstart', handleClickOutside as EventListener);
    };
  }, [showWeekdayPicker, showDesirePicker, showDifficultyPicker]);

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

  const handleSetWeekday = async (weekday: number) => {
    const today = new Date();
    today.setDate(today.getDate() + ((weekday - today.getDay() + 7) % 7));
    await updateTask(task.id, {
      weeklyDay: weekday,
      plannedDateActual: format(today, 'yyyy-MM-dd'),
    });
    setShowWeekdayPicker(false);
  };

  const handleSetMonthDay = async (day: number) => {
    const today = new Date();
    const targetDate = new Date(today.getFullYear(), today.getMonth(), day);
    const weekday = targetDate.getDay();
    await updateTask(task.id, {
      weeklyDay: weekday,
      plannedDateActual: format(targetDate, 'yyyy-MM-dd'),
    });
    setShowWeekdayPicker(false);
  };

  const handleSetDesire = async (desire: Desire) => {
    await updateTask(task.id, { desire });
    setShowDesirePicker(false);
  };

  const handleSetDifficulty = async (difficulty: DifficultyTshirt) => {
    await updateTask(task.id, { difficultyTshirt: difficulty });
    setShowDifficultyPicker(false);
  };

  // Calculate display day
  let displayDay = '';
  if (planMode === 'monthly' && task.plannedDateActual) {
    // In monthly mode, show date + weekday
    const date = parse(task.plannedDateActual, 'yyyy-MM-dd', new Date());
    const day = format(date, 'd');
    const weekday = date.getDay();
    displayDay = `${day} ${WEEKDAY_SHORT[weekday]}`;
  } else if (task.weeklyDay !== null && task.weeklyDay !== undefined) {
    // In weekly mode, show just weekday
    displayDay = WEEKDAY_SHORT[task.weeklyDay];
  }

  return (
    <>
      <div
        className={`group relative py-3 px-4 hover:bg-white/20 dark:hover:bg-white/5 rounded-xl transition-all duration-200 ${
          task.status === 'done' ? 'opacity-40' : ''
        }`}
        onTouchStart={() => setShowActions(true)}
        onTouchEnd={() => setTimeout(() => setShowActions(false), 2000)}
      >
        {/* Main row with fixed-width columns */}
        <div className="flex items-center gap-4">
          {/* Checkbox */}
          <button
            onClick={handleToggleDone}
            className={`flex-shrink-0 transition-colors duration-200 ${
              task.status === 'done' ? 'text-emerald-500' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            <CheckCircleIcon className="w-5 h-5" />
          </button>

          {/* Title and Description */}
          <div className="flex-1 min-w-0">
            <div className={`font-light text-slate-900 dark:text-white ${task.status === 'done' ? 'line-through' : ''}`}>
              {task.title}
            </div>
            {task.description && (
              <div className="text-xs font-light text-slate-500 dark:text-slate-400 mt-1">
                {task.description}
              </div>
            )}
          </div>

          {/* Fixed-width tag columns - only show visible tags */}
          <div className="flex items-center gap-1 text-xs font-light">
            {/* Weekday tag - only if visible */}
            {visibleTags.weekday && (
              task.status === 'done' ? (
                <div className="w-20 text-center text-slate-600 dark:text-slate-400">
                  {displayDay || '+day'}
                </div>
              ) : (
                <button
                  ref={weekdayRef}
                  onClick={() => setShowWeekdayPicker(!showWeekdayPicker)}
                  className="w-20 text-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  {displayDay || '+day'}
                </button>
              )
            )}

            {/* Desire tag - only if visible */}
            {visibleTags.desire && (
              task.status === 'done' ? (
                <div className="w-16 text-center text-blue-600 dark:text-blue-400">
                  {task.desire || '+desire'}
                </div>
              ) : (
                <button
                  ref={desireRef}
                  onClick={() => setShowDesirePicker(!showDesirePicker)}
                  className="w-16 text-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                >
                  {task.desire || '+desire'}
                </button>
              )
            )}

            {/* Difficulty tag - only if visible */}
            {visibleTags.difficulty && (
              task.status === 'done' ? (
                <div className="w-10 text-center text-purple-600 dark:text-purple-400">
                  {task.difficultyTshirt || '+diff'}
                </div>
              ) : (
                <button
                  ref={difficultyRef}
                  onClick={() => setShowDifficultyPicker(!showDifficultyPicker)}
                  className="w-10 text-center text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
                >
                  {task.difficultyTshirt || '+diff'}
                </button>
              )
            )}

            {/* Carryover count - only if visible */}
            {visibleTags.carryover && task.carryOverCount > 0 && (
              <div className="w-10 text-center">
                <span className="text-orange-600 dark:text-orange-400">↻{task.carryOverCount}</span>
              </div>
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
      </div>

      {/* Weekday/Date picker popup - positioned relative to button */}
      {showWeekdayPicker && weekdayRef.current && (() => {
        const rect = weekdayRef.current.getBoundingClientRect();
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        const pickerWidth = planMode === 'weekly' ? 280 : 300;
        const pickerHeight = planMode === 'weekly' ? 100 : 280;

        // Calculate position - keep picker on screen
        let left = rect.left;
        let top = rect.bottom + 8;

        // Adjust horizontal position if too close to right edge
        if (left + pickerWidth > windowWidth - 16) {
          left = windowWidth - pickerWidth - 16;
        }
        // Adjust horizontal position if too close to left edge
        if (left < 16) {
          left = 16;
        }

        // Adjust vertical position if too close to bottom edge
        if (top + pickerHeight > windowHeight - 16) {
          top = rect.top - pickerHeight - 8;
        }

        return (
          <div
            ref={weekdayPickerRef}
            className="fixed z-50 backdrop-blur-xl bg-white/90 dark:bg-slate-800/90 border border-white/20 dark:border-white/10 rounded-2xl p-3 shadow-lg"
            style={{ top: `${top}px`, left: `${left}px` }}
          >
            {planMode === 'weekly' ? (
              <div className="grid grid-cols-7 gap-2 min-w-[280px]">
                {WEEKDAY_FULL.map((day, index) => (
                  <button
                    key={index}
                    onClick={() => handleSetWeekday(index)}
                    className="px-3 py-2 text-xs font-light hover:bg-white/60 dark:hover:bg-white/10 rounded-lg transition-colors text-slate-900 dark:text-white"
                  >
                    {WEEKDAY_SHORT[index]}
                  </button>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-2">
                {/* Generate calendar for current month */}
                {(() => {
                  const today = new Date();
                  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
                  const days = [];
                  for (let i = 1; i <= daysInMonth; i++) {
                    days.push(i);
                  }
                  return days.map((day) => (
                    <button
                      key={day}
                      onClick={() => handleSetMonthDay(day)}
                      className="w-10 h-10 text-sm font-light hover:bg-white/60 dark:hover:bg-white/10 rounded-lg transition-colors text-slate-900 dark:text-white flex items-center justify-center"
                    >
                      {day}
                    </button>
                  ));
                })()}
              </div>
            )}
          </div>
        );
      })()}

      {/* Desire picker popup - positioned relative to button */}
      {showDesirePicker && desireRef.current && (() => {
        const rect = desireRef.current.getBoundingClientRect();
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        const pickerWidth = 120;
        const pickerHeight = 140;

        // Calculate position - keep picker on screen
        let left = rect.left;
        let top = rect.bottom + 8;

        // Adjust horizontal position if too close to right edge
        if (left + pickerWidth > windowWidth - 16) {
          left = windowWidth - pickerWidth - 16;
        }
        if (left < 16) {
          left = 16;
        }

        // Adjust vertical position if too close to bottom edge
        if (top + pickerHeight > windowHeight - 16) {
          top = rect.top - pickerHeight - 8;
        }

        return (
          <div
            ref={desirePickerRef}
            className="fixed z-50 backdrop-blur-xl bg-white/90 dark:bg-slate-800/90 border border-white/20 dark:border-white/10 rounded-2xl p-2 shadow-lg"
            style={{ top: `${top}px`, left: `${left}px` }}
          >
            <div className="flex flex-col gap-1 min-w-[100px]">
              {(['low', 'med', 'high'] as Desire[]).map((desire) => (
                <button
                  key={desire}
                  onClick={() => handleSetDesire(desire)}
                  className="px-4 py-2 text-xs font-light hover:bg-white/60 dark:hover:bg-white/10 rounded-lg transition-colors text-slate-900 dark:text-white text-left"
                >
                  {desire}
                </button>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Difficulty picker popup - positioned relative to button */}
      {showDifficultyPicker && difficultyRef.current && (() => {
        const rect = difficultyRef.current.getBoundingClientRect();
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        const pickerWidth = 180;
        const pickerHeight = 60;

        // Calculate position - keep picker on screen
        let left = rect.left;
        let top = rect.bottom + 8;

        // Adjust horizontal position if too close to right edge
        if (left + pickerWidth > windowWidth - 16) {
          left = windowWidth - pickerWidth - 16;
        }
        if (left < 16) {
          left = 16;
        }

        // Adjust vertical position if too close to bottom edge
        if (top + pickerHeight > windowHeight - 16) {
          top = rect.top - pickerHeight - 8;
        }

        return (
          <div
            ref={difficultyPickerRef}
            className="fixed z-50 backdrop-blur-xl bg-white/90 dark:bg-slate-800/90 border border-white/20 dark:border-white/10 rounded-2xl p-2 shadow-lg"
            style={{ top: `${top}px`, left: `${left}px` }}
          >
            <div className="flex gap-1">
              {(['S', 'M', 'L', 'XL'] as DifficultyTshirt[]).map((diff) => (
                <button
                  key={diff}
                  onClick={() => handleSetDifficulty(diff)}
                  className="px-3 py-2 text-xs font-light hover:bg-white/60 dark:hover:bg-white/10 rounded-lg transition-colors text-slate-900 dark:text-white"
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>
        );
      })()}
    </>
  );
}
