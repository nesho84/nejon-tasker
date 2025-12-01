import { db } from "@/db/database";
import { Task } from "@/types/task.types";
import uuid from "react-native-uuid";

// Get all active tasks
export function getTasks(labelId?: string): Task[] {
    let query = "SELECT * FROM tasks WHERE isDeleted = 0";
    const params: any[] = [];

    if (labelId) {
        query += " AND labelId = ?";
        params.push(labelId);
    }

    query += " ORDER BY order_position ASC";

    const rows = db.getAllSync<any>(query, params);
    return rows.map(row => ({
        ...row,
        order: row.order_position,
        checked: Boolean(row.checked),
        isFavorite: Boolean(row.isFavorite),
        isDeleted: Boolean(row.isDeleted)
    }));
}

// Get checked tasks
export function getCheckedTasks(labelId?: string): Task[] {
    let query = "SELECT * FROM tasks WHERE isDeleted = 0 AND checked = 1";
    const params: any[] = [];

    if (labelId) {
        query += " AND labelId = ?";
        params.push(labelId);
    }

    query += " ORDER BY order_position ASC";

    const rows = db.getAllSync<any>(query, params);
    return rows.map(row => ({
        ...row,
        order: row.order_position,
        checked: Boolean(row.checked),
        isFavorite: Boolean(row.isFavorite),
        isDeleted: Boolean(row.isDeleted)
    }));
}

// Get unchecked tasks
export function getUncheckedTasks(labelId?: string): Task[] {
    let query = "SELECT * FROM tasks WHERE isDeleted = 0 AND checked = 0";
    const params: any[] = [];

    if (labelId) {
        query += " AND labelId = ?";
        params.push(labelId);
    }

    query += " ORDER BY order_position ASC";

    const rows = db.getAllSync<any>(query, params);
    return rows.map(row => ({
        ...row,
        order: row.order_position,
        checked: Boolean(row.checked),
        isFavorite: Boolean(row.isFavorite),
        isDeleted: Boolean(row.isDeleted)
    }));
}

// Get favorite tasks
export function getFavoriteTasks(labelId?: string): Task[] {
    let query = "SELECT * FROM tasks WHERE isDeleted = 0 AND isFavorite = 1";
    const params: any[] = [];

    if (labelId) {
        query += " AND labelId = ?";
        params.push(labelId);
    }

    query += " ORDER BY order_position ASC";

    const rows = db.getAllSync<any>(query, params);
    return rows.map(row => ({
        ...row,
        order: row.order_position,
        checked: Boolean(row.checked),
        isFavorite: Boolean(row.isFavorite),
        isDeleted: Boolean(row.isDeleted)
    }));
}

// Get deleted tasks (trash)
export function getDeletedTasks(): Task[] {
    const rows = db.getAllSync<any>(
        "SELECT * FROM tasks WHERE isDeleted = 1 ORDER BY deletedAt DESC"
    );
    return rows.map(row => ({
        ...row,
        order: row.order_position,
        checked: Boolean(row.checked),
        isFavorite: Boolean(row.isFavorite),
        isDeleted: Boolean(row.isDeleted)
    }));
}

// @TODO: Get All Task Reminders

// Get single task
export function getTask(id: string): Task | null {
    const row = db.getFirstSync<any>("SELECT * FROM tasks WHERE id = ?", [id]);
    if (!row) return null;
    return {
        ...row,
        order: row.order_position,
        checked: Boolean(row.checked),
        isFavorite: Boolean(row.isFavorite),
        isDeleted: Boolean(row.isDeleted)
    };
}

// Create task
export function createTask(data: {
    labelId: string;
    name: string;
    reminderDateTime?: string | null;
}): string {
    const id = uuid.v4();
    const now = new Date().toISOString();

    const maxOrder = db.getFirstSync<{ max: number }>(
        "SELECT MAX(order_position) as max FROM tasks WHERE labelId = ? AND isDeleted = 0",
        [data.labelId]
    );
    const order = (maxOrder?.max ?? -1) + 1;

    db.runSync(
        "INSERT INTO tasks (id, labelId, name, date, checked, order_position, reminderDateTime, reminderId, isFavorite, isDeleted, deletedAt, createdAt, updatedAt) VALUES (?, ?, ?, ?, 0, ?, ?, NULL, 0, 0, NULL, ?, ?)",
        [id, data.labelId, data.name, now, order, data.reminderDateTime || null, now, now]
    );

    return id;
}

// Update task
export function updateTask(id: string, data: {
    name?: string;
    date?: string;
    checked?: boolean;
    reminderDateTime?: string | null;
    reminderId?: string | null;
    isFavorite?: boolean;
}) {
    const existing = getTask(id);
    if (!existing) throw new Error("Task not found");

    const task = { ...existing, ...data, updatedAt: new Date().toISOString() };

    db.runSync(
        "UPDATE tasks SET name = ?, date = ?, checked = ?, reminderDateTime = ?, reminderId = ?, updatedAt = ? WHERE id = ?",
        [
            task.name,
            task.date,
            task.checked ? 1 : 0,
            task.reminderDateTime,
            task.reminderId,
            task.updatedAt,
            id
        ]
    );
}

// Toggle checked
export function toggleTask(id: string) {
    const task = getTask(id);
    if (!task) throw new Error("Task not found");

    db.runSync(
        "UPDATE tasks SET checked = ?, updatedAt = ? WHERE id = ?",
        [task.checked ? 0 : 1, new Date().toISOString(), id]
    );
}

// Toggle favorite
export function toggleTaskFavorite(id: string) {
    const task = getTask(id);
    if (!task) throw new Error("Task not found");

    db.runSync(
        "UPDATE tasks SET isFavorite = ?, updatedAt = ? WHERE id = ?",
        [task.isFavorite ? 0 : 1, new Date().toISOString(), id]
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
    db.runSync(
        "UPDATE tasks SET isDeleted = 0, deletedAt = NULL, updatedAt = ? WHERE id = ?",
        [new Date().toISOString(), id]
    );
}

// Permanent delete
export function deleteTaskPermanently(id: string) {
    db.runSync("DELETE FROM tasks WHERE id = ?", [id]);
}

// Reorder tasks
export function reorderTasks(taskIds: string[]) {
    db.withTransactionSync(() => {
        taskIds.forEach((id, index) => {
            db.runSync(
                "UPDATE tasks SET order_position = ?, updatedAt = ? WHERE id = ?",
                [index, new Date().toISOString(), id]
            );
        });
    });
}