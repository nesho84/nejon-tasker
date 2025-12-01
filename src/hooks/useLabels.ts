import * as LabelsRepo from "@/db/labels.repo";
import { Label } from "@/types/label.types";
import { useEffect, useState } from "react";

export function useLabels() {
    const [labels, setLabels] = useState<Label[]>([]);
    const [favoriteLabels, setFavoriteLabels] = useState<Label[]>([]);
    const [deletedLabels, setDeletedLabels] = useState<Label[]>([]);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        setLabels(LabelsRepo.getLabels());
        setFavoriteLabels(LabelsRepo.getFavoriteLabels());
        setDeletedLabels(LabelsRepo.getDeletedLabels());
    }, [refreshKey]);

    const refresh = () => setRefreshKey(prev => prev + 1);

    return {
        labels,
        favoriteLabels,
        deletedLabels,

        createLabel: (data: { title: string; color: string; category?: string | null }) => {
            LabelsRepo.createLabel(data);
            refresh();
        },

        updateLabel: (id: string, data: { title?: string; color?: string; category?: string | null }) => {
            LabelsRepo.updateLabel(id, data);
            refresh();
        },

        deleteLabel: (id: string) => {
            LabelsRepo.deleteLabel(id);
            refresh();
        },

        restoreLabel: (id: string) => {
            LabelsRepo.restoreLabel(id);
            refresh();
        },

        deleteLabelPermanently: (id: string) => {
            LabelsRepo.deleteLabelPermanently(id);
            refresh();
        },

        toggleFavorite: (id: string) => {
            LabelsRepo.toggleLabelFavorite(id);
            refresh();
        },

        reorderLabels: (labelIds: string[]) => {
            LabelsRepo.reorderLabels(labelIds);
            refresh();
        },

        refresh
    };
}