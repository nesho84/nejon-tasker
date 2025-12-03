import { db } from "@/db/database";
import { TaskRow } from "@/types/db.types";
import { Task } from "@/types/task.types";
import uuid from "react-native-uuid";

/* Mapper */
function mapTask(row: TaskRow): Task {
    return {
        id: row.id,
        labelId: row.labelId,
        text: row.text,
        date: row.date,
        checked: Boolean(row.checked),
        order_position: row.order_position,
        reminderDateTime: row.reminderDateTime,
        reminderId: row.reminderId,
        isFavorite: Boolean(row.isFavorite),
        isDeleted: Boolean(row.isDeleted),
        deletedAt: row.deletedAt,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt
    };
}

// Get active tasks (optionally filtered by label)
export function getTasks(labelId?: string): Task[] {
    let query = "SELECT * FROM tasks WHERE isDeleted = 0";
    const params: any[] = [];

    if (labelId) {
        query += " AND labelId = ?";
        params.push(labelId);
    }

    query += " ORDER BY order_position ASC";
    const rows = db.getAllSync<TaskRow>(query, params);
    return rows.map(mapTask);
}

// Get favorite tasks (GLOBAL - for favorites screen)
export function getFavoriteTasks(): Task[] {
    const rows = db.getAllSync<TaskRow>(
        "SELECT * FROM tasks WHERE isDeleted = 0 AND isFavorite = 1 ORDER BY order_position ASC"
    );
    return rows.map(mapTask);
}

// Get deleted tasks (GLOBAL - for trash screen)
export function getDeletedTasks(): Task[] {
    const rows = db.getAllSync<TaskRow>(
        "SELECT * FROM tasks WHERE isDeleted = 1 ORDER BY deletedAt DESC"
    );
    return rows.map(mapTask);
}

// Get tasks with reminders (GLOBAL - for reminders screen)
export function getTasksWithReminders(): Task[] {
    const rows = db.getAllSync<TaskRow>(
        "SELECT * FROM tasks WHERE isDeleted = 0 AND checked = 0 AND reminderDateTime IS NOT NULL ORDER BY reminderDateTime ASC"
    );
    return rows.map(mapTask);
}

// Get single task
export function getTask(id: string): Task | null {
    const row = db.getFirstSync<TaskRow>("SELECT * FROM tasks WHERE id = ?", [id]);
    if (!row) return null;
    return mapTask(row);
}

// Create task
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
    const existing = getTask(id);
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

// Toggle checked
export function toggleTask(id: string) {
    const now = new Date().toISOString();
    db.runSync(
        `UPDATE tasks SET checked = CASE checked WHEN 1 THEN 0 ELSE 1 END, updatedAt = ? WHERE id = ?`,
        [now, id]
    );
}

// Toggle favorite
export function toggleTaskFavorite(id: string) {
    const now = new Date().toISOString();
    db.runSync(
        `UPDATE tasks SET isFavorite = CASE isFavorite WHEN 1 THEN 0 ELSE 1 END, updatedAt = ? WHERE id = ?`,
        [now, id]
    );
}

// Soft delete
export function deleteTask(id: string) {
    const now = new Date().toISOString();
    db.runSync(
        "UPDATE tasks SET isDeleted = 1, deletedAt = ?, updatedAt = ? WHERE id = ?",
        [now, now, id]
    );
}

// Restore from trash
export function restoreTask(id: string) {
    const now = new Date().toISOString();
    db.runSync(
        "UPDATE tasks SET isDeleted = 0, deletedAt = NULL, updatedAt = ? WHERE id = ?",
        [now, id]
    );
}

// Permanent delete
export function deleteTaskPermanently(id: string) {
    db.runSync("DELETE FROM tasks WHERE id = ?", [id]);
}

// Reorder tasks
export function reorderTasks(taskIds: string[]) {
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