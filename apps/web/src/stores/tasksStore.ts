import { create } from 'zustand';
import type { Task, CreateTaskDto, UpdateTaskDto } from '@pt/shared';
import { db, LocalTask } from '@/lib/db';
import { api } from '@/lib/api';
import { useAuthStore } from './authStore';

interface TasksState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  lastSyncAt: Date | null;

  loadTasks: () => Promise<void>;
  createTask: (task: CreateTaskDto) => Promise<void>;
  updateTask: (id: string, task: UpdateTaskDto) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  sync: () => Promise<void>;
  migrateLocalTasks: (userId: string) => Promise<void>;
  syncIfNeeded: () => Promise<void>;
}

export const useTasksStore = create<TasksState>((set, get) => ({
  tasks: [],
  loading: false,
  error: null,
  lastSyncAt: null,

  loadTasks: async () => {
    try {
      set({ loading: true, error: null });
      const allTasks = await db.tasks.toArray();
      const tasks = allTasks.filter(t => !t._deleted);
      set({ tasks: tasks as Task[], loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  createTask: async (taskDto) => {
    try {
      const user = useAuthStore.getState().user;
      const userId = user?.id || 'local';

      const newTask: LocalTask = {
        id: crypto.randomUUID(),
        userId,
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

      // Try to sync if authenticated
      if (user) {
        get().sync().catch(console.error);
      }
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  updateTask: async (id, taskDto) => {
    try {
      console.log('updateTask in store called', { id, taskDto });

      const updateData = {
        ...taskDto,
        updatedAt: new Date(),
        _dirty: true,
      };
      console.log('updateData to be saved:', updateData);

      const updated = await db.tasks.update(id, updateData);
      console.log('db.tasks.update result (number of rows updated):', updated);

      // Read the task back to verify
      const taskAfterUpdate = await db.tasks.get(id);
      console.log('Task after update from db:', taskAfterUpdate);

      await get().loadTasks();
      console.log('loadTasks completed');

      // Check if task is in state
      const taskInState = get().tasks.find(t => t.id === id);
      console.log('Task in state after loadTasks:', taskInState);

      // Try to sync
      get().sync().catch(console.error);
    } catch (error: any) {
      console.error('updateTask error:', error);
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
      const isAuthenticated = useAuthStore.getState().isAuthenticated;
      if (!isAuthenticated) {
        return;
      }

      const user = useAuthStore.getState().user;
      const allTasks = await db.tasks.toArray();
      const dirtyTasks = allTasks.filter(t => t._dirty);
      const lastSyncAt = (await db.meta.get('lastSyncAt'))?.value;

      // Update userId for any local tasks before syncing
      const tasksToSync = dirtyTasks.map(task => ({
        ...task,
        userId: user?.id || task.userId,
      }));

      const response: any = await api.sync({
        tasks: tasksToSync,
        lastSyncAt,
      });

      // Update local database
      await db.transaction('rw', db.tasks, db.meta, async () => {
        // Delete dirty tasks that were marked as deleted
        for (const task of dirtyTasks) {
          if (task._deleted) {
            await db.tasks.delete(task.id);
          } else {
            await db.tasks.update(task.id, { _dirty: false });
          }
        }

        // Delete tasks from server
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

      set({ lastSyncAt: new Date(response.lastSyncAt) });
      await get().loadTasks();
    } catch (error) {
      console.error('Sync failed:', error);
    }
  },

  // Migrate local tasks to current user when logging in
  migrateLocalTasks: async (userId: string) => {
    try {
      const localTasks = await db.tasks.where('userId').equals('local').toArray();

      if (localTasks.length > 0) {
        await db.transaction('rw', db.tasks, async () => {
          for (const task of localTasks) {
            await db.tasks.update(task.id, {
              userId,
              _dirty: true,
            });
          }
        });

        // Trigger sync after migration
        await get().sync();
      }
    } catch (error) {
      console.error('Failed to migrate local tasks:', error);
    }
  },

  syncIfNeeded: async () => {
    const isAuthenticated = useAuthStore.getState().isAuthenticated;
    if (!isAuthenticated) return;

    const lastSync = get().lastSyncAt;
    const now = new Date();

    // Sync if never synced or last sync was more than 30 seconds ago
    if (!lastSync || (now.getTime() - lastSync.getTime()) > 30000) {
      await get().sync();
    }
  },
}));
