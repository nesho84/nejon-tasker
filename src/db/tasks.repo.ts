import { db } from "@/db/database";
import { TaskRow } from "@/types/db.types";
import { Task } from "@/types/task.types";
import uuid from "react-native-uuid";

/* Mapper */
function mapTask(row: TaskRow): Task {
    return {
        id: row.id,
        labelId: row.labelId,
        name: row.name,
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

// Get all active tasks
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

// Get checked tasks
export function getCheckedTasks(labelId?: string): Task[] {
    // @TODO: Keep for compatibility, but prefer using getTasks + filter in hooks
    let query = "SELECT * FROM tasks WHERE isDeleted = 0 AND checked = 1";
    const params: any[] = [];
    if (labelId) {
        query += " AND labelId = ?";
        params.push(labelId);
    }
    query += " ORDER BY order_position ASC";
    const rows = db.getAllSync<TaskRow>(query, params);
    return rows.map(mapTask);
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
    const rows = db.getAllSync<TaskRow>(query, params);
    return rows.map(mapTask);
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
    const rows = db.getAllSync<TaskRow>(query, params);
    return rows.map(mapTask);
}

// Get deleted tasks (trash)
export function getDeletedTasks(labelId?: string): Task[] {
    let query = "SELECT * FROM tasks WHERE isDeleted = 1";
    const params: any[] = [];
    if (labelId) {
        query += " AND labelId = ?";
        params.push(labelId);
    }
    query += " ORDER BY deletedAt DESC";
    const rows = db.getAllSync<TaskRow>(query, params);
    return rows.map(mapTask);
}

// Get tasks with reminders
export function getTasksWithReminders(labelId?: string): Task[] {
    let query = "SELECT * FROM tasks WHERE isDeleted = 0 AND checked = 0 AND reminderDateTime IS NOT NULL";
    const params: any[] = [];
    if (labelId) {
        query += " AND labelId = ?";
        params.push(labelId);
    }
    query += " ORDER BY reminderDateTime ASC";
    const rows = db.getAllSync<any>(query, params);
    return rows.map(mapTask);
}

// Get single task
export function getTask(id: string): Task | null {
    const row = db.getFirstSync<TaskRow>("SELECT * FROM tasks WHERE id = ?", [id]);
    if (!row) return null;
    return mapTask(row);
}

// Create task
export function createTask(data: { labelId: string; name: string; reminderDateTime?: string | null; }): string {
    if (!data.name || !data.name.trim()) throw new Error("Task name cannot be empty");
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

    const now = new Date().toISOString();
    const task = { ...existing, ...data, updatedAt: now };

    db.runSync(
        "UPDATE tasks SET name = ?, date = ?, checked = ?, reminderDateTime = ?, reminderId = ?, isFavorite = ?, updatedAt = ? WHERE id = ?",
        [
            task.name,
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
    const task = getTask(id);
    const now = new Date().toISOString();
    if (!task) throw new Error("Task not found");
    db.runSync(
        "UPDATE tasks SET checked = ?, updatedAt = ? WHERE id = ?",
        [task.checked ? 0 : 1, now, id]
    );
}

// Toggle favorite
export function toggleTaskFavorite(id: string) {
    const task = getTask(id);
    const now = new Date().toISOString();
    if (!task) throw new Error("Task not found");
    db.runSync(
        "UPDATE tasks SET isFavorite = ?, updatedAt = ? WHERE id = ?",
        [task.isFavorite ? 0 : 1, now, id]
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