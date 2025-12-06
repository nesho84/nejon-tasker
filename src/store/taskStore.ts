import * as TasksRepo from '@/db/tasks.repo';
import { Task } from '@/types/task.types';
import { create } from 'zustand';

interface TaskState {
    // State
    allTasks: Task[];
    favoriteTasks: Task[];
    reminderTasks: Task[];
    deletedTasks: Task[];
    isLoading: boolean;

    // Actions
    reloadTasks: (labelId?: string) => void;
    createTask: (data: { labelId: string; text: string; reminderDateTime?: string | null }) => string;
    updateTask: (id: string, data: {
        text?: string;
        date?: string;
        checked?: boolean;
        reminderDateTime?: string | null;
        reminderId?: string | null;
        isFavorite?: boolean;
    }) => void;
    toggleTask: (id: string) => void;
    toggleFavorite: (id: string) => void;
    deleteTask: (id: string) => void;
    restoreTask: (id: string) => void;
    deleteTaskPermanently: (id: string) => void;
    reorderTasks: (taskIds: string[]) => void;
}

export const useTaskStore = create<TaskState>((set, get) => ({
    // Initial state
    allTasks: [],
    favoriteTasks: [],
    reminderTasks: [],
    deletedTasks: [],
    isLoading: false,

    // Load tasks from database
    reloadTasks: () => {
        try {
            set({ isLoading: true });

            // Get ALL tasks
            const all = TasksRepo.getTasks();

            // GLOBAL queries (for separate screens)
            const favorites = TasksRepo.getFavoriteTasks();
            const reminders = TasksRepo.getReminderTasks();
            const deleted = TasksRepo.getDeletedTasks();

            set({
                allTasks: all,
                favoriteTasks: favorites,
                reminderTasks: reminders,
                deletedTasks: deleted,
            });
        } catch (error) {
            console.error('Failed to load tasks:', error);
        } finally {
            set({ isLoading: false });
        }
    },

    // Create a new task
    createTask: (data) => {
        try {
            const id = TasksRepo.createTask(data);
            // Reload tasks
            get().reloadTasks();
            return id;
        } catch (error) {
            console.error('Failed to create task:', error);
            throw error;
        }
    },

    // Update an existing task
    updateTask: (id, data) => {
        try {
            TasksRepo.updateTask(id, data);
            // Reload tasks
            get().reloadTasks();
        } catch (error) {
            console.error('Failed to update task:', error);
            throw error;
        }
    },

    // Soft delete a task
    deleteTask: (id) => {
        try {
            TasksRepo.deleteTask(id);
            // Reload tasks
            get().reloadTasks();
        } catch (error) {
            console.error('Failed to delete task:', error);
            throw error;
        }
    },

    // @TODO: What happens if label is deleted? This shoould also restore label?
    // Restore a deleted task
    restoreTask: (id) => {
        try {
            TasksRepo.restoreTask(id);
            // Reload tasks
            get().reloadTasks();
        } catch (error) {
            console.error('Failed to restore task:', error);
            throw error;
        }
    },

    // Permanent delete a task
    deleteTaskPermanently: (id) => {
        try {
            TasksRepo.deleteTaskPermanently(id);
            // Reload tasks
            get().reloadTasks();
        } catch (error) {
            console.error('Failed to permanently delete task:', error);
            throw error;
        }
    },

    // Toggle favorite status
    toggleFavorite: (id) => {
        try {
            TasksRepo.toggleTaskFavorite(id);
            get().reloadTasks();
        } catch (error) {
            console.error('Failed to toggle favorite:', error);
            throw error;
        }
    },

    // Toggle task checked/unchecked
    toggleTask: (id) => {
        try {
            TasksRepo.toggleTask(id);
            // Reload tasks
            get().reloadTasks();
        } catch (error) {
            console.error('Failed to toggle task:', error);
            throw error;
        }
    },

    // Reorder tasks
    reorderTasks: (taskIds) => {
        try {
            TasksRepo.reorderTasks(taskIds);
            get().reloadTasks();
        } catch (error) {
            console.error('Failed to reorder tasks:', error);
            throw error;
        }
    },
}));

// Initialize the store by loading tasks on first import
useTaskStore.getState().reloadTasks();