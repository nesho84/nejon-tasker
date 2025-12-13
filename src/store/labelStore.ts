import * as LabelsRepo from '@/db/label.repo';
import { Label } from '@/types/label.types';
import uuid from "react-native-uuid";
import { create } from 'zustand';
import { useTaskStore } from './taskStore';

interface LabelState {
    labels: Label[];
    isLoading: boolean;

    loadLabels: () => Promise<void>;
    createLabel: (data: Partial<Label>) => Promise<string>;
    updateLabel: (id: string, data: Partial<Label>) => Promise<void>;
    deleteLabel: (id: string) => Promise<void>;
    reorderLabels: (labelIds: string[]) => Promise<void>;
}

export const useLabelStore = create<LabelState>((set, get) => ({
    // Initial state
    labels: [],
    isLoading: false,

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

            // Calculate next order position
            const maxOrder = get().labels.length > 0
                ? Math.max(...get().labels.map(l => l.order_position))
                : -1;

            const newLabel: Label = {
                id: id,
                title: data.title,
                color: data.color || "#000000",
                category: data.category || null,
                order_position: maxOrder + 1,
                isFavorite: false,
                isDeleted: false,
                deletedAt: null,
                createdAt: now,
                updatedAt: now,
            };

            // Update state
            set(state => ({ labels: [...state.labels, newLabel] }));

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
    // DELETE (with validation)
    // ------------------------------------------------------------
    deleteLabel: async (id) => {
        const label = get().labels.find(l => l.id === id);
        if (!label) throw new Error(`Label not found: ${id}`);
        const previousLabel = { ...label };

        // Check if label has active tasks
        const taskStore = useTaskStore.getState();
        const activeTasks = taskStore.allTasks.filter(t => t.labelId === id && !t.isDeleted);

        if (activeTasks.length > 0) {
            throw new Error(`Cannot delete label. It has ${activeTasks.length} active task(s).`);
        }

        try {
            // Update state
            set(state => ({ labels: state.labels.filter(l => l.id !== id) }));

            // Persist (will cascade delete any deleted tasks via FK)
            await LabelsRepo.deleteLabel(id);
        } catch (error) {
            // Rollback on failure
            set(state => ({ labels: [...state.labels, previousLabel] }));
            console.error('Failed to delete label:', error);
            throw error;
        }
    },

    // Reorder labels
    reorderLabels: async (labelIds) => {
        const previousLabels = [...get().labels];

        try {
            const now = new Date().toISOString();

            // Update state
            set(state => ({
                labels: state.labels
                    .map(label => {
                        const newIndex = labelIds.indexOf(label.id);
                        if (newIndex !== -1) {
                            return { ...label, order_position: newIndex, updatedAt: now };
                        }
                        return label;
                    })
                    .sort((a, b) => a.order_position - b.order_position)
            }));

            // Persist to database (batch transaction)
            await LabelsRepo.reorderLabels(labelIds);
        } catch (error) {
            // Rollback
            set({ labels: previousLabels });
            console.error('Failed to reorder labels:', error);
            throw error;
        }
    },
}));



