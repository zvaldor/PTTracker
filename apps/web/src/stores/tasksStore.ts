import { create } from 'zustand';
import type { Task, CreateTaskDto, UpdateTaskDto } from '@pt/shared';
import { db, LocalTask } from '@/lib/db';
import { api } from '@/lib/api';

interface TasksState {
  tasks: Task[];
  loading: boolean;
  error: string | null;

  loadTasks: () => Promise<void>;
  createTask: (task: CreateTaskDto) => Promise<void>;
  updateTask: (id: string, task: UpdateTaskDto) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  sync: () => Promise<void>;
}

export const useTasksStore = create<TasksState>((set, get) => ({
  tasks: [],
  loading: false,
  error: null,

  loadTasks: async () => {
    try {
      set({ loading: true, error: null });
      const tasks = await db.tasks.where('_deleted').notEqual(1).toArray();
      set({ tasks: tasks as Task[], loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  createTask: async (taskDto) => {
    try {
      const newTask: LocalTask = {
        id: crypto.randomUUID(),
        userId: 'local',
        ...taskDto,
        status: 'todo',
        isRecurring: taskDto.isRecurring || false,
        carryOverCount: 0,
        orderRank: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        _dirty: true,
      } as LocalTask;

      await db.tasks.add(newTask);
      await get().loadTasks();

      // Try to sync
      get().sync().catch(console.error);
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  updateTask: async (id, taskDto) => {
    try {
      await db.tasks.update(id, {
        ...taskDto,
        updatedAt: new Date(),
        _dirty: true,
      });
      await get().loadTasks();

      // Try to sync
      get().sync().catch(console.error);
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  deleteTask: async (id) => {
    try {
      await db.tasks.update(id, {
        _deleted: true,
        _dirty: true,
      });
      await get().loadTasks();

      // Try to sync
      get().sync().catch(console.error);
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  sync: async () => {
    try {
      const dirtyTasks = await db.tasks.where('_dirty').equals(1).toArray();
      const lastSyncAt = (await db.meta.get('lastSyncAt'))?.value;

      const response: any = await api.sync({
        tasks: dirtyTasks,
        lastSyncAt,
      });

      // Update local database
      await db.transaction('rw', db.tasks, db.meta, async () => {
        // Clear dirty flags
        for (const task of dirtyTasks) {
          if (!task._deleted) {
            await db.tasks.update(task.id, { _dirty: false });
          }
        }

        // Delete tasks
        for (const id of response.deleted) {
          await db.tasks.delete(id);
        }

        // Update/add server tasks
        for (const task of response.tasks) {
          await db.tasks.put({ ...task, _dirty: false });
        }

        // Update last sync time
        await db.meta.put({ key: 'lastSyncAt', value: response.lastSyncAt });
      });

      await get().loadTasks();
    } catch (error) {
      console.error('Sync failed:', error);
    }
  },
}));
