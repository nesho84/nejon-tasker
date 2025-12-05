import { db } from "@/db/database";
import { Task } from "@/types/task.types";
import uuid from "react-native-uuid";

// Get all active tasks (optionally filtered by label)
export function getTasks(labelId?: string): Task[] {
    let query = "SELECT * FROM tasks WHERE isDeleted = 0";
    const params: any[] = [];

    if (labelId) {
        query += " AND labelId = ?";
        params.push(labelId);
    }

    query += " ORDER BY order_position ASC";
    const rows = db.getAllSync<Task>(query, params);
    return rows;
}

// Get single task by ID
export function getTaskById(id: string): Task | null {
    const row = db.getFirstSync<Task>("SELECT * FROM tasks WHERE id = ?", [id]);
    if (!row) return null;
    return row;
}

// Create new task
export function createTask(data: { labelId: string; text: string; reminderDateTime?: string | null; }): string {
    if (!data.text || !data.text.trim()) throw new Error("Task text cannot be empty");

    const id = uuid.v4();
    const now = new Date().toISOString();

    const maxOrder = db.getFirstSync<{ max: number }>(
        "SELECT MAX(order_position) as max FROM tasks WHERE labelId = ? AND isDeleted = 0",
        [data.labelId]
    );
    const order_position = (maxOrder?.max ?? -1) + 1;

    db.runSync(
        "INSERT INTO tasks (id, labelId, text, date, checked, order_position, reminderDateTime, reminderId, isFavorite, isDeleted, deletedAt, createdAt, updatedAt) VALUES (?, ?, ?, ?, 0, ?, ?, NULL, 0, 0, NULL, ?, ?)",
        [id, data.labelId, data.text, now, order_position, data.reminderDateTime || null, now, now]
    );

    return id;
}

// Update task
export function updateTask(id: string, data: {
    text?: string;
    date?: string;
    checked?: boolean;
    reminderDateTime?: string | null;
    reminderId?: string | null;
    isFavorite?: boolean;
}) {
    const existing = getTaskById(id);
    if (!existing) throw new Error("Task not found");

    const now = new Date().toISOString();
    const task = { ...existing, ...data, updatedAt: now };

    db.runSync(
        "UPDATE tasks SET text = ?, date = ?, checked = ?, reminderDateTime = ?, reminderId = ?, isFavorite = ?, updatedAt = ? WHERE id = ?",
        [
            task.text,
            task.date,
            task.checked ? 1 : 0,
            task.reminderDateTime,
            task.reminderId,
            task.isFavorite ? 1 : 0,
            task.updatedAt,
            id
        ]
    );
}

// Soft delete
export function deleteTask(id: string): void {
    const now = new Date().toISOString();
    db.runSync(
        "UPDATE tasks SET isDeleted = 1, deletedAt = ?, updatedAt = ? WHERE id = ?",
        [now, now, id]
    );
}

// Permanent delete (hard delete)
export function deleteTaskPermanently(id: string): void {
    db.runSync("DELETE FROM tasks WHERE id = ?", [id]);
}

// Get deleted tasks (GLOBAL - for trash screen)
export function getDeletedTasks(): Task[] {
    const rows = db.getAllSync<Task>(
        "SELECT * FROM tasks WHERE isDeleted = 1 ORDER BY deletedAt DESC"
    );
    return rows;
}

// Restore task
export function restoreTask(id: string): void {
    const now = new Date().toISOString();
    db.runSync(
        "UPDATE tasks SET isDeleted = 0, deletedAt = NULL, updatedAt = ? WHERE id = ?",
        [now, id]
    );
}

// Toggle checked
export function toggleTask(id: string): void {
    const now = new Date().toISOString();
    db.runSync(
        `UPDATE tasks SET checked = CASE checked WHEN 1 THEN 0 ELSE 1 END, updatedAt = ? WHERE id = ?`,
        [now, id]
    );
}

// Reorder tasks
export function reorderTasks(taskIds: string[]): void {
    const now = new Date().toISOString();
    db.withTransactionSync(() => {
        taskIds.forEach((id, index) => {
            db.runSync(
                "UPDATE tasks SET order_position = ?, updatedAt = ? WHERE id = ?",
                [index, now, id]
            );
        });
    });
}

// Get favorite tasks (GLOBAL - for favorites screen)
export function getFavoriteTasks(): Task[] {
    const rows = db.getAllSync<Task>(
        "SELECT * FROM tasks WHERE isDeleted = 0 AND isFavorite = 1 ORDER BY order_position ASC"
    );
    return rows;
}

// Toggle favorite
export function toggleTaskFavorite(id: string): void {
    const now = new Date().toISOString();
    db.runSync(
        `UPDATE tasks SET isFavorite = CASE isFavorite WHEN 1 THEN 0 ELSE 1 END, updatedAt = ? WHERE id = ?`,
        [now, id]
    );
}

// Get tasks with reminders (GLOBAL - for reminders screen)
export function getTasksWithReminders(): Task[] {
    const rows = db.getAllSync<Task>(
        "SELECT * FROM tasks WHERE isDeleted = 0 AND checked = 0 AND reminderDateTime IS NOT NULL ORDER BY reminderDateTime ASC"
    );
    return rows;
}