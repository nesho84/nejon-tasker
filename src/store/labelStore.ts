import * as LabelsRepo from '@/db/labels.repo';
import { Label } from '@/types/label.types';
import { create } from 'zustand';

interface LabelState {
    // State
    labels: Label[];
    favoriteLabels: Label[];
    deletedLabels: Label[];
    isLoading: boolean;

    // Actions
    loadLabels: () => Promise<void>;
    createLabel: (data: { title: string; color: string; category?: string | null }) => Promise<void>;
    updateLabel: (id: string, data: { title?: string; color?: string; category?: string | null }) => Promise<void>;
    deleteLabel: (id: string) => Promise<void>;
    restoreLabel: (id: string) => Promise<void>;
    deleteLabelPermanently: (id: string) => Promise<void>;
    toggleFavorite: (id: string) => Promise<void>;
    reorderLabels: (labelIds: string[]) => Promise<void>;
}

export const useLabelStore = create<LabelState>((set, get) => ({
    // Initial state
    labels: [],
    favoriteLabels: [],
    deletedLabels: [],
    isLoading: false,

    // Load labels from database
    loadLabels: async () => {
        try {
            set({ isLoading: true });

            // Option A: If we have a batched repo method (RECOMMENDED)
            // const { labels, favorites, deleted } = LabelsRepo.getAllLabelData();

            // Option B: Multiple queries (current approach)
            const all = LabelsRepo.getLabels();
            const favorites = LabelsRepo.getFavoriteLabels();
            const deleted = LabelsRepo.getDeletedLabels();

            set({
                labels: all,
                favoriteLabels: favorites,
                deletedLabels: deleted,
            });
        } catch (error) {
            console.error('Failed to load labels:', error);
        } finally {
            set({ isLoading: false });
        }
    },

    // Create a new label
    createLabel: async (data) => {
        try {
            LabelsRepo.createLabel(data);
            get().loadLabels();
        } catch (error) {
            console.error('Failed to create label:', error);
            throw error;
        }
    },

    // Update an existing label
    updateLabel: async (id, data) => {
        try {
            LabelsRepo.updateLabel(id, data);
            get().loadLabels();
        } catch (error) {
            console.error('Failed to update label:', error);
            throw error;
        }
    },

    // Soft delete a label
    deleteLabel: async (id) => {
        try {
            LabelsRepo.deleteLabel(id);
            get().loadLabels();
        } catch (error) {
            console.error('Failed to delete label:', error);
            throw error;
        }
    },

    // Restore a deleted label
    restoreLabel: async (id) => {
        try {
            LabelsRepo.restoreLabel(id);
            get().loadLabels();
        } catch (error) {
            console.error('Failed to restore label:', error);
            throw error;
        }
    },

    // Permanently delete a label
    deleteLabelPermanently: async (id) => {
        try {
            LabelsRepo.deleteLabelPermanently(id);
            get().loadLabels();
        } catch (error) {
            console.error('Failed to permanently delete label:', error);
            throw error;
        }
    },

    // Toggle favorite status
    toggleFavorite: async (id) => {
        try {
            LabelsRepo.toggleLabelFavorite(id);
            get().loadLabels();
        } catch (error) {
            console.error('Failed to toggle favorite:', error);
            throw error;
        }
    },

    // Reorder labels
    reorderLabels: async (labelIds) => {
        try {
            LabelsRepo.reorderLabels(labelIds);
            get().loadLabels();
        } catch (error) {
            console.error('Failed to reorder labels:', error);
            throw error;
        }
    },
}));

// Initialize the store by loading labels from SQLite
useLabelStore.getState().loadLabels();



