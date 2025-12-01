import * as TasksRepo from "@/db/tasks.repo";
import { Task } from "@/types/task.types";
import { useEffect, useState } from "react";

export function useTasks(labelId?: string) {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [checkedTasks, setCheckedTasks] = useState<Task[]>([]);
    const [uncheckedTasks, setUncheckedTasks] = useState<Task[]>([]);
    const [favoriteTasks, setFavoriteTasks] = useState<Task[]>([]);
    const [deletedTasks, setDeletedTasks] = useState<Task[]>([]);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        setTasks(TasksRepo.getTasks(labelId));
        setCheckedTasks(TasksRepo.getCheckedTasks(labelId));
        setUncheckedTasks(TasksRepo.getUncheckedTasks(labelId));
        setFavoriteTasks(TasksRepo.getFavoriteTasks(labelId));

        // Deleted tasks are not label-specific
        if (!labelId) {
            setDeletedTasks(TasksRepo.getDeletedTasks());
        }
    }, [refreshKey, labelId]);

    const refresh = () => setRefreshKey(prev => prev + 1);

    return {
        tasks,
        checkedTasks,
        uncheckedTasks,
        favoriteTasks,
        deletedTasks,

        createTask: (data: { labelId: string; name: string; reminderDateTime?: string | null }) => {
            TasksRepo.createTask(data);
            refresh();
        },

        updateTask: (id: string, data: {
            name?: string;
            date?: string;
            checked?: boolean;
            reminderDateTime?: string | null;
            reminderId?: string | null;
            isFavorite?: boolean;
        }) => {
            TasksRepo.updateTask(id, data);
            refresh();
        },

        toggleTask: (id: string) => {
            TasksRepo.toggleTask(id);
            refresh();
        },

        toggleFavorite: (id: string) => {
            TasksRepo.toggleTaskFavorite(id);
            refresh();
        },

        deleteTask: (id: string) => {
            TasksRepo.deleteTask(id);
            refresh();
        },

        restoreTask: (id: string) => {
            TasksRepo.restoreTask(id);
            refresh();
        },

        deleteTaskPermanently: (id: string) => {
            TasksRepo.deleteTaskPermanently(id);
            refresh();
        },

        reorderTasks: (taskIds: string[]) => {
            TasksRepo.reorderTasks(taskIds);
            refresh();
        },

        refresh
    };
}
