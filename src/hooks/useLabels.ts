import * as LabelsRepo from "@/db/labels.repo";
import { Label } from "@/types/label.types";
import { useCallback, useEffect, useState } from "react";

export function useLabels() {
    const [labels, setLabels] = useState<Label[]>([]);
    const [favoriteLabels, setFavoriteLabels] = useState<Label[]>([]);
    const [deletedLabels, setDeletedLabels] = useState<Label[]>([]);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        // Get active labels - filter in memory for consistency
        const all = LabelsRepo.getLabels();
        setLabels(all);

        // Get global favorites & deleted from separate queries
        setFavoriteLabels(LabelsRepo.getFavoriteLabels());
        setDeletedLabels(LabelsRepo.getDeletedLabels());
    }, [refreshKey]);

    const reloadLabels = useCallback(() => {
        setRefreshKey((prev) => prev + 1);
    }, []);

    return {
        labels,
        favoriteLabels,
        deletedLabels,
        reloadLabels,

        createLabel: (data: { title: string; color: string; category?: string | null }) => {
            LabelsRepo.createLabel(data);
            reloadLabels();
        },

        updateLabel: (id: string, data: { title?: string; color?: string; category?: string | null }) => {
            LabelsRepo.updateLabel(id, data);
            reloadLabels();
        },

        deleteLabel: (id: string) => {
            LabelsRepo.deleteLabel(id);
            reloadLabels();
        },

        restoreLabel: (id: string) => {
            LabelsRepo.restoreLabel(id);
            reloadLabels();
        },

        deleteLabelPermanently: (id: string) => {
            LabelsRepo.deleteLabelPermanently(id);
            reloadLabels();
        },

        toggleFavorite: (id: string) => {
            LabelsRepo.toggleLabelFavorite(id);
            reloadLabels();
        },

        reorderLabels: (labelIds: string[]) => {
            LabelsRepo.reorderLabels(labelIds);
            reloadLabels();
        },
    };
}