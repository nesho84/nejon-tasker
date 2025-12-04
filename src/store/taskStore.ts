import * as TasksRepo from '@/db/tasks.repo';
import { useLabelStore } from '@/store/labelStore';
import { Task } from '@/types/task.types';
import { create } from 'zustand';

interface TaskState {
    // State
    tasks: Task[];
    checkedTasks: Task[];
    uncheckedTasks: Task[];
    favoriteTasks: Task[];
    tasksWithReminders: Task[];
    deletedTasks: Task[];
    currentLabelId?: string; // Track current label context
    isLoading: boolean;

    // Actions
    setLabelId: (labelId?: string) => void;
    loadTasks: (labelId?: string) => Promise<void>;
    createTask: (data: { labelId: string; text: string; reminderDateTime?: string | null }) => Promise<string>;
    updateTask: (id: string, data: {
        text?: string;
        date?: string;
        checked?: boolean;
        reminderDateTime?: string | null;
        reminderId?: string | null;
        isFavorite?: boolean;
    }) => Promise<void>;
    toggleTask: (id: string) => Promise<void>;
    toggleFavorite: (id: string) => Promise<void>;
    deleteTask: (id: string) => Promise<void>;
    restoreTask: (id: string) => Promise<void>;
    deleteTaskPermanently: (id: string) => Promise<void>;
    reorderTasks: (taskIds: string[]) => Promise<void>;
}

export const useTaskStore = create<TaskState>((set, get) => ({
    // Initial state
    tasks: [],
    checkedTasks: [],
    uncheckedTasks: [],
    favoriteTasks: [],
    tasksWithReminders: [],
    deletedTasks: [],
    isLoading: false,

    // Set the current label context
    setLabelId: (labelId?: string) => {
        set({ currentLabelId: labelId });
        // Optionally reload tasks for this label
        get().loadTasks(labelId);
    },

    // Load tasks from database
    loadTasks: async (labelId?: string) => {
        try {
            set({ isLoading: true });

            // Use provided labelId or fall back to stored currentLabelId
            const contextLabelId = labelId ?? get().currentLabelId;

            // Get tasks for label (or all if no labelId)
            const all = await TasksRepo.getTasks(contextLabelId);

            // Filter in memory for label-specific views
            const checked = all.filter((t) => t.checked);
            const unchecked = all.filter((t) => !t.checked);

            // GLOBAL queries (for separate screens)
            const favorites = await TasksRepo.getFavoriteTasks();
            const reminders = await TasksRepo.getTasksWithReminders();
            const deleted = await TasksRepo.getDeletedTasks();

            set({
                tasks: all,
                checkedTasks: checked,
                uncheckedTasks: unchecked,
                favoriteTasks: favorites,
                tasksWithReminders: reminders,
                deletedTasks: deleted,
            });
        } catch (error) {
            console.error('Failed to load tasks:', error);
        } finally {
            // For smoother UX, add slight delay
            setTimeout(() => {
                set({ isLoading: false });
            }, 500);
        }
    },

    createTask: async (data) => {
        try {
            const id = await TasksRepo.createTask(data);
            // Reload tasks with current context
            await get().loadTasks();
            // Auto-sync labels (tasks affect label counts)
            useLabelStore.getState().loadLabels();
            return id;
        } catch (error) {
            console.error('Failed to create task:', error);
            throw error;
        }
    },

    updateTask: async (id, data) => {
        try {
            await TasksRepo.updateTask(id, data);
            // Reload tasks with current context
            get().loadTasks();
            // Auto-sync labels
            useLabelStore.getState().loadLabels();
        } catch (error) {
            console.error('Failed to update task:', error);
            throw error;
        }
    },

    toggleTask: async (id) => {
        try {
            await TasksRepo.toggleTask(id);
            // Reload tasks with current context
            get().loadTasks();
            // Auto-sync labels (checked/unchecked counts changed)
            useLabelStore.getState().loadLabels();
        } catch (error) {
            console.error('Failed to toggle task:', error);
            throw error;
        }
    },

    toggleFavorite: async (id) => {
        try {
            await TasksRepo.toggleTaskFavorite(id);
            await get().loadTasks();
        } catch (error) {
            console.error('Failed to toggle favorite:', error);
            throw error;
        }
    },

    deleteTask: async (id) => {
        try {
            await TasksRepo.deleteTask(id);
            // Reload tasks with current context
            await get().loadTasks();
            // Auto-sync labels (task count decreased)
            useLabelStore.getState().loadLabels();
        } catch (error) {
            console.error('Failed to delete task:', error);
            throw error;
        }
    },

    restoreTask: async (id) => {
        try {
            await TasksRepo.restoreTask(id);
            // Reload tasks with current context
            await get().loadTasks();
            // Auto-sync labels (task count increased)
            useLabelStore.getState().loadLabels();
        } catch (error) {
            console.error('Failed to restore task:', error);
            throw error;
        }
    },

    deleteTaskPermanently: async (id) => {
        try {
            await TasksRepo.deleteTaskPermanently(id);
            // Reload tasks with current context
            await get().loadTasks();
            // Auto-sync labels
            useLabelStore.getState().loadLabels();
        } catch (error) {
            console.error('Failed to permanently delete task:', error);
            throw error;
        }
    },

    reorderTasks: async (taskIds) => {
        try {
            await TasksRepo.reorderTasks(taskIds);
            await get().loadTasks();
        } catch (error) {
            console.error('Failed to reorder tasks:', error);
            throw error;
        }
    },
}));

// Initialize the store by loading tasks on first import
useTaskStore.getState().loadTasks();