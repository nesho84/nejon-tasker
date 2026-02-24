import { getDB } from "@/db/database";
import { Task } from "@/types/task.types";

// ------------------------------------------------------------
// Load all tasks from database on app startup
// ------------------------------------------------------------
export async function loadAllTasks(): Promise<Task[]> {
    const db = await getDB();
    try {
        const rows = await db.getAllAsync<Task>(
            "SELECT * FROM tasks ORDER BY order_position DESC"
        );
        return rows;
    } catch (error) {
        console.error('Failed to load tasks from database:', error);
        throw error;
    }
}

// ------------------------------------------------------------
// Insert task
// ------------------------------------------------------------
export async function insertTask(task: Task): Promise<void> {
    const db = await getDB();
    try {
        await db.runAsync(
            `INSERT INTO tasks (
                id, labelId, text, date, checked, order_position,
                reminderDateTime, reminderId, isFavorite, isDeleted,
                deletedAt, createdAt, updatedAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                task.id,
                task.labelId,
                task.text,
                task.date,
                task.checked ? 1 : 0,
                task.order_position,
                task.reminderDateTime,
                task.reminderId,
                task.isFavorite ? 1 : 0,
                task.isDeleted ? 1 : 0,
                task.deletedAt,
                task.createdAt,
                task.updatedAt
            ]
        );
    } catch (error) {
        console.error('Failed to insert task:', error);
        throw error;
    }
}

// ------------------------------------------------------------
// Update task
// ------------------------------------------------------------
export async function updateTask(task: Task): Promise<void> {
    const db = await getDB();
    try {
        await db.runAsync(
            `UPDATE tasks SET
                labelId = ?, text = ?, date = ?, checked = ?, order_position = ?,
                reminderDateTime = ?, reminderId = ?, isFavorite = ?,
                isDeleted = ?, deletedAt = ?, updatedAt = ?
            WHERE id = ?`,
            [
                task.labelId,
                task.text,
                task.date,
                task.checked ? 1 : 0,
                task.order_position,
                task.reminderDateTime,
                task.reminderId,
                task.isFavorite ? 1 : 0,
                task.isDeleted ? 1 : 0,
                task.deletedAt,
                task.updatedAt,
                task.id
            ]
        );
    } catch (error) {
        console.error('Failed to update task:', error);
        throw error;
    }
}

// ------------------------------------------------------------
// Permanently delete a task
// ------------------------------------------------------------
export async function deleteTask(id: string): Promise<void> {
    const db = await getDB();
    try {
        await db.runAsync("DELETE FROM tasks WHERE id = ?", [id]);
    } catch (error) {
        console.error('Failed to delete task:', error);
        throw error;
    }
}

// ------------------------------------------------------------
// Reorder tasks
// ------------------------------------------------------------
export async function reorderTasks(taskIds: string[]): Promise<void> {
    const db = await getDB();
    try {
        const now = new Date().toISOString();
        await db.withTransactionAsync(async () => {
            for (let i = 0; i < taskIds.length; i++) {
                await db.runAsync(
                    "UPDATE tasks SET order_position = ?, updatedAt = ? WHERE id = ?",
                    [i, now, taskIds[i]]
                );
            }
        });
    } catch (error) {
        console.error('Failed to reorder tasks:', error);
        throw error;
    }
}