import { useLabelStore } from "@/store/labelStore";
import { Task } from "@/types/task.types";
import { useMemo, useState } from "react";

// ------------------------------------------------------------
// Search + label filter state for a task list (Reminders, Favorites, Trash).
// chipLabels = labels that have at least one task in the source list.
// ------------------------------------------------------------
export function useTaskFilter(tasks: Task[]) {
    const labels = useLabelStore((state) => state.labels);

    // Local State
    const [query, setQuery] = useState("");
    const [selectedLabelId, setSelectedLabelId] = useState<string | null>(null);

    // Labels present in this list, in label order
    const chipLabels = useMemo(
        () => labels.filter((l) => tasks.some((t) => t.labelId === l.id)),
        [labels, tasks]
    );

    // Fall back to "All" once the selected label has no tasks left here
    const activeLabelId = chipLabels.some((l) => l.id === selectedLabelId) ? selectedLabelId : null;

    const filteredTasks = useMemo(() => {
        const search = query.trim().toLowerCase();
        return tasks.filter((t) =>
            (activeLabelId === null || t.labelId === activeLabelId)
            && (search === "" || t.text.toLowerCase().includes(search))
        );
    }, [tasks, query, activeLabelId]);

    return {
        query,
        setQuery,
        selectedLabelId: activeLabelId,
        setSelectedLabelId,
        chipLabels,
        filteredTasks,
    };
}
