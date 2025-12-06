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
    reloadLabels: () => void;
    createLabel: (data: { title: string; color: string; category?: string | null }) => void;
    updateLabel: (id: string, data: { title?: string; color?: string; category?: string | null }) => void;
    deleteLabel: (id: string) => void;
    restoreLabel: (id: string) => void;
    deleteLabelPermanently: (id: string) => void;
    toggleFavorite: (id: string) => void;
    reorderLabels: (labelIds: string[]) => void;
}

export const useLabelStore = create<LabelState>((set, get) => ({
    // Initial state
    labels: [],
    favoriteLabels: [],
    deletedLabels: [],
    isLoading: false,

    // Load labels from database
    reloadLabels: () => {
        try {
            set({ isLoading: true });

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
    createLabel: (data) => {
        try {
            LabelsRepo.createLabel(data);
            get().reloadLabels();
        } catch (error) {
            console.error('Failed to create label:', error);
            throw error;
        }
    },

    // Update an existing label
    updateLabel: (id, data) => {
        try {
            LabelsRepo.updateLabel(id, data);
            get().reloadLabels();
        } catch (error) {
            console.error('Failed to update label:', error);
            throw error;
        }
    },

    // Soft delete a label
    deleteLabel: (id) => {
        try {
            LabelsRepo.deleteLabel(id);
            get().reloadLabels();
        } catch (error) {
            console.error('Failed to delete label:', error);
            throw error;
        }
    },

    // Restore a deleted label
    restoreLabel: (id) => {
        try {
            LabelsRepo.restoreLabel(id);
            get().reloadLabels();
        } catch (error) {
            console.error('Failed to restore label:', error);
            throw error;
        }
    },

    // Permanently delete a label
    deleteLabelPermanently: (id) => {
        try {
            LabelsRepo.deleteLabelPermanently(id);
            get().reloadLabels();
        } catch (error) {
            console.error('Failed to permanently delete label:', error);
            throw error;
        }
    },

    // Toggle favorite status
    toggleFavorite: (id) => {
        try {
            LabelsRepo.toggleLabelFavorite(id);
            get().reloadLabels();
        } catch (error) {
            console.error('Failed to toggle favorite:', error);
            throw error;
        }
    },

    // Reorder labels
    reorderLabels: (labelIds) => {
        try {
            LabelsRepo.reorderLabels(labelIds);
            get().reloadLabels();
        } catch (error) {
            console.error('Failed to reorder labels:', error);
            throw error;
        }
    },
}));

// Initialize the store by loading labels from SQLite
useLabelStore.getState().reloadLabels();



