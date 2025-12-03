import * as TasksRepo from "@/db/tasks.repo";
import { Task } from "@/types/task.types";
import { useCallback, useEffect, useState } from "react";

export function useTasks(labelId?: string) {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [checkedTasks, setCheckedTasks] = useState<Task[]>([]);
    const [uncheckedTasks, setUncheckedTasks] = useState<Task[]>([]);
    const [favoriteTasks, setFavoriteTasks] = useState<Task[]>([]);
    const [tasksWithReminders, setTasksWithReminders] = useState<Task[]>([]);
    const [deletedTasks, setDeletedTasks] = useState<Task[]>([]);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        // Get tasks for label (or all if no labelId)
        const all = TasksRepo.getTasks(labelId);

        // Filter in memory for label-specific views
        setTasks(all);
        setCheckedTasks(all.filter((t) => t.checked));
        setUncheckedTasks(all.filter((t) => !t.checked));

        // GLOBAL queries (for separate screens)
        setFavoriteTasks(TasksRepo.getFavoriteTasks());
        setTasksWithReminders(TasksRepo.getTasksWithReminders());
        setDeletedTasks(TasksRepo.getDeletedTasks());
    }, [refreshKey, labelId]);

    const reloadTasks = useCallback(() => {
        setRefreshKey((prev) => prev + 1);
    }, []);

    return {
        tasks,
        checkedTasks,
        uncheckedTasks,
        favoriteTasks,
        tasksWithReminders,
        deletedTasks,
        reloadTasks,

        createTask: (data: { labelId: string; text: string; reminderDateTime?: string | null }) => {
            const id = TasksRepo.createTask(data);
            reloadTasks();
            return id;
        },

        updateTask: (id: string, data: {
            text?: string;
            date?: string;
            checked?: boolean;
            reminderDateTime?: string | null;
            reminderId?: string | null;
            isFavorite?: boolean;
        }) => {
            TasksRepo.updateTask(id, data);
            reloadTasks();
        },

        toggleTask: (id: string) => {
            TasksRepo.toggleTask(id);
            reloadTasks();
        },

        toggleFavorite: (id: string) => {
            TasksRepo.toggleTaskFavorite(id);
            reloadTasks();
        },

        deleteTask: (id: string) => {
            TasksRepo.deleteTask(id);
            reloadTasks();
        },

        restoreTask: (id: string) => {
            TasksRepo.restoreTask(id);
            reloadTasks();
        },

        deleteTaskPermanently: (id: string) => {
            TasksRepo.deleteTaskPermanently(id);
            reloadTasks();
        },

        reorderTasks: (taskIds: string[]) => {
            TasksRepo.reorderTasks(taskIds);
            reloadTasks();
        },
    };
}
