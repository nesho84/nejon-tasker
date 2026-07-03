import * as TasksRepo from '@/db/task.repo';
import { cancelScheduledNotification } from '@/services/notificationsService';
import { Task } from '@/types/task.types';
import uuid from "react-native-uuid";
import { create } from 'zustand';

interface TaskState {
    allTasks: Task[];
    isLoading: boolean;

    loadTasks: () => Promise<void>;
    getTaskById: (id: string) => Task | undefined;
    createTask: (data: Partial<Task>) => Promise<string>;
    updateTask: (id: string, data: Partial<Task>) => Promise<void>;
    softDeleteTask: (id: string) => Promise<void>;
    hardDeleteTask: (id: string) => Promise<void>;
    restoreTask: (id: string) => Promise<void>;
    toggleTask: (id: string) => Promise<void>;
    toggleFavoriteTask: (id: string) => Promise<void>;
    reorderTasks: (taskIds: string[]) => Promise<void>;
    removeTasksByLabelId: (labelId: string) => Promise<void>;
}

export const useTaskStore = create<TaskState>((set, get) => ({
    // Initial state
    allTasks: [],
    isLoading: false,

    // ------------------------------------------------------------
    // LOAD - Called once at app startup
    // ------------------------------------------------------------
    loadTasks: async () => {
        try {
            set({ isLoading: true });
            const tasks = await TasksRepo.loadAllTasks();
            set({ allTasks: tasks });
        } catch (error) {
            console.error('Failed to load tasks:', error);
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },

    // ------------------------------------------------------------
    // Internal helper to get task by ID
    // ------------------------------------------------------------
    getTaskById: (id) => {
        return get().allTasks.find(t => t.id === id);
    },

    // ------------------------------------------------------------
    // CREATE
    // ------------------------------------------------------------
    createTask: async (data) => {
        if (!data.labelId) {
            throw new Error("Task must have a labelId");
        }

        if (!data.text?.trim()) {
            throw new Error("Task text cannot be empty");
        }

        try {
            const id = uuid.v4() as string;
            const now = new Date().toISOString();

            // Calculate next order position (highest to show first)
            const labelTasks = get().allTasks.filter(t => t.labelId === data.labelId && !t.isDeleted);
            const maxOrder = labelTasks.length > 0
                ? Math.max(...labelTasks.map(t => t.order_position))
                : -1;

            const newTask: Task = {
                id: id,
                labelId: data.labelId,
                text: data.text,
                date: now,
                checked: false,
                order_position: maxOrder + 1,
                reminderDateTime: data.reminderDateTime || null,
                reminderId: null,
                isFavorite: false,
                isDeleted: false,
                deletedAt: null,
                createdAt: now,
                updatedAt: now,
            };

            // Update state
            set((state) => ({ allTasks: [newTask, ...state.allTasks] }));

            // Persist to database
            await TasksRepo.insertTask(newTask);

            return id;
        } catch (error) {
            console.error('Failed to create task:', error);
            throw error;
        }
    },

    // ------------------------------------------------------------
    // UPDATE
    // ------------------------------------------------------------
    updateTask: async (id, data) => {
        const task = get().getTaskById(id);
        if (!task) throw new Error(`Task not found: ${id}`);
        const previousTask = { ...task };

        try {
            const now = new Date().toISOString();
            const updatedTask = { ...task, ...data, updatedAt: now };

            // Update state
            set((state) => ({
                allTasks: state.allTasks.map(t => t.id === id ? updatedTask : t)
            }));

            // Persist to database
            await TasksRepo.updateTask(updatedTask);
        } catch (error) {
            // Rollback on failure
            set(state => ({ allTasks: state.allTasks.map(t => t.id === id ? previousTask : t) }));
            console.error('Failed to update task:', error);
            throw error;
        }
    },

    // ------------------------------------------------------------
    // SOFT DELETE
    // ------------------------------------------------------------
    softDeleteTask: async (id) => {
        const task = get().getTaskById(id);
        if (!task) throw new Error(`Task not found: ${id}`);
        const previousTask = { ...task };

        try {
            // Cancel any scheduled reminder — a deleted task shouldn't still notify
            if (task.reminderId) {
                await cancelScheduledNotification(task.reminderId);
            }

            const now = new Date().toISOString();
            const updatedTask = {
                ...task,
                isDeleted: true,
                deletedAt: now,
                updatedAt: now,
                reminderDateTime: null,
                reminderId: null,
            };

            // Update state
            set((state) => ({ allTasks: state.allTasks.map(t => t.id === id ? updatedTask : t) }));

            // Persist to database
            await TasksRepo.updateTask(updatedTask);
        } catch (error) {
            // Rollback on failure
            set(state => ({ allTasks: state.allTasks.map(t => t.id === id ? previousTask : t) }));
            console.error('Failed to delete task:', error);
            throw error;
        }
    },

    // ------------------------------------------------------------
    // HARD DELETE
    // ------------------------------------------------------------
    hardDeleteTask: async (id) => {
        const task = get().getTaskById(id);
        if (!task) throw new Error(`Task not found: ${id}`);
        const previousTask = { ...task };

        try {
            // Cancel any scheduled reminder before the row disappears entirely
            if (task.reminderId) {
                await cancelScheduledNotification(task.reminderId);
            }

            // Update state
            set((state) => ({ allTasks: state.allTasks.filter(t => t.id !== id) }));

            // Persist to database
            await TasksRepo.deleteTask(id);
        } catch (error) {
            // Rollback on failure
            set(state => ({ allTasks: [...state.allTasks, previousTask] }));
            console.error('Failed to permanently delete task:', error);
            throw error;
        }
    },

    // ------------------------------------------------------------
    // RESTORE
    // ------------------------------------------------------------
    restoreTask: async (id) => {
        const task = get().getTaskById(id);
        if (!task) throw new Error(`Task not found: ${id}`);
        const previousTask = { ...task };

        try {
            const now = new Date().toISOString();
            const updatedTask = { ...task, isDeleted: false, deletedAt: null, updatedAt: now };

            // Update state
            set((state) => ({ allTasks: state.allTasks.map(t => t.id === id ? updatedTask : t) }));

            // Persist to database
            await TasksRepo.updateTask(updatedTask);
        } catch (error) {
            // Rollback on failure
            set(state => ({ allTasks: state.allTasks.map(t => t.id === id ? previousTask : t) }));
            console.error('Failed to restore task:', error);
            throw error;
        }
    },

    // ------------------------------------------------------------
    // TOGGLE CHECKED
    // ------------------------------------------------------------
    toggleTask: async (id) => {
        const task = get().getTaskById(id);
        if (!task) throw new Error(`Task not found: ${id}`);
        const previousTask = { ...task };

        try {
            const now = new Date().toISOString();
            const updatedTask = { ...task, checked: !task.checked, updatedAt: now };

            // Update state
            set(state => ({ allTasks: state.allTasks.map(t => t.id === id ? updatedTask : t) }));

            // Persist to database
            await TasksRepo.updateTask(updatedTask);
        } catch (error) {
            // Rollback on failure
            set(state => ({ allTasks: state.allTasks.map(t => t.id === id ? previousTask : t) }));
            console.error('Failed to toggle task:', error);
            throw error;
        }
    },

    // ------------------------------------------------------------
    // TOGGLE FAVORITE
    // ------------------------------------------------------------
    toggleFavoriteTask: async (id) => {
        const task = get().getTaskById(id);
        if (!task) throw new Error(`Task not found: ${id}`);
        const previousTask = { ...task };

        try {
            const now = new Date().toISOString();
            const updatedTask = { ...task, isFavorite: !task.isFavorite, updatedAt: now };

            // Update state
            set((state) => ({
                allTasks: state.allTasks.map(t => t.id === id ? updatedTask : t)
            }));

            // Persist to database
            await TasksRepo.updateTask(updatedTask);
        } catch (error) {
            // Rollback on failure
            set(state => ({ allTasks: state.allTasks.map(t => t.id === id ? previousTask : t) }));
            console.error('Failed to toggle favorite:', error);
            throw error;
        }
    },

    // ------------------------------------------------------------
    // REORDER (drag and drop)
    // ------------------------------------------------------------
    reorderTasks: async (taskIds) => {
        const previousTasks = [...get().allTasks];

        try {
            const now = new Date().toISOString();

            // Reverse taskIds because we store DESC in DB
            // Visual order [B,A,C] needs B=highest position to show first
            const reversedIds = [...taskIds].reverse();

            // Update state
            set((state) => ({
                allTasks: state.allTasks
                    .map(task => {
                        const newIndex = reversedIds.indexOf(task.id);
                        if (newIndex !== -1) {
                            return { ...task, order_position: newIndex, updatedAt: now };
                        }
                        return task;
                    })
                    .sort((a, b) => b.order_position - a.order_position) // ← SORT!
            }));

            // Persist to database (batch transaction)
            await TasksRepo.reorderTasks(reversedIds);
        } catch (error) {
            // Rollback
            set({ allTasks: previousTasks });
            console.error('Failed to reorder tasks:', error);
            throw error;
        }
    },

    // ------------------------------------------------------------
    // Drop all tasks under a label from the in-memory store, cancelling their
    // reminders first. Used when a label is deleted — SQLite cascade-deletes
    // the task rows via FK, but that doesn't touch the OS notifications or
    // this store's cache, so the caller (labelStore) does both here.
    // ------------------------------------------------------------
    removeTasksByLabelId: async (labelId) => {
        const tasksToRemove = get().allTasks.filter(t => t.labelId === labelId);

        for (const task of tasksToRemove) {
            if (task.reminderId) {
                await cancelScheduledNotification(task.reminderId);
            }
        }

        set((state) => ({ allTasks: state.allTasks.filter(t => t.labelId !== labelId) }));
    },
}));