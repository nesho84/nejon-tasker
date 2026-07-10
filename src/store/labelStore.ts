import * as LabelsRepo from '@/db/label.repo';
import { kvStorage } from '@/store/storage';
import { useTaskStore } from '@/store/taskStore';
import { Label } from '@/types/label.types';
import uuid from "react-native-uuid";
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface LabelState {
    labels: Label[];
    isLoading: boolean;
    recentLabelIds: string[];
    isReady: boolean;

    loadLabels: () => Promise<void>;
    createLabel: (data: Partial<Label>) => Promise<string>;
    updateLabel: (id: string, data: Partial<Label>) => Promise<void>;
    deleteLabel: (id: string) => Promise<void>;
    reorderLabels: (labelIds: string[]) => Promise<void>;
    markLabelUsed: (labelId: string) => void;
}

export const useLabelStore = create<LabelState>()(persist((set, get) => ({
    // Initial state
    labels: [],
    isLoading: false,
    recentLabelIds: [],
    isReady: false,

    // ------------------------------------------------------------
    // LOAD - Called once at app startup
    // ------------------------------------------------------------
    loadLabels: async () => {
        try {
            set({ isLoading: true });
            const labels = await LabelsRepo.loadAllLabels();
            set({ labels: labels });
        } catch (error) {
            console.error('Failed to load labels:', error);
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },

    // ------------------------------------------------------------
    // CREATE
    // ------------------------------------------------------------
    createLabel: async (data) => {
        if (!data.title?.trim()) {
            throw new Error("Label title cannot be empty");
        }

        try {
            const id = uuid.v4() as string;
            const now = new Date().toISOString();

            // Calculate next order position (highest to show first)
            const maxOrder = get().labels.length > 0
                ? Math.max(...get().labels.map(l => l.order_position))
                : -1;

            const newLabel: Label = {
                id: id,
                title: data.title,
                color: data.color || "#AD1457",
                category: data.category || null,
                order_position: maxOrder + 1,
                isFavorite: false,
                isDeleted: false,
                deletedAt: null,
                createdAt: now,
                updatedAt: now,
            };

            // Update state
            set(state => ({ labels: [newLabel, ...state.labels] }));

            // A just-created label counts as used, so it shows in the drawer immediately
            get().markLabelUsed(id);

            // Persist to database
            await LabelsRepo.insertLabel(newLabel);

            return id;
        } catch (error) {
            console.error('Failed to create label:', error);
            throw error;
        }
    },

    // ------------------------------------------------------------
    // UPDATE
    // ------------------------------------------------------------
    updateLabel: async (id, data) => {
        const label = get().labels.find(l => l.id === id);
        if (!label) throw new Error(`Label not found: ${id}`);
        const previousLabel = { ...label };

        try {
            const now = new Date().toISOString();
            const updatedLabel = { ...label, ...data, updatedAt: now };

            // Update state
            set(state => ({
                labels: state.labels.map(l => l.id === id ? updatedLabel : l)
            }));

            // Persist to database
            await LabelsRepo.updateLabel(updatedLabel);
        } catch (error) {
            // Rollback on failure
            set(state => ({ labels: state.labels.map(l => l.id === id ? previousLabel : l) }));
            console.error('Failed to update label:', error);
            throw error;
        }
    },

    // ------------------------------------------------------------
    // DELETE
    // ------------------------------------------------------------
    deleteLabel: async (id) => {
        const label = get().labels.find(l => l.id === id);
        if (!label) throw new Error(`Label not found: ${id}`);
        const previousLabel = { ...label };
        const previousTasks = useTaskStore.getState().allTasks;

        try {
            set(state => ({ labels: state.labels.filter(l => l.id !== id) }));

            // SQLite cascade-deletes this label's tasks via FK ON DELETE CASCADE —
            // cancel their reminders and drop them from the task store too, or
            // they'd go stale and any pending notification would still fire.
            await useTaskStore.getState().removeTasksByLabelId(id);

            await LabelsRepo.deleteLabel(id);

            // Drop the deleted id from the recent-labels list
            set(state => ({ recentLabelIds: state.recentLabelIds.filter(recentId => recentId !== id) }));
        } catch (error) {
            set(state => ({ labels: [...state.labels, previousLabel] }));
            useTaskStore.setState({ allTasks: previousTasks });
            console.error('Failed to delete label:', error);
            throw error;
        }
    },

    // Reorder labels
    reorderLabels: async (labelIds) => {
        const previousLabels = [...get().labels];

        try {
            const now = new Date().toISOString();

            // Reverse labelIds because we store DESC in DB
            // Visual order [B,A,C] needs B=highest position to show first
            const reversedIds = [...labelIds].reverse();

            // Update state
            set(state => ({
                labels: state.labels
                    .map(label => {
                        const newIndex = reversedIds.indexOf(label.id);
                        if (newIndex !== -1) {
                            return { ...label, order_position: newIndex, updatedAt: now };
                        }
                        return label;
                    })
                    .sort((a, b) => b.order_position - a.order_position)
            }));

            // Persist to database (batch transaction)
            await LabelsRepo.reorderLabels(reversedIds);
        } catch (error) {
            // Rollback
            set({ labels: previousLabels });
            console.error('Failed to reorder labels:', error);
            throw error;
        }
    },

    // RECENT LABELS - Move id to front, dedupe (drawer shows these first)
    markLabelUsed: (labelId) => {
        const recentIds = get().recentLabelIds;
        set({ recentLabelIds: [labelId, ...recentIds.filter(id => id !== labelId)] });
    },

}), {
    name: 'label-storage',
    storage: createJSONStorage(() => kvStorage),
    partialize: (state) => ({ recentLabelIds: state.recentLabelIds }),
    onRehydrateStorage: () => (state) => {
        if (state) {
            state.isReady = true;
        }
    },
}));
